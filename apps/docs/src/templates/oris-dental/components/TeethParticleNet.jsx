'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const TAU = Math.PI * 2

const wrapPi = (a) => {
    let v = a
    while (v > Math.PI) v -= TAU
    while (v < -Math.PI) v += TAU
    return v
}

/**
 * Samples the model into a cylindrical (angle x height) radius field.
 *
 * The GLB is ~300k triangles, so nothing here touches it per frame. The field
 * is baked once and becomes an analytic surface the particles can be pinned to:
 * every particle lives in (theta, y) space, which is why it can never leave the
 * tooth no matter how hard the cursor pushes it.
 */
function buildSurfaceField(root, segU, segV) {
    root.updateWorldMatrix(true, true)

    const meshes = []
    root.traverse((child) => {
        if (child.isMesh && child.geometry?.attributes?.position) meshes.push(child)
    })
    if (!meshes.length) return null

    const toLocal = new THREE.Matrix4().copy(root.matrixWorld).invert()
    const matrices = meshes.map((mesh) => new THREE.Matrix4().multiplyMatrices(toLocal, mesh.matrixWorld))

    const v = new THREE.Vector3()
    const min = new THREE.Vector3(Infinity, Infinity, Infinity)
    const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity)

    for (let m = 0; m < meshes.length; m++) {
        const pos = meshes[m].geometry.attributes.position
        for (let i = 0; i < pos.count; i++) {
            v.fromBufferAttribute(pos, i).applyMatrix4(matrices[m])
            min.min(v)
            max.max(v)
        }
    }

    const height = Math.max(max.y - min.y, 1e-5)
    const cx = (min.x + max.x) / 2
    const cz = (min.z + max.z) / 2

    const cells = new Float32Array(segU * segV)
    const at = (i, j) => j * segU + i

    for (let m = 0; m < meshes.length; m++) {
        const pos = meshes[m].geometry.attributes.position
        for (let i = 0; i < pos.count; i++) {
            v.fromBufferAttribute(pos, i).applyMatrix4(matrices[m])
            const r = Math.hypot(v.x - cx, v.z - cz)

            let u = Math.floor(((Math.atan2(v.z - cz, v.x - cx) + Math.PI) / TAU) * segU)
            let w = Math.floor(((v.y - min.y) / height) * segV)
            u = Math.min(segU - 1, Math.max(0, u))
            w = Math.min(segV - 1, Math.max(0, w))

            const k = at(u, w)
            if (r > cells[k]) cells[k] = r
        }
    }

    // Cells no vertex landed in (the tapering cusps) are interpolated from their
    // neighbours. Measured cells keep their exact radius, so hard steps such as
    // the metal collar under the crown are not rounded away.
    const measured = new Uint8Array(segU * segV)
    for (let k = 0; k < cells.length; k++) measured[k] = cells[k] > 0 ? 1 : 0

    for (let pass = 0; pass < 8; pass++) {
        const src = cells.slice()
        for (let j = 0; j < segV; j++) {
            for (let i = 0; i < segU; i++) {
                if (src[at(i, j)] > 0) continue
                let sum = 0
                let n = 0
                const neighbours = [
                    src[at((i + 1) % segU, j)],
                    src[at((i - 1 + segU) % segU, j)],
                    src[at(i, Math.min(j + 1, segV - 1))],
                    src[at(i, Math.max(j - 1, 0))],
                ]
                for (const value of neighbours) {
                    if (value > 0) {
                        sum += value
                        n++
                    }
                }
                if (n) cells[at(i, j)] = sum / n
            }
        }
    }

    for (let pass = 0; pass < 2; pass++) {
        const src = cells.slice()
        for (let j = 0; j < segV; j++) {
            for (let i = 0; i < segU; i++) {
                if (measured[at(i, j)]) continue
                cells[at(i, j)] =
                    (src[at(i, j)] * 2 +
                        src[at((i + 1) % segU, j)] +
                        src[at((i - 1 + segU) % segU, j)] +
                        src[at(i, Math.min(j + 1, segV - 1))] +
                        src[at(i, Math.max(j - 1, 0))]) /
                    6
            }
        }
    }

    const clamp = (x, lo, hi) => (x < lo ? lo : x > hi ? hi : x)

    // Bilinear read of the field, wrapping around the angle axis
    const radiusAt = (theta, y) => {
        const fu = ((wrapPi(theta) + Math.PI) / TAU) * segU - 0.5
        const fv = ((y - min.y) / height) * segV - 0.5

        const i0 = Math.floor(fu)
        const j0 = Math.floor(fv)
        const tu = fu - i0
        const tv = fv - j0

        const iA = ((i0 % segU) + segU) % segU
        const iB = (iA + 1) % segU
        const jA = clamp(j0, 0, segV - 1)
        const jB = clamp(j0 + 1, 0, segV - 1)

        const r00 = cells[at(iA, jA)]
        const r10 = cells[at(iB, jA)]
        const r01 = cells[at(iA, jB)]
        const r11 = cells[at(iB, jB)]

        return (r00 * (1 - tu) + r10 * tu) * (1 - tv) + (r01 * (1 - tu) + r11 * tu) * tv
    }

    const size = Math.max(max.x - min.x, height, max.z - min.z)
    const midY = (min.y + max.y) / 2
    const dTheta = TAU / segU
    const dY = height / segV

    // True surface normal from the gradient of the radius field. Offsetting
    // along this instead of straight outwards matters near the cusps, where the
    // surface tips over and the radial direction is nearly tangent to it.
    const normalAt = (theta, y, out) => {
        const r = radiusAt(theta, y)
        const rTheta = (radiusAt(theta + dTheta, y) - radiusAt(theta - dTheta, y)) / (2 * dTheta)
        const rY = (radiusAt(theta, y + dY) - radiusAt(theta, y - dY)) / (2 * dY)

        const cosT = Math.cos(theta)
        const sinT = Math.sin(theta)

        // dP/dtheta and dP/dy of P(theta, y) = (cx + r cos, y, cz + r sin)
        const ax = rTheta * cosT - r * sinT
        const az = rTheta * sinT + r * cosT
        const bx = rY * cosT
        const bz = rY * sinT

        let nx = az
        let ny = bz * ax - bx * az
        let nz = -ax
        const len = Math.hypot(nx, ny, nz) || 1
        nx /= len
        ny /= len
        nz /= len

        // Face away from the core of the model
        if (nx * r * cosT + ny * (y - midY) + nz * r * sinT < 0) {
            nx = -nx
            ny = -ny
            nz = -nz
        }

        out[0] = nx
        out[1] = ny
        out[2] = nz
        return out
    }

    return { radiusAt, normalAt, min, max, height, cx, cz, size, segU, segV, cells, at }
}

