'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three/webgpu'
import { texture, uv, uniform, sub, length, mul, add, oneMinus } from 'three/tsl'
import { createVisibilityGate } from './createSuspendedRaf'

const damp = (current, target, lambda, delta) =>
  current + (target - current) * (1 - Math.exp(-lambda * delta))

function loadCorsObjectUrl(src) {
  return fetch(src, { mode: 'cors', credentials: 'omit', cache: 'no-store' })
    .then((res) => {
      if (!res.ok) throw new Error(`Image request failed with ${res.status}`)
      return res.blob()
    })
    .then((blob) => URL.createObjectURL(blob))
}

function ImageNodeMaterial({ src, isMobile }) {
  const sourceMap = useTexture(src)
  const { size, camera } = useThree()

  const height =
    2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z

  const width = height * (size.width / size.height)

  const mouse = useRef(new THREE.Vector2(0.5, 0.5))
  const target = useRef(new THREE.Vector2(0.5, 0.5))
  const strength = useRef(0)
  const strengthTarget = useRef(0)
  const materialRef = useRef(null)

  const map = useMemo(() => {
    const clonedMap = sourceMap.clone()
    clonedMap.colorSpace = THREE.SRGBColorSpace
    clonedMap.needsUpdate = true
    return clonedMap
  }, [sourceMap])

  useEffect(() => {
    return () => {
      map.dispose()
    }
  }, [map])

  const material = useMemo(() => {
    const mat = new THREE.MeshBasicNodeMaterial()

    const mouseU = uniform(new THREE.Vector2(0.5, 0.5))
    const strengthU = uniform(0)

    const baseUV = uv()
    const diff = sub(baseUV, mouseU)
    const dist = length(diff)

    const falloff = oneMinus(dist).pow(2)

    const displacement = mul(diff, falloff).mul(strengthU.negate())

    const distortedUV = add(baseUV, displacement)

    mat.colorNode = texture(map, distortedUV)

    mat.userData.mouseU = mouseU
    mat.userData.strengthU = strengthU

    return mat
  }, [map])

  useEffect(() => {
    materialRef.current = material
    return () => {
      materialRef.current = null
    }
  }, [material])

  useFrame((_, delta) => {
    const currentMaterial = materialRef.current
    if (!currentMaterial) return

    if (!isMobile) {
      mouse.current.x = damp(mouse.current.x, target.current.x, 12, delta)
      mouse.current.y = damp(mouse.current.y, target.current.y, 12, delta)

      strength.current = damp(
        strength.current,
        strengthTarget.current,
        8,
        delta
      )
    }

    currentMaterial.userData.mouseU.value.copy(mouse.current)
    currentMaterial.userData.strengthU.value = isMobile ? 0 : strength.current
  })

  return (
    <mesh
      material={material}
      onPointerMove={
        isMobile
          ? undefined
          : (e) => {
              if (!e.uv) return
              target.current.copy(e.uv)
              strengthTarget.current = 1
            }
      }
      onPointerLeave={
        isMobile
          ? undefined
          : () => {
              target.current.set(0.5, 0.5)
              strengthTarget.current = 0
            }
      }
    >
      <planeGeometry args={[width, height]} />
    </mesh>
  )
}

export default function FishEye({ src }) {
  const rootRef = useRef(null)
  const [frameloop, setFrameloop] = useState('always')
  const [objectUrl, setObjectUrl] = useState(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: coarse)')
    const update = () => setIsMobile(mediaQuery.matches)
    update()
    mediaQuery.addEventListener('change', update)
    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (isMobile) return undefined

    let url = null
    loadCorsObjectUrl(src)
      .then((u) => {
        url = u
        setObjectUrl(u)
      })
      .catch((err) => console.warn('FishEye texture load failed:', err))

    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [src, isMobile])

  useEffect(() => {
    const gate = createVisibilityGate({
      root: rootRef,
      onChange: (active) => setFrameloop(active ? 'always' : 'never'),
    })
    setFrameloop(gate.isActive ? 'always' : 'never')
    return () => gate.destroy()
  }, [])

  if (isMobile) return null

  if (!objectUrl) return null

  return (
    <div ref={rootRef} className="h-full w-full">
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5], fov: 45 }}
      className="h-full w-full"
      frameloop={frameloop}
      style={{
        pointerEvents: isMobile ? 'none' : 'auto',
        touchAction: isMobile ? 'none' : 'auto',
      }}
      gl={({ canvas }) => {
        const renderer = new THREE.WebGPURenderer({
          canvas,
          antialias: true,
        })

        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.NoToneMapping
        renderer.init()

        return renderer
      }}
    >
      <ImageNodeMaterial src={objectUrl} isMobile={isMobile} />
    </Canvas>
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-8 left-20 z-40 w-fit max-w-[30vw] rounded-md border border-black/10 bg-white/20 backdrop-blur-md p-3 text-center max-md:hidden"
      >
        <h2 className="text-sm leading-none text-[#111111]">
          The lens keeps bending.
        </h2>
        <p className="mt-2 text-xs leading-5 text-black/65">
          Fish Eye distorts the image as your cursor moves across it.
          Since the warp is driven entirely by motion, there&apos;s no
          reduced motion version to fall back on.
        </p>
      </div>
    </div>
  )
}
