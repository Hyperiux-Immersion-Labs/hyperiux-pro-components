/**
 * Bakes the tileable noise atlas used by the SoulVeil corner veil.
 *
 * The veil needs three DECORRELATED noise fields: one to carry the density,
 * and two to drive the domain-warp vector. Sampling a single field at three
 * offsets does not work -- the octaves stay correlated and the warp pulls the
 * density field along with itself, which flattens the tendrils back into
 * round lobes. So each channel gets its own seed:
 *
 *   R  density fBm   4 octaves, base 4 cells
 *   G  warp X        3 octaves, base 3 cells
 *   B  warp Y        3 octaves, base 3 cells
 *
 * Every field is GRADIENT (Perlin) noise, not value noise, and no octave is
 * ridged. That combination is the whole point of this bake: ridged noise
 * (`abs(n * 2 - 1)`) creases wherever the field crosses its midpoint, and
 * value noise on a coarse lattice pins its extrema to lattice points. Both
 * read as hard filaments and lumps once the shader stretches the map through
 * log-polar space. Perlin noise has no creases and its extrema sit between
 * lattice points, so the veil stays soft the way smoke is soft.
 *
 * Octave counts are deliberately low. The shader already samples R at three
 * anisotropic scales, so detail baked in here gets multiplied -- the map only
 * needs to supply the large lobes and let the shader build the rest.
 *
 * The lattice wraps at N cells across the full image, so the map tiles
 * seamlessly at every octave.
 *
 * Run: node apps/docs/scripts/bake-veil-noise.mjs
 */

import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const SIZE = 1024
const OUT = join(dirname(fileURLToPath(import.meta.url)), '../public/assets/textures/mask-noise.png')

/** Integer hash -> [0,1). Wraps lattice coords so every octave tiles. */
const hash = (ix, iy, n, seed) => {
  let h = ((ix % n) + n) % n
  let v = ((iy % n) + n) % n
  let x = h * 374761393 + v * 668265263 + seed * 1442695040888963407
  x = Number(BigInt.asUintN(32, BigInt(Math.trunc(x))))
  x ^= x >>> 13
  x = Math.imul(x, 1274126177) >>> 0
  x ^= x >>> 16
  return x / 4294967296
}

/** Quintic fade -- C2 continuous, so no lattice creases show at the edge. */
const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10)
const lerp = (a, b, t) => a + (b - a) * t

/**
 * Tileable gradient (Perlin) noise sampled in [0,1) UV space, `n` cells
 * across. Each lattice point gets a unit vector from the hash; the value is
 * the quintic-faded blend of the four corner dot products, so it is zero at
 * every lattice point and C2 across cell boundaries. Range is roughly
 * [-0.707, 0.707].
 */
const gradientNoise = (u, v, n, seed) => {
  const x = u * n
  const y = v * n
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy

  const dot = (cx, cy) => {
    const angle = hash(ix + cx, iy + cy, n, seed) * Math.PI * 2
    return Math.cos(angle) * (fx - cx) + Math.sin(angle) * (fy - cy)
  }

  const sx = fade(fx)
  const sy = fade(fy)

  return lerp(
    lerp(dot(0, 0), dot(1, 0), sx),
    lerp(dot(0, 1), dot(1, 1), sx),
    sy,
  )
}

/**
 * fBm: lacunarity 2, gain 0.5, remapped from the signed gradient-noise range
 * into [0,1] around a 0.5 midpoint. The 0.707 factor is the 2D Perlin bound,
 * so the result fills the byte range without ever clipping flat -- clipped
 * plateaus would show up as hard-edged blobs in the veil.
 */
const fbm = (u, v, base, octaves, seed) => {
  let sum = 0
  let amp = 0.5
  let norm = 0
  let n = base

  for (let o = 0; o < octaves; o += 1) {
    sum += gradientNoise(u, v, n, seed + o * 7919) * amp
    norm += amp
    amp *= 0.5
    n *= 2
  }

  return 0.5 + (sum / norm) * 0.707
}