/** Low poly shell of the same field — invisible, used only as a raycast target. */
function buildProxyGeometry(field, segU, segV) {
    const { radiusAt, min, height, cx, cz } = field
    const positions = []

    const point = (i, j) => {
        const theta = -Math.PI + (i / segU) * TAU
        const y = min.y + (j / segV) * height
        const r = radiusAt(theta, y)
        return [cx + Math.cos(theta) * r, y, cz + Math.sin(theta) * r]
    }

    for (let j = 0; j < segV; j++) {
        for (let i = 0; i < segU; i++) {
            const a = point(i, j)
            const b = point(i + 1, j)
            const c = point(i + 1, j + 1)
            const d = point(i, j + 1)
            positions.push(...a, ...c, ...b, ...a, ...d, ...c)
        }
    }

    // Caps. Without them a ray aimed at the top of the crown would fall straight
    // into the open tube and exit through a culled backface, losing the cursor.
    const apex = [cx, min.y + height, cz]
    const base = [cx, min.y, cz]
    for (let i = 0; i < segU; i++) {
        const a = point(i, segV)
        const b = point(i + 1, segV)
        positions.push(...apex, ...b, ...a)
        const c = point(i, 0)
        const d = point(i + 1, 0)
        positions.push(...base, ...c, ...d)
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
    geometry.computeVertexNormals()
    geometry.computeBoundingSphere()
    return geometry
}

/**
 * Bowyer-Watson Delaunay triangulation.
 *
 * Runs on the particles in surface coordinates so the network is a real mesh:
 * every edge that gets drawn belongs to a closed triangle, no dangling links.
 */
function delaunay(px, py, n) {
    if (n < 3) return []

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (let i = 0; i < n; i++) {
        if (px[i] < minX) minX = px[i]
        if (px[i] > maxX) maxX = px[i]
        if (py[i] < minY) minY = py[i]
        if (py[i] > maxY) maxY = py[i]
    }

    const dmax = Math.max(maxX - minX, maxY - minY) || 1
    const midX = (minX + maxX) / 2
    const midY = (minY + maxY) / 2

    // Super triangle vertices live at indices n, n + 1, n + 2
    const sx = [midX - 20 * dmax, midX, midX + 20 * dmax]
    const sy = [midY - dmax, midY + 20 * dmax, midY - dmax]
    const X = (i) => (i < n ? px[i] : sx[i - n])
    const Y = (i) => (i < n ? py[i] : sy[i - n])

    const tri = [n, n + 1, n + 2]
    const circ = []

    const circumcircle = (a, b, c) => {
        const ax = X(a), ay = Y(a)
        const bx = X(b), by = Y(b)
        const cx = X(c), cy = Y(c)
        const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by))
        if (Math.abs(d) < 1e-14) return [0, 0, Infinity]
        const a2 = ax * ax + ay * ay
        const b2 = bx * bx + by * by
        const c2 = cx * cx + cy * cy
        const ux = (a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / d
        const uy = (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / d
        return [ux, uy, (ax - ux) * (ax - ux) + (ay - uy) * (ay - uy)]
    }

    circ.push(circumcircle(n, n + 1, n + 2))

    const edges = []
    for (let i = 0; i < n; i++) {
        const x = px[i]
        const y = py[i]
        edges.length = 0

        for (let t = tri.length / 3 - 1; t >= 0; t--) {
            const [ux, uy, r2] = circ[t]
            const dx = x - ux
            const dy = y - uy
            if (dx * dx + dy * dy >= r2) continue

            const o = t * 3
            edges.push(tri[o], tri[o + 1], tri[o + 1], tri[o + 2], tri[o + 2], tri[o])
            tri.splice(o, 3)
            circ.splice(t, 1)
        }

        // Only edges on the boundary of the hole survive
        for (let e = 0; e < edges.length; e += 2) {
            const a = edges[e]
            const b = edges[e + 1]
            if (a < 0) continue
            let shared = false
            for (let f = e + 2; f < edges.length; f += 2) {
                if ((edges[f] === a && edges[f + 1] === b) || (edges[f] === b && edges[f + 1] === a)) {
                    edges[f] = -1
                    shared = true
                }
            }
            if (shared) continue
            tri.push(a, b, i)
            circ.push(circumcircle(a, b, i))
        }
    }

    // Drop anything still touching the super triangle
    const out = []
    for (let t = 0; t < tri.length; t += 3) {
        if (tri[t] >= n || tri[t + 1] >= n || tri[t + 2] >= n) continue
        out.push(tri[t], tri[t + 1], tri[t + 2])
    }
    return out
}

const lineVertex = /* glsl */ `
    attribute float aAlpha;
    varying float vAlpha;

    void main() {
        vAlpha = aAlpha;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`

const lineFragment = /* glsl */ `
    uniform vec3 uColor;
    varying float vAlpha;

    void main() {
        if (vAlpha <= 0.002) discard;
        gl_FragColor = vec4(uColor, vAlpha);
    }
`

const pointVertex = /* glsl */ `
    attribute float aAlpha;
    uniform float uSize;
    varying float vAlpha;

    void main() {
        vAlpha = aAlpha;
        // Constant screen size, exactly like a 2D particle field.
        gl_PointSize = uSize;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`

const pointFragment = /* glsl */ `
    uniform vec3 uColor;
    varying float vAlpha;

    void main() {
        if (vAlpha <= 0.002) discard;
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        gl_FragColor = vec4(uColor, vAlpha * smoothstep(0.5, 0.26, d));
    }
`

/**
 * Triangulated particle network living on the crown of the tooth.
 *
 * The mesh only shows up inside a radius around the cursor, and the cursor also
 * repulses the particles — but every particle is addressed in (angle, height)
 * surface coordinates, so all of the motion slides across the enamel instead of
 * lifting off it.
 */
export default function TeethParticleNet({
    source,
    count = 150,
    // Vertical band of the model the network covers, 0 = base of the screw, 1 = top of the crown
    bandStart = 0.56,
    bandEnd = 0.985,
    speed = 0.016,
    maxEdge = 0.13,
    revealRadius = 0.3,
    linkOpacity = 0.75,
    particleOpacity = 0.95,
    pointSize = 2.4,
    repulseRadius = 0.17,
    repulseStrength = 0.05,
    // Idle behaviour: soft patches that wander the visible side on their own
    ambientCount = 3,
    ambientStrength = 0.6,
    ambientRadius = 0.2,
    ambientHold = 2.6,
    idleDelay = 900,
    retriangulateEvery = 3,
    lift = 0.012,
    color = '#D4E2FC',
    fieldSegmentsU = 96,
    fieldSegmentsV = 128,
}) {
    const proxyRef = useRef()
    const pointerMoved = useRef(false)
    const lastMoveAt = useRef(0)

    const field = useMemo(
        () => buildSurfaceField(source, fieldSegmentsU, fieldSegmentsV),
        [source, fieldSegmentsU, fieldSegmentsV],
    )

    const scene = useMemo(() => {
        if (!field) return null

        const { size, min, height } = field
        const yLow = min.y + bandStart * height
        const yHigh = min.y + bandEnd * height
        const worldSpeed = speed * size
        const maxLinks = count * 4

        const particles = []
        for (let i = 0; i < count; i++) {
            particles.push({
                theta: Math.random() * TAU - Math.PI,
                y: yLow + Math.random() * (yHigh - yLow),
                heading: Math.random() * TAU,
                rate: worldSpeed * (0.5 + Math.random()),
                offTheta: 0,
                offY: 0,
                x: 0,
                py: 0,
                z: 0,
                r: 0,
                reveal: 0,
            })
        }

        const lineGeometry = new THREE.BufferGeometry()
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxLinks * 6), 3))
        lineGeometry.setAttribute('aAlpha', new THREE.BufferAttribute(new Float32Array(maxLinks * 2), 1))
        lineGeometry.setDrawRange(0, 0)

        const pointGeometry = new THREE.BufferGeometry()
        pointGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
        pointGeometry.setAttribute('aAlpha', new THREE.BufferAttribute(new Float32Array(count), 1))

        const bounds = new THREE.Sphere(new THREE.Vector3(field.cx, (min.y + field.max.y) / 2, field.cz), size)
        lineGeometry.boundingSphere = bounds
        pointGeometry.boundingSphere = bounds.clone()

        const shared = {
            transparent: true,
            depthWrite: false,
            depthTest: true,
            blending: THREE.NormalBlending,
        }

        const lineMaterial = new THREE.ShaderMaterial({
            ...shared,
            vertexShader: lineVertex,
            fragmentShader: lineFragment,
            uniforms: { uColor: { value: new THREE.Color(color) } },
        })

        const pointMaterial = new THREE.ShaderMaterial({
            ...shared,
            vertexShader: pointVertex,
            fragmentShader: pointFragment,
            uniforms: { uColor: { value: new THREE.Color(color) }, uSize: { value: pointSize } },
        })

        return {
            particles,
            yLow,
            yHigh,
            maxLinks,
            maxEdgeWorld: maxEdge * size,
            revealWorld: revealRadius * size,
            lift: lift * size,
            repulse: repulseRadius * size,
            push: repulseStrength * size,
            lineGeometry,
            pointGeometry,
            lineMaterial,
            pointMaterial,
            proxy: buildProxyGeometry(field, 64, 96),
            // Scratch buffers for the per frame triangulation
            tx: new Float64Array(count),
            ty: new Float64Array(count),
            triangles: [],
            frame: 0,
            normal: new Float64Array(3),
            ambientWeight: 0,
            blobs: Array.from({ length: ambientCount }, () => ({
                theta: 0,
                y: 0,
                x: 0,
                z: 0,
                r: 0,
                drift: 0,
                life: 0,
                ttl: 1,
                env: 0,
                seeded: false,
            })),
        }
    }, [
        field,
        count,
        bandStart,
        bandEnd,
        speed,
        maxEdge,
        revealRadius,
        pointSize,
        repulseRadius,
        repulseStrength,
        ambientCount,
        ambientRadius,
        ambientHold,
        lift,
        color,
    ])

    useEffect(() => {
        return () => {
            if (!scene) return
            scene.lineGeometry.dispose()
            scene.pointGeometry.dispose()
            scene.lineMaterial.dispose()
            scene.pointMaterial.dispose()
            scene.proxy.dispose()
        }
    }, [scene])

    useEffect(() => {
        const onMove = () => {
            pointerMoved.current = true
            lastMoveAt.current = performance.now()
        }
        window.addEventListener('pointermove', onMove, { passive: true })
        return () => window.removeEventListener('pointermove', onMove)
    }, [])

    const cursor = useRef({ theta: 0, y: 0, x: 0, z: 0 })
    const localHit = useRef(new THREE.Vector3())

    useFrame((state, rawDelta) => {
        if (!scene || !field) return
        const delta = Math.min(rawDelta, 1 / 30)

        const { particles, yLow, yHigh, maxLinks, maxEdgeWorld, revealWorld, lift: liftAmount, repulse, push } = scene
        const { radiusAt, normalAt, cx, cz, size } = field
        const nrm = scene.normal
        const ambientWorld = ambientRadius * size

        // Cursor position on the surface, found against the invisible low poly proxy
        const proxy = proxyRef.current

        // Angle of the model that currently faces the camera. Idle patches are
        // seeded around it so they always surface where they can be seen.
        let facingTheta = 0
        if (proxy) {
            localHit.current.copy(state.camera.position)
            proxy.worldToLocal(localHit.current)
            facingTheta = Math.atan2(localHit.current.z - cz, localHit.current.x - cx)
        }

        let active = false
        if (proxy && pointerMoved.current) {
            state.raycaster.setFromCamera(state.pointer, state.camera)
            const hit = state.raycaster.intersectObject(proxy, false)[0]
            if (hit) {
                localHit.current.copy(hit.point)
                proxy.worldToLocal(localHit.current)
                cursor.current.theta = Math.atan2(localHit.current.z - cz, localHit.current.x - cx)
                cursor.current.y = localHit.current.y
                cursor.current.x = localHit.current.x
                cursor.current.z = localHit.current.z
                active = true
            }
        }

        // With the pointer at rest the network reveals itself in small drifting
        // patches instead of going completely dark.
        const idle = !pointerMoved.current || performance.now() - lastMoveAt.current > idleDelay
        scene.ambientWeight += ((idle ? 1 : 0) - scene.ambientWeight) * Math.min(1, delta * 2.2)

        const blobs = scene.blobs
        for (let k = 0; k < blobs.length; k++) {
            const blob = blobs[k]
            blob.life += delta
            if (!blob.seeded || blob.life > blob.ttl) {
                blob.theta = wrapPi(facingTheta + (Math.random() * 2 - 1) * 1.1)
                blob.y = yLow + Math.random() * (yHigh - yLow)
                blob.ttl = ambientHold * (0.7 + Math.random() * 0.6)
                blob.life = blob.seeded ? 0 : Math.random() * blob.ttl
                blob.drift = (Math.random() * 2 - 1) * 0.22 * size
                blob.seeded = true
            }
            const rb = Math.max(radiusAt(blob.theta, blob.y), 1e-4)
            blob.theta = wrapPi(blob.theta + (blob.drift * delta) / rb)
            blob.x = cx + Math.cos(blob.theta) * rb
            blob.z = cz + Math.sin(blob.theta) * rb
            blob.r = rb
            // Fade all the way in and back out across the patch's lifetime
            blob.env = Math.sin(Math.PI * Math.min(1, blob.life / blob.ttl)) * scene.ambientWeight
        }

        const pivotTheta = active ? cursor.current.theta : facingTheta

        const pointPos = scene.pointGeometry.attributes.position
        const pointAlpha = scene.pointGeometry.attributes.aAlpha
        const linePos = scene.lineGeometry.attributes.position
        const lineAlpha = scene.lineGeometry.attributes.aAlpha
        const ease = Math.min(1, delta * 7)

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i]

            // Drift across the surface. The radius only converts a tangential
            // step into an angle, so the particle stays welded to the enamel.
            const r = Math.max(radiusAt(p.theta, p.y), 1e-4)
            p.theta = wrapPi(p.theta + (Math.cos(p.heading) * p.rate * delta) / r)
            p.y += Math.sin(p.heading) * p.rate * delta

            if (p.y < yLow) {
                p.y = yLow
                p.heading = -p.heading
            } else if (p.y > yHigh) {
                p.y = yHigh
                p.heading = -p.heading
            }

            let wantTheta = 0
            let wantY = 0
            let reveal = 0

            const rr = radiusAt(p.theta, p.y)
            const sx = cx + Math.cos(p.theta) * rr
            const sz = cz + Math.sin(p.theta) * rr

            // Idle patches. They only reveal, they never push the particles.
            for (let k = 0; k < blobs.length; k++) {
                const blob = blobs[k]
                if (blob.env <= 0.002) continue
                const d = Math.hypot(sx - blob.x, p.y - blob.y, sz - blob.z)
                if (d >= ambientWorld) continue
                const t = 1 - d / ambientWorld
                const value = t * t * (3 - 2 * t) * blob.env * ambientStrength
                if (value > reveal) reveal = value
            }

            if (active) {
                const dist = Math.hypot(sx - cursor.current.x, p.y - cursor.current.y, sz - cursor.current.z)

                // The network is fully present inside the cursor's radius
                if (dist < revealWorld) {
                    const t = 1 - dist / revealWorld
                    const value = t * t * (3 - 2 * t)
                    if (value > reveal) reveal = value
                }

                // Repulsion, resolved in surface coordinates
                if (dist < repulse) {
                    const falloff = 1 - dist / repulse
                    const force = falloff * falloff
                    const dTheta = wrapPi(p.theta - cursor.current.theta)
                    const arc = dTheta * rr
                    const dY = p.y - cursor.current.y
                    const len = Math.hypot(arc, dY) || 1

                    wantTheta = ((arc / len) * push * force) / rr
                    wantY = (dY / len) * push * force
                }
            }

            p.offTheta += (wantTheta - p.offTheta) * ease
            p.offY += (wantY - p.offY) * ease
            p.reveal += (reveal - p.reveal) * ease

            // Final position: the offset is applied *before* the radius lookup,
            // so a displaced particle re-reads the tooth and lands back on it.
            const theta = wrapPi(p.theta + p.offTheta)
            const y = Math.min(yHigh, Math.max(yLow, p.y + p.offY))
            const rFinal = radiusAt(theta, y)
            normalAt(theta, y, nrm)

            p.r = rFinal
            p.x = cx + Math.cos(theta) * rFinal + nrm[0] * liftAmount
            p.py = y + nrm[1] * liftAmount
            p.z = cz + Math.sin(theta) * rFinal + nrm[2] * liftAmount

            // Triangulation coordinates: arc length around the cursor's angle, so
            // the seam of the cylinder always falls on the hidden far side.
            scene.tx[i] = wrapPi(theta - pivotTheta) * rFinal
            scene.ty[i] = y

            pointPos.array[i * 3] = p.x
            pointPos.array[i * 3 + 1] = p.py
            pointPos.array[i * 3 + 2] = p.z
            pointAlpha.array[i] = particleOpacity * p.reveal
        }

        // Retriangulating every frame is wasted work at this drift speed, and
        // holding the topology for a few frames also keeps edges from flickering.
        scene.frame++
        const showing = active || scene.ambientWeight > 0.002
        if (showing && (scene.frame % retriangulateEvery === 0 || scene.triangles.length === 0)) {
            scene.triangles = delaunay(scene.tx, scene.ty, particles.length)
        }

        let link = 0
        const tris = scene.triangles
        const seen = new Set()

        for (let t = 0; t + 2 < tris.length && link + 3 <= maxLinks; t += 3) {
            const a = particles[tris[t]]
            const b = particles[tris[t + 1]]
            const c = particles[tris[t + 2]]

            if (a.reveal < 0.002 && b.reveal < 0.002 && c.reveal < 0.002) continue

            const ab = Math.hypot(a.x - b.x, a.py - b.py, a.z - b.z)
            const bc = Math.hypot(b.x - c.x, b.py - c.py, b.z - c.z)
            const ca = Math.hypot(c.x - a.x, c.py - a.py, c.z - a.z)

            // Whole triangles are dropped, never single edges, so nothing that
            // does get drawn is ever left as a dangling line.
            if (Math.max(ab, bc, ca) > maxEdgeWorld) continue

            const ids = [tris[t], tris[t + 1], tris[t + 2]]
            const ends = [a, b, c]

            for (let e = 0; e < 3; e++) {
                const i0 = ids[e]
                const i1 = ids[(e + 1) % 3]
                const key = i0 < i1 ? i0 * count + i1 : i1 * count + i0
                if (seen.has(key)) continue
                seen.add(key)
                if (link >= maxLinks) break

                const p0 = ends[e]
                const p1 = ends[(e + 1) % 3]
                const o = link * 6
                linePos.array[o] = p0.x
                linePos.array[o + 1] = p0.py
                linePos.array[o + 2] = p0.z
                linePos.array[o + 3] = p1.x
                linePos.array[o + 4] = p1.py
                linePos.array[o + 5] = p1.z
                // Per endpoint alpha: the mesh fades out towards the edge of the
                // cursor's reach instead of ending on a hard circle.
                lineAlpha.array[link * 2] = linkOpacity * p0.reveal
                lineAlpha.array[link * 2 + 1] = linkOpacity * p1.reveal
                link++
            }
        }

        scene.lineGeometry.setDrawRange(0, link * 2)
        linePos.needsUpdate = true
        lineAlpha.needsUpdate = true
        pointPos.needsUpdate = true
        pointAlpha.needsUpdate = true

        scene.pointMaterial.uniforms.uSize.value = pointSize * state.viewport.dpr
    })

    if (!field || !scene) return null

    return (
        <group position={source.position} quaternion={source.quaternion} scale={source.scale}>
            <mesh ref={proxyRef} geometry={scene.proxy} visible={false} />
            <lineSegments geometry={scene.lineGeometry} material={scene.lineMaterial} frustumCulled={false} />
            <points geometry={scene.pointGeometry} material={scene.pointMaterial} frustumCulled={false} />
        </group>
    )
}