const FIELDS = [
  { base: 4, octaves: 4, seed: 1 },     // R density
  { base: 3, octaves: 3, seed: 20011 }, // G warp x
  { base: 3, octaves: 3, seed: 40013 }, // B warp y
]

const CHANNELS = FIELDS.length

// ---- rasterise -----------------------------------------------------------

const field = new Float32Array(SIZE * SIZE * CHANNELS)
const lo = new Array(CHANNELS).fill(Infinity)
const hi = new Array(CHANNELS).fill(-Infinity)

for (let y = 0; y < SIZE; y += 1) {
  const v = y / SIZE
  for (let x = 0; x < SIZE; x += 1) {
    const u = x / SIZE
    const i = (y * SIZE + x) * CHANNELS
    for (let c = 0; c < CHANNELS; c += 1) {
      const f = FIELDS[c]
      const n = fbm(u, v, f.base, f.octaves, f.seed)
      field[i + c] = n
      if (n < lo[c]) lo[c] = n
      if (n > hi[c]) hi[c] = n
    }
  }
}

/**
 * Stretch each channel to the full byte range. Summing octaves pulls fBm
 * toward its midpoint -- these fields only span about 0.19..0.77 raw, so
 * quantising them directly throws away 40% of the available precision and
 * leaves the shader's `edgeChaos` with too little signal to bite on. The
 * stretch is linear between the true extrema, so nothing clips: a percentile
 * stretch would flatten the peaks into plateaus and those read as hard blobs.
 */
const pixels = Buffer.alloc(SIZE * SIZE * CHANNELS)

for (let i = 0; i < field.length; i += 1) {
  const c = i % CHANNELS
  const normalised = (field[i] - lo[c]) / (hi[c] - lo[c])
  pixels[i] = Math.max(0, Math.min(255, Math.round(normalised * 255)))
}

// ---- encode PNG ----------------------------------------------------------

const crcTable = Array.from({ length: 256 }, (_, i) => {
  let c = i
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

const crc32 = (buf) => {
  let c = 0xffffffff
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(SIZE, 0)
ihdr.writeUInt32BE(SIZE, 4)
ihdr[8] = 8   // bit depth
ihdr[9] = 2   // colour type RGB -- no alpha channel is needed
// 10,11,12 = compression/filter/interlace, all 0

/**
 * Adaptive per-scanline PNG filtering. fBm is smooth, so a difference filter
 * leaves near-zero residuals that deflate compresses hard -- storing the raw
 * bytes instead roughly doubles the file. The heuristic (pick the filter with
 * the smallest sum of absolute residuals) is the one from the PNG spec.
 */
const paeth = (a, b, c) => {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c
}

const STRIDE = SIZE * CHANNELS
const raw = Buffer.alloc(SIZE * (STRIDE + 1))

for (let y = 0; y < SIZE; y += 1) {
  const row = pixels.subarray(y * STRIDE, (y + 1) * STRIDE)
  const prev = y > 0 ? pixels.subarray((y - 1) * STRIDE, y * STRIDE) : null

  let best = null
  let bestScore = Infinity

  for (let type = 0; type < 5; type += 1) {
    const out = Buffer.alloc(STRIDE)
    let score = 0

    for (let i = 0; i < STRIDE; i += 1) {
      const a = i >= CHANNELS ? row[i - CHANNELS] : 0
      const b = prev ? prev[i] : 0
      const c = prev && i >= CHANNELS ? prev[i - CHANNELS] : 0
      let v
      if (type === 0) v = row[i]
      else if (type === 1) v = row[i] - a
      else if (type === 2) v = row[i] - b
      else if (type === 3) v = row[i] - ((a + b) >> 1)
      else v = row[i] - paeth(a, b, c)
      out[i] = v & 0xff
      score += Math.min(out[i], 256 - out[i])
    }

    if (score < bestScore) {
      bestScore = score
      best = { type, out }
    }
  }

  raw[y * (STRIDE + 1)] = best.type
  best.out.copy(raw, y * (STRIDE + 1) + 1)
}

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
])

writeFileSync(OUT, png)
console.log(`wrote ${OUT} (${SIZE}x${SIZE}, ${(png.length / 1024).toFixed(0)} KB)`)
