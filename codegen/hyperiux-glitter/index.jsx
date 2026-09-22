// Built using Hyperiux Vault: https://vault.hyperiux.com
'use client';
import { Center, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
const MouseTrailParticles = ({ maxParticles = 1400, spawnPerMove = 8, particleLife = 0.9, size = 11, color = "#ffffff", brightness = 22, zOffset = 0.08, spread = 0.045, velocityStrength = 0.22, lerpFactor = 0.14, idleDamping = 0.9, stopSpeedThreshold = 0.0025, idleModeDelay = 1.2, 
// idle comet behavior
idleCometDelayMin = 0.45, idleCometDelayMax = 1.2, idleCometLife = 0.8, idleCometSpeedMin = 0.9, idleCometSpeedMax = 1.8, idleCometSpawnPerFrame = 5, idleCometTrailSpread = 0.025, 
// extra padding beyond visible viewport
idleCometViewportPadding = 0.2, }) => {
    const pointsRef = useRef(null);
    const { camera, gl, clock, viewport } = useThree();
    const targetPointerWorldRef = useRef(new THREE.Vector3());
    const smoothPointerWorldRef = useRef(new THREE.Vector3());
    const prevSmoothPointerWorldRef = useRef(new THREE.Vector3());
    const initializedRef = useRef(false);
    const hasPointerRef = useRef(false);
    const lastMoveTimeRef = useRef(0);
    const raycaster = useMemo(() => new THREE.Raycaster(), []);
    const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
    const hitPoint = useMemo(() => new THREE.Vector3(), []);
    const tempVelocity = useMemo(() => new THREE.Vector3(), []);
    const tempInterp = useMemo(() => new THREE.Vector3(), []);
    const idleCometRef = useRef({
        active: false,
        head: new THREE.Vector3(),
        prevHead: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        startTime: 0,
        endTime: 0,
        nextSpawnTime: 0,
    });
    useEffect(() => {
        const handlePointerMove = (e) => {
            const rect = gl.domElement.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
            if (raycaster.ray.intersectPlane(plane, hitPoint)) {
                targetPointerWorldRef.current.copy(hitPoint);
                hasPointerRef.current = true;
                lastMoveTimeRef.current = performance.now() * 0.001;
                if (!initializedRef.current) {
                    smoothPointerWorldRef.current.copy(hitPoint);
                    prevSmoothPointerWorldRef.current.copy(hitPoint);
                    initializedRef.current = true;
                }
                idleCometRef.current.active = false;
            }
        };
        gl.domElement.addEventListener("pointermove", handlePointerMove, { passive: true });
        return () => {
            gl.domElement.removeEventListener("pointermove", handlePointerMove);
        };
    }, [camera, gl, plane, raycaster, hitPoint]);
    const randomRange = (min, max) => min + Math.random() * (max - min);
    const getScreenBounds = () => {
        const vp = viewport.getCurrentViewport(camera, [0, 0, 0]);
        return {
            halfW: vp.width * 0.5 + idleCometViewportPadding,
            halfH: vp.height * 0.5 + idleCometViewportPadding,
        };
    };
    const scheduleNextIdleComet = (now) => {
        idleCometRef.current.nextSpawnTime =
            now + randomRange(idleCometDelayMin, idleCometDelayMax);
    };
    const spawnIdleComet = (now) => {
        const comet = idleCometRef.current;
        const { halfW, halfH } = getScreenBounds();
        const side = Math.floor(Math.random() * 4);
        let startX = 0;
        let startY = 0;
        let dirX = 0;
        let dirY = 0;
        if (side === 0) {
            startX = -halfW;
            startY = randomRange(-halfH, halfH);
            dirX = randomRange(0.75, 1.0);
            dirY = randomRange(-0.45, 0.45);
        }
        else if (side === 1) {
            startX = halfW;
            startY = randomRange(-halfH, halfH);
            dirX = randomRange(-1.0, -0.75);
            dirY = randomRange(-0.45, 0.45);
        }
        else if (side === 2) {
            startX = randomRange(-halfW, halfW);
            startY = halfH;
            dirX = randomRange(-0.45, 0.45);
            dirY = randomRange(-1.0, -0.75);
        }
        else {
            startX = randomRange(-halfW, halfW);
            startY = -halfH;
            dirX = randomRange(-0.45, 0.45);
            dirY = randomRange(0.75, 1.0);
        }
        const speed = randomRange(idleCometSpeedMin, idleCometSpeedMax);
        comet.head.set(startX, startY, 0);
        comet.prevHead.copy(comet.head);
        comet.velocity.set(dirX, dirY, 0).normalize().multiplyScalar(speed);
        comet.startTime = now;
        comet.endTime = now + idleCometLife;
        comet.active = true;
    };
    const spawnParticle = (particles, basePos, velocity, lifeMul = 1, localSpread = spread) => {
        const i = particles.cursor;
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * localSpread;
        const ox = Math.cos(angle) * radius;
        const oy = Math.sin(angle) * radius;
        particles.positions[i * 3 + 0] = basePos.x + ox;
        particles.positions[i * 3 + 1] = basePos.y + oy;
        particles.positions[i * 3 + 2] = zOffset + (Math.random() - 0.5) * 0.01;
        particles.ages[i] = 0;
        particles.lifes[i] = particleLife * lifeMul * (0.75 + Math.random() * 0.5);
        particles.seeds[i] = Math.random() * 1000;
        particles.alphas[i] = 1;
        particles.sizes[i] = 0.9 + Math.random() * 0.4;
        particles.velocities[i * 3 + 0] = velocity.x + (Math.random() - 0.5) * 0.04;
        particles.velocities[i * 3 + 1] = velocity.y + (Math.random() - 0.5) * 0.04;
        particles.velocities[i * 3 + 2] = 0;
        particles.cursor = (particles.cursor + 1) % maxParticles;
        particles.count = Math.min(particles.count + 1, maxParticles);
    };
    const geometry = useMemo(() => {
        const particles = {
            positions: new Float32Array(maxParticles * 3),
            ages: new Float32Array(maxParticles),
            lifes: new Float32Array(maxParticles),
            seeds: new Float32Array(maxParticles),
            alphas: new Float32Array(maxParticles),
            sizes: new Float32Array(maxParticles),
            velocities: new Float32Array(maxParticles * 3),
            count: 0,
            cursor: 0,
        };
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(particles.positions, 3));
        g.setAttribute("aAge", new THREE.BufferAttribute(particles.ages, 1));
        g.setAttribute("aLife", new THREE.BufferAttribute(particles.lifes, 1));
        g.setAttribute("aSeed", new THREE.BufferAttribute(particles.seeds, 1));
        g.setAttribute("aAlpha", new THREE.BufferAttribute(particles.alphas, 1));
        g.setAttribute("aSizeMul", new THREE.BufferAttribute(particles.sizes, 1));
        g.setDrawRange(0, particles.count);
        g.userData.particles = particles;
        return g;
    }, [maxParticles]);
    const materialArgs = useMemo(() => {
        return {
            uniforms: {
                uTime: { value: 0 },
                uSize: { value: size },
                uColor: { value: new THREE.Color(color) },
                uBrightness: { value: brightness },
            },
            vertexShader: `
        uniform float uTime;
        uniform float uSize;

        attribute float aAge;
        attribute float aLife;
        attribute float aSeed;
        attribute float aAlpha;
        attribute float aSizeMul;

        varying float vLifeT;
        varying float vAlpha;
        varying float vSeed;

        void main() {
          float t = clamp(aAge / max(aLife, 0.0001), 0.0, 1.0);
          vLifeT = t;
          vAlpha = aAlpha;
          vSeed = aSeed;

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

          float appear = smoothstep(0.0, 0.08, 1.0 - t);
          float disappear = 1.0 - smoothstep(0.55, 1.0, t);
          float lifeScale = appear * disappear;

          float twinkle = sin(uTime * 9.0 + aSeed * 12.0) * 0.5 + 0.5;
          float pointSize = uSize * aSizeMul * lifeScale * mix(0.85, 1.2, twinkle);

          gl_PointSize = pointSize * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
            fragmentShader: `
        uniform vec3 uColor;
        uniform float uBrightness;

        varying float vLifeT;
        varying float vAlpha;
        varying float vSeed;

        void main() {
          vec2 uv = gl_PointCoord - 0.5;

          float phase = sin(vSeed * 17.0 + vLifeT * 8.0) * 0.5 + 0.5;

          float diamondScale = mix(0.45, 0.15, phase);
          float dDiamond = abs(uv.x) + abs(uv.y);
          float maskDiamond = step(dDiamond, diamondScale);

          float crossScale = mix(0.18, 0.48, phase);
          float thickness = 0.018;
          float lineX = step(abs(uv.x), thickness) * step(abs(uv.y), crossScale);
          float lineY = step(abs(uv.y), thickness) * step(abs(uv.x), crossScale);
          float maskCross = clamp(lineX + lineY, 0.0, 1.0);

          float finalMask = max(maskDiamond, maskCross);
          if (finalMask < 0.1) discard;

          float fade = 1.0 - smoothstep(0.55, 1.0, vLifeT);
          gl_FragColor = vec4(uColor * uBrightness, finalMask * fade * vAlpha);
        }
      `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        };
    }, [size, color, brightness]);
    useEffect(() => {
        const uniforms = pointsRef.current?.material?.uniforms;
        if (!uniforms)
            return;
        uniforms.uSize.value = size;
        uniforms.uColor.value.set(color);
        uniforms.uBrightness.value = brightness;
    }, [size, color, brightness]);
    useFrame((state, delta) => {
        if (!pointsRef.current)
            return;
        const geometry = pointsRef.current.geometry;
        const particles = geometry.userData.particles;
        if (!particles)
            return;
        const now = clock.getElapsedTime();
        pointsRef.current.material.uniforms.uTime.value = now;
        const timeSinceMove = performance.now() * 0.001 - lastMoveTimeRef.current;
        const isIdleMode = hasPointerRef.current && timeSinceMove > idleModeDelay;
        if (initializedRef.current) {
            prevSmoothPointerWorldRef.current.copy(smoothPointerWorldRef.current);
            if (!isIdleMode) {
                smoothPointerWorldRef.current.lerp(targetPointerWorldRef.current, lerpFactor);
                tempVelocity
                    .subVectors(smoothPointerWorldRef.current, prevSmoothPointerWorldRef.current)
                    .multiplyScalar(idleDamping);
                const speed = tempVelocity.length();
                if (speed > stopSpeedThreshold) {
                    const emitCount = Math.max(1, Math.floor(spawnPerMove + speed * 260));
                    for (let s = 0; s < emitCount; s++) {
                        const t = emitCount <= 1 ? 0 : s / (emitCount - 1);
                        tempInterp.lerpVectors(prevSmoothPointerWorldRef.current, smoothPointerWorldRef.current, t);
                        const vel = tempVelocity.clone().multiplyScalar(velocityStrength);
                        spawnParticle(particles, tempInterp, vel, THREE.MathUtils.clamp(1 + speed * 8, 1, 1.45), spread);
                    }
                }
            }
            else {
                const comet = idleCometRef.current;
                const { halfW, halfH } = getScreenBounds();
                if (!comet.active && comet.nextSpawnTime === 0) {
                    scheduleNextIdleComet(now);
                }
                if (!comet.active && now >= comet.nextSpawnTime) {
                    spawnIdleComet(now);
                }
                if (comet.active) {
                    comet.prevHead.copy(comet.head);
                    comet.head.addScaledVector(comet.velocity, delta);
                    const cometVelocity = tempVelocity
                        .subVectors(comet.head, comet.prevHead)
                        .multiplyScalar(1 / Math.max(delta, 0.0001));
                    for (let s = 0; s < idleCometSpawnPerFrame; s++) {
                        const t = idleCometSpawnPerFrame <= 1 ? 0 : s / (idleCometSpawnPerFrame - 1);
                        tempInterp.lerpVectors(comet.prevHead, comet.head, t);
                        spawnParticle(particles, tempInterp, cometVelocity.clone().multiplyScalar(0.012), idleCometLife / particleLife, idleCometTrailSpread);
                    }
                    if (now >= comet.endTime ||
                        Math.abs(comet.head.x) > halfW * 1.25 ||
                        Math.abs(comet.head.y) > halfH * 1.25) {
                        comet.active = false;
                        scheduleNextIdleComet(now);
                    }
                }
            }
        }
        const velocities = particles.velocities;
        for (let i = 0; i < particles.count; i++) {
            particles.ages[i] += delta;
            const life = particles.lifes[i];
            const age = particles.ages[i];
            const t = Math.min(age / Math.max(life, 0.0001), 1);
            if (t >= 1) {
                particles.alphas[i] = 0;
                continue;
            }
            particles.positions[i * 3 + 0] += velocities[i * 3 + 0] * delta;
            particles.positions[i * 3 + 1] += velocities[i * 3 + 1] * delta;
            particles.positions[i * 3 + 2] += velocities[i * 3 + 2] * delta;
            velocities[i * 3 + 0] *= 0.965;
            velocities[i * 3 + 1] *= 0.965;
            particles.alphas[i] = 1 - t;
        }
        geometry.getAttribute("position").needsUpdate = true;
        geometry.getAttribute("aAge").needsUpdate = true;
        geometry.getAttribute("aAlpha").needsUpdate = true;
        geometry.getAttribute("aLife").needsUpdate = true;
        geometry.getAttribute("aSizeMul").needsUpdate = true;
        geometry.getAttribute("aSeed").needsUpdate = true;
        geometry.setDrawRange(0, particles.count);
    });
    return (<points ref={pointsRef} geometry={geometry}>
      <shaderMaterial args={[materialArgs]} toneMapped={false}/>
    </points>);
};
// ---- MorphingParticleModelNew.tsx ----
function buildMergedSurface(scene) {
    const meshes = [];
    scene.updateMatrixWorld(true);
    scene.traverse((child) => {
        if (!child.isMesh || !child.geometry)
            return;
        const geometry = child.geometry.clone();
        const nonIndexed = geometry.index ? geometry.toNonIndexed() : geometry;
        const pos = nonIndexed.attributes.position;
        if (!pos) {
            geometry.dispose();
            if (nonIndexed !== geometry)
                nonIndexed.dispose?.();
            return;
        }
        const worldPositions = new Float32Array(pos.count * 3);
        const v = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
            v.fromBufferAttribute(pos, i).applyMatrix4(child.matrixWorld);
            worldPositions[i * 3 + 0] = v.x;
            worldPositions[i * 3 + 1] = v.y;
            worldPositions[i * 3 + 2] = v.z;
        }
        const merged = new THREE.BufferGeometry();
        merged.setAttribute("position", new THREE.BufferAttribute(worldPositions, 3));
        merged.computeVertexNormals();
        meshes.push(merged);
        geometry.dispose();
        if (nonIndexed !== geometry)
            nonIndexed.dispose?.();
    });
    if (!meshes.length)
        return null;
    if (meshes.length === 1)
        return meshes[0];
    const totalCount = meshes.reduce((sum, g) => sum + g.attributes.position.count, 0);
    const mergedPositions = new Float32Array(totalCount * 3);
    const mergedNormals = new Float32Array(totalCount * 3);
    let offset = 0;
    for (const g of meshes) {
        mergedPositions.set(g.attributes.position.array, offset * 3);
        mergedNormals.set(g.attributes.normal.array, offset * 3);
        offset += g.attributes.position.count;
        g.dispose();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(mergedPositions, 3));
    geometry.setAttribute("normal", new THREE.BufferAttribute(mergedNormals, 3));
    return geometry;
}
const MorphingParticleModel = ({ url = "/assets/models/hyperiux-new-model.glb", scale = 1, particleCount = 8000, color = "#ffffff", size = 0.18, speed = 1.15, opacity = 1, brightness = 4.5, showModel = false, modelOpacity = 0, parallaxStrength = 0.12, parallaxLerp = 0.08, rotationStrengthX = 0.12, rotationStrengthY = 0.18, rotationStrengthZ = 0.04, rotationLerp = 0.08, interactionRadius = 1.8, interactionStrength = 2.24, interactionDepth = 0.04, interactionLerp = 0.18, returnLerp = 0.012, cursorLerp = 0.2, maxOffset = 1.22, frontFacingThreshold = 0.12, frontFacingSoftness = 0.05, }) => {
    const groupRef = useRef(null);
    const pointsRef = useRef(null);
    const { scene } = useGLTF(url);
    const { pointer, camera } = useThree();
    const reduceMotionRef = useRef(Boolean(typeof window !== "undefined" &&
        (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false)));
    useEffect(() => {
        const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
        if (!mq)
            return;
        const onChange = (event) => {
            reduceMotionRef.current = event.matches;
        };
        reduceMotionRef.current = mq.matches;
        mq.addEventListener?.("change", onChange);
        return () => mq.removeEventListener?.("change", onChange);
    }, []);
    const particleBuffersRef = useRef(null);
    const [particleBuffers, setParticleBuffers] = useState(null);
    const basePositionsRef = useRef(null);
    const currentPositionsRef = useRef(null);
    const metaRef = useRef(null);
    const normalsRef = useRef(null);
    const countRef = useRef(0);
    useEffect(() => {
        if (!scene)
            return;
        const mergedGeometry = buildMergedSurface(scene);
        if (!mergedGeometry)
            return;
        const tempMesh = new THREE.Mesh(mergedGeometry, new THREE.MeshBasicMaterial());
        const sampler = new MeshSurfaceSampler(tempMesh).build();
        const positions = new Float32Array(particleCount * 3);
        const normals = new Float32Array(particleCount * 3);
        const meta = new Float32Array(particleCount * 2);
        const pos = new THREE.Vector3();
        const normal = new THREE.Vector3();
        for (let i = 0; i < particleCount; i++) {
            sampler.sample(pos, normal);
            positions[i * 3 + 0] = pos.x;
            positions[i * 3 + 1] = pos.y;
            positions[i * 3 + 2] = pos.z;
            normals[i * 3 + 0] = normal.x;
            normals[i * 3 + 1] = normal.y;
            normals[i * 3 + 2] = normal.z;
            meta[i * 2 + 0] = Math.random();
            meta[i * 2 + 1] = Math.abs(normal.z) > 0.5 ? 1 : 0;
        }
        mergedGeometry.dispose();
        tempMesh.material.dispose();
        const basePositions = new Float32Array(positions);
        const currentPositions = new Float32Array(positions);
        const nextBuffers = {
            positions: currentPositions,
            normals,
            meta,
            count: particleCount,
            basePositions,
            currentPositions,
        };
        particleBuffersRef.current = nextBuffers;
        basePositionsRef.current = basePositions;
        currentPositionsRef.current = currentPositions;
        normalsRef.current = normals;
        metaRef.current = meta;
        countRef.current = particleCount;
        Promise.resolve().then(() => setParticleBuffers(nextBuffers));
    }, [scene, particleCount]);
    const parallaxTarget = useRef(new THREE.Vector3());
    const parallaxCurrent = useRef(new THREE.Vector3());
    const rotationTarget = useRef(new THREE.Euler(0, 0, 0));
    const rotationCurrent = useRef(new THREE.Euler(0, 0, 0));
    const raycasterRef = useRef(new THREE.Raycaster());
    const hitPointWorldRef = useRef(new THREE.Vector3());
    const hitPointLocalRef = useRef(new THREE.Vector3());
    const smoothHitPointLocalRef = useRef(new THREE.Vector3());
    const prevSmoothHitPointLocalRef = useRef(new THREE.Vector3());
    const planeNormalRef = useRef(new THREE.Vector3());
    const planePointRef = useRef(new THREE.Vector3());
    const groupWorldQuatRef = useRef(new THREE.Quaternion());
    const cursorVelocityLocalRef = useRef(new THREE.Vector3());
    const hasPrevHitRef = useRef(false);
    const tempTarget = useRef(new THREE.Vector3());
    const tempOffset = useRef(new THREE.Vector3());
    const tempCursorDir = useRef(new THREE.Vector3());
    useEffect(() => {
        scene.traverse((child) => {
            if (!child.isMesh || !child.material)
                return;
            child.material = child.material.clone();
            child.material.transparent = true;
            child.material.opacity = showModel ? modelOpacity : 0;
            child.material.depthWrite = false;
            child.visible = showModel;
        });
    }, [scene, showModel, modelOpacity]);
    const shaderArgs = useMemo(() => {
        return {
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(color) },
                uSize: { value: size },
                uSpeed: { value: speed },
                uOpacity: { value: opacity },
                uBrightness: { value: brightness },
                uFrontFacingThreshold: { value: frontFacingThreshold },
                uFrontFacingSoftness: { value: frontFacingSoftness },
            },
            vertexShader: `
        uniform float uTime;
        uniform float uSize;
        uniform float uSpeed;
        uniform float uFrontFacingThreshold;
        uniform float uFrontFacingSoftness;

        attribute vec2 aMeta;
        attribute vec3 aNormal;

        varying float vTransition;
        varying float vEdge;
        varying float vFacing;

        void main() {
          float rand = aMeta.x;
          vEdge = aMeta.y;

          float phase = rand * 6.2831853 + (position.x * 1.2 + position.y * 1.2 + position.z * 1.2);
          vTransition = sin(uTime * uSpeed + phase) * 0.5 + 0.5;

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

          vec3 viewNormal = normalize(normalMatrix * aNormal);
          vec3 viewDir = normalize(-mvPosition.xyz);

          float facingDot = dot(viewNormal, viewDir);

          vFacing = smoothstep(
            uFrontFacingThreshold - uFrontFacingSoftness,
            uFrontFacingThreshold + uFrontFacingSoftness,
            facingDot
          );

          float pointSize = uSize * (300.0 / -mvPosition.z);
          pointSize *= mix(1.0, 1.02, vEdge);
          pointSize *= vFacing;

          gl_PointSize = pointSize;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
            fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uBrightness;

        varying float vTransition;
        varying float vEdge;
        varying float vFacing;

        void main() {
          if (vFacing < 0.01) discard;

          vec2 uv = gl_PointCoord - 0.5;

          float diamondScale = 1.0 - vTransition;
          float dDiamond = abs(uv.x) + abs(uv.y);
          float maskDiamond = step(dDiamond, 0.42 * diamondScale);

          float crossScale = vTransition;
          float thickness = mix(0.015, 0.017, vEdge);
          float lineX = step(abs(uv.x), thickness) * step(abs(uv.y), 0.44 * crossScale);
          float lineY = step(abs(uv.y), thickness) * step(abs(uv.x), 0.44 * crossScale);
          float maskCross = clamp(lineX + lineY, 0.0, 1.0);

          float finalMask = max(maskDiamond, maskCross);
          if (finalMask < 0.1) discard;

          float intensity = mix(1.0, 1.03, vEdge);
          gl_FragColor = vec4(uColor * uBrightness * intensity, uOpacity * vFacing);
        }
      `,
        };
    }, [
        color,
        size,
        speed,
        opacity,
        brightness,
        frontFacingThreshold,
        frontFacingSoftness,
    ]);
    useEffect(() => {
        const uniforms = pointsRef.current?.material?.uniforms;
        if (!uniforms)
            return;
        uniforms.uColor.value.set(color);
        uniforms.uSize.value = size;
        uniforms.uSpeed.value = speed;
        uniforms.uOpacity.value = opacity;
        uniforms.uBrightness.value = brightness;
        uniforms.uFrontFacingThreshold.value = frontFacingThreshold;
        uniforms.uFrontFacingSoftness.value = frontFacingSoftness;
    }, [
        color,
        size,
        speed,
        opacity,
        brightness,
        frontFacingThreshold,
        frontFacingSoftness,
    ]);
    useFrame((state) => {
        if (!pointsRef.current || !currentPositionsRef.current || !basePositionsRef.current) {
            return;
        }
        pointsRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
        if (groupRef.current) {
            if (reduceMotionRef.current) {
                // Reduced-motion: freeze mouse parallax / tilt at rest.
                parallaxTarget.current.set(0, 0, 0);
                parallaxCurrent.current.set(0, 0, 0);
                rotationTarget.current.set(0, 0, 0);
                rotationCurrent.current.set(0, 0, 0);
                groupRef.current.position.x = 0;
                groupRef.current.position.y = 0;
                groupRef.current.rotation.set(0, 0, 0);
            }
            else {
                parallaxTarget.current.set(pointer.x * parallaxStrength, pointer.y * parallaxStrength, 0);
                parallaxCurrent.current.lerp(parallaxTarget.current, parallaxLerp);
                groupRef.current.position.x = parallaxCurrent.current.x;
                groupRef.current.position.y = parallaxCurrent.current.y;
                rotationTarget.current.x = -pointer.y * rotationStrengthX;
                rotationTarget.current.y = pointer.x * rotationStrengthY;
                rotationTarget.current.z = pointer.x * rotationStrengthZ;
                rotationCurrent.current.x = THREE.MathUtils.lerp(rotationCurrent.current.x, rotationTarget.current.x, rotationLerp);
                rotationCurrent.current.y = THREE.MathUtils.lerp(rotationCurrent.current.y, rotationTarget.current.y, rotationLerp);
                rotationCurrent.current.z = THREE.MathUtils.lerp(rotationCurrent.current.z, rotationTarget.current.z, rotationLerp);
                groupRef.current.rotation.x = rotationCurrent.current.x;
                groupRef.current.rotation.y = rotationCurrent.current.y;
                groupRef.current.rotation.z = rotationCurrent.current.z;
            }
        }
        const group = groupRef.current;
        group.updateWorldMatrix(true, false);
        group.getWorldPosition(planePointRef.current);
        group.getWorldQuaternion(groupWorldQuatRef.current);
        planeNormalRef.current
            .set(0, 0, 1)
            .applyQuaternion(groupWorldQuatRef.current)
            .normalize();
        raycasterRef.current.setFromCamera(pointer, camera);
        const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormalRef.current, planePointRef.current);
        let hasPlaneHit = false;
        let isActivelyMoving = false;
        if (!reduceMotionRef.current &&
            raycasterRef.current.ray.intersectPlane(plane, hitPointWorldRef.current)) {
            hitPointLocalRef.current.copy(hitPointWorldRef.current);
            group.worldToLocal(hitPointLocalRef.current);
            if (!hasPrevHitRef.current) {
                smoothHitPointLocalRef.current.copy(hitPointLocalRef.current);
                prevSmoothHitPointLocalRef.current.copy(hitPointLocalRef.current);
                hasPrevHitRef.current = true;
            }
            prevSmoothHitPointLocalRef.current.copy(smoothHitPointLocalRef.current);
            smoothHitPointLocalRef.current.lerp(hitPointLocalRef.current, cursorLerp);
            cursorVelocityLocalRef.current.subVectors(smoothHitPointLocalRef.current, prevSmoothHitPointLocalRef.current);
            hasPlaneHit = true;
            if (cursorVelocityLocalRef.current.length() > 0.0015) {
                isActivelyMoving = true;
            }
        }
        else {
            cursorVelocityLocalRef.current.set(0, 0, 0);
        }
        if (isActivelyMoving) {
            tempCursorDir.current.copy(cursorVelocityLocalRef.current);
            if (tempCursorDir.current.lengthSq() > 0.000001) {
                tempCursorDir.current.normalize();
            }
            else {
                tempCursorDir.current.set(0, 0, 0);
            }
        }
        else {
            tempCursorDir.current.set(0, 0, 0);
        }
        const count = countRef.current;
        const basePositions = basePositionsRef.current;
        const currentPositions = currentPositionsRef.current;
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const bx = basePositions[i3 + 0];
            const by = basePositions[i3 + 1];
            const bz = basePositions[i3 + 2];
            tempTarget.current.set(bx, by, bz);
            if (isActivelyMoving && hasPlaneHit) {
                const dx = bx - smoothHitPointLocalRef.current.x;
                const dy = by - smoothHitPointLocalRef.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < interactionRadius) {
                    const falloff = 1 - dist / interactionRadius;
                    const soft = falloff * falloff;
                    tempTarget.current.x += tempCursorDir.current.x * interactionStrength * soft;
                    tempTarget.current.y += tempCursorDir.current.y * interactionStrength * soft;
                    tempTarget.current.z += interactionDepth * soft;
                }
            }
            tempOffset.current.set(tempTarget.current.x - bx, tempTarget.current.y - by, tempTarget.current.z - bz);
            const len = tempOffset.current.length();
            if (len > maxOffset) {
                tempOffset.current.normalize().multiplyScalar(maxOffset);
                tempTarget.current.set(bx + tempOffset.current.x, by + tempOffset.current.y, bz + tempOffset.current.z);
            }
            const currentLerp = isActivelyMoving ? interactionLerp : returnLerp;
            currentPositions[i3 + 0] = THREE.MathUtils.lerp(currentPositions[i3 + 0], tempTarget.current.x, currentLerp);
            currentPositions[i3 + 1] = THREE.MathUtils.lerp(currentPositions[i3 + 1], tempTarget.current.y, currentLerp);
            currentPositions[i3 + 2] = THREE.MathUtils.lerp(currentPositions[i3 + 2], tempTarget.current.z, currentLerp);
        }
        pointsRef.current.geometry.getAttribute("position").needsUpdate = true;
    });
    if (!particleBuffers)
        return null;
    return (<group ref={groupRef} scale={scale}>
      <primitive object={scene}/>

      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute {...{
        attach: "attributes-position",
        array: particleBuffers.positions,
        count: particleBuffers.count,
        itemSize: 3,
    }}/>
          <bufferAttribute {...{
        attach: "attributes-aMeta",
        array: particleBuffers.meta,
        count: particleBuffers.count,
        itemSize: 2,
    }}/>
          <bufferAttribute {...{
        attach: "attributes-aNormal",
        array: particleBuffers.normals,
        count: particleBuffers.count,
        itemSize: 3,
    }}/>
        </bufferGeometry>

        <shaderMaterial args={[shaderArgs]} transparent depthWrite={false} blending={THREE.NormalBlending} toneMapped={false}/>
      </points>
    </group>);
};
// ---- createSuspendedRaf.ts ----
const DEFAULT_ROOT_MARGIN = "256px";
function resolveElement(root) {
    if (!root)
        return null;
    if (typeof root === "function")
        return root() ?? null;
    if (typeof root === "object" && "current" in root)
        return root.current ?? null;
    return root;
}
function createVisibilityGate({ root = null, rootMargin = DEFAULT_ROOT_MARGIN, threshold = 0, observeTab = true, observeOffscreen = true, onChange, } = {}) {
    let tabVisible = typeof document === "undefined" ? true : !document.hidden;
    // Match border-beam: assume onscreen until the observer reports otherwise.
    let onscreen = true;
    let destroyed = false;
    let observer = null;
    const isActive = () => {
        if (destroyed)
            return false;
        if (observeTab && !tabVisible)
            return false;
        if (observeOffscreen && resolveElement(root) && !onscreen)
            return false;
        return true;
    };
    let lastActive = isActive();
    const emit = () => {
        if (destroyed)
            return;
        const next = isActive();
        if (next === lastActive)
            return;
        lastActive = next;
        onChange?.(next);
    };
    const onVisibilityChange = () => {
        tabVisible = !document.hidden;
        emit();
    };
    if (observeTab && typeof document !== "undefined") {
        document.addEventListener("visibilitychange", onVisibilityChange);
    }
    const bindObserver = () => {
        if (!observeOffscreen || typeof IntersectionObserver === "undefined") {
            return;
        }
        const el = resolveElement(root);
        if (!el)
            return;
        observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                onscreen = entry.isIntersecting;
            }
            emit();
        }, { rootMargin, threshold });
        observer.observe(el);
    };
    bindObserver();
    return {
        /** Whether the animation should currently run. */
        get isActive() {
            return isActive();
        },
        /**
         * Re-bind IntersectionObserver after the root element mounts late
         * (e.g. ref not ready on first call). Safe to call multiple times.
         */
        observe(nextRoot) {
            if (destroyed)
                return;
            if (nextRoot != null)
                root = nextRoot;
            if (observer) {
                observer.disconnect();
                observer = null;
            }
            onscreen = true;
            bindObserver();
            emit();
        },
        destroy() {
            if (destroyed)
                return;
            destroyed = true;
            if (observeTab && typeof document !== "undefined") {
                document.removeEventListener("visibilitychange", onVisibilityChange);
            }
            if (observer) {
                observer.disconnect();
                observer = null;
            }
        },
    };
}
/**
 * Owns a requestAnimationFrame loop that auto-pauses when the tab is hidden
 * or the root element is offscreen.
 */
function createSuspendedRaf({ onFrame, root = null, rootMargin = DEFAULT_ROOT_MARGIN, threshold = 0, observeTab = true, observeOffscreen = true, }) {
    if (typeof onFrame !== "function") {
        throw new TypeError("createSuspendedRaf: onFrame is required");
    }
    let rafId = null;
    let running = false;
    let destroyed = false;
    const stopRaf = () => {
        if (rafId != null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    };
    const tick = (time) => {
        rafId = null;
        if (destroyed || !running || !gate.isActive)
            return;
        onFrame(time);
        if (!destroyed && running && gate.isActive) {
            rafId = requestAnimationFrame(tick);
        }
    };
    const sync = () => {
        if (destroyed)
            return;
        if (running && gate.isActive) {
            if (rafId == null) {
                rafId = requestAnimationFrame(tick);
            }
        }
        else {
            stopRaf();
        }
    };
    const gate = createVisibilityGate({
        root,
        rootMargin,
        threshold,
        observeTab,
        observeOffscreen,
        onChange: sync,
    });
    return {
        /** Start (or resume) the loop when visibility allows. */
        start() {
            if (destroyed)
                return;
            running = true;
            sync();
        },
        /** Stop requesting frames (visibility listeners stay attached until destroy). */
        stop() {
            running = false;
            stopRaf();
        },
        /** Whether the caller has started the loop (may still be paused by visibility). */
        get isRunning() {
            return running;
        },
        /** Whether a frame is currently allowed to schedule. */
        get isActive() {
            return gate.isActive;
        },
        /** Re-attach offscreen observer to a (new) root element. */
        observe(nextRoot) {
            gate.observe(nextRoot);
            sync();
        },
        /** Tear down listeners and cancel any pending frame. */
        destroy() {
            if (destroyed)
                return;
            destroyed = true;
            running = false;
            stopRaf();
            gate.destroy();
        },
    };
}
// ---- index.tsx ----
// Built using Hyperiux Vault: https://vault.hyperiux.com
function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number))
        return fallback;
    return Math.min(Math.max(number, min), max);
}
export default function HyperiuxGlitter({ glitterColor = "#ffffff", accentColor = "#ffffff", speed = 1, mouseInfluence = 1, rotationInfluence = 1, }) {
    const rootRef = useRef(null);
    const [frameloop, setFrameloop] = useState("always");
    const [modelScale, setModelScale] = useState(0.15);
    const resolvedSpeed = clampNumber(speed, 0.05, 5, 1);
    const resolvedMouseInfluence = clampNumber(mouseInfluence, 0, 4, 1);
    const resolvedRotationInfluence = clampNumber(rotationInfluence, 0, 4, 1);
    useEffect(() => {
        const gate = createVisibilityGate({
            root: rootRef,
            onChange: (active) => setFrameloop(active ? "always" : "never"),
        });
        setFrameloop(gate.isActive ? "always" : "never");
        return () => gate.destroy();
    }, []);
    useEffect(() => {
        const updateScale = () => {
            if (window.innerWidth < 768) {
                setModelScale(0.09); // mobile
            }
            else if (window.innerWidth < 1024) {
                setModelScale(0.12); // tablet
            }
            else {
                setModelScale(0.15); // desktop
            }
        };
        updateScale();
        window.addEventListener("resize", updateScale);
        return () => window.removeEventListener("resize", updateScale);
    }, []);
    return (<div ref={rootRef} className="relative h-screen w-screen overflow-hidden bg-black">
      <Canvas aria-hidden="true" className="h-full w-full" camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: false }} frameloop={frameloop}>
        <color attach="background" args={["#000000"]}/>
        <ambientLight intensity={0.2}/>

        <Suspense fallback={null}>
          <Center>
            <MorphingParticleModel url="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/hyperiux-new-model.glb" scale={modelScale} particleCount={10000} color={glitterColor} size={0.18} speed={1.15 * resolvedSpeed} opacity={1} brightness={4.5} showModel={false} modelOpacity={0} parallaxStrength={0.12 * resolvedMouseInfluence} rotationStrengthX={0.12 * resolvedRotationInfluence} rotationStrengthY={0.18 * resolvedRotationInfluence} rotationStrengthZ={0.04 * resolvedRotationInfluence} interactionStrength={2.24 * resolvedMouseInfluence} frontFacingThreshold={0.12} frontFacingSoftness={0.05}/>
          </Center>

          <MouseTrailParticles maxParticles={700} spawnPerMove={4} particleLife={0.4 / Math.sqrt(resolvedSpeed)} size={0.14} color={accentColor} brightness={5.5} zOffset={0.1} spread={0.035 * Math.max(resolvedMouseInfluence, 0.25)} velocityStrength={0.24 * resolvedMouseInfluence} lerpFactor={0.12} idleDamping={0.92} stopSpeedThreshold={0.0015} idleModeDelay={1.2} idleCometDelayMin={0.5} idleCometDelayMax={1.4} idleCometLife={0.85 / Math.sqrt(resolvedSpeed)} idleCometSpeedMin={4.1 * resolvedSpeed} idleCometSpeedMax={10.1 * resolvedSpeed} idleCometSpawnPerFrame={10} idleCometTrailSpread={0.08 * Math.max(resolvedMouseInfluence, 0.25)} idleCometViewportPadding={0.25}/>
        </Suspense>

        <EffectComposer multisampling={4}>
          <Bloom intensity={0.25} luminanceThreshold={0.72} luminanceSmoothing={0.08}/>
        </EffectComposer>
      </Canvas>
        <div className="absolute bottom-[3vw] left-1/2 -translate-x-1/2 z-40 bg-white/8 backdrop-blur-sm px-8 py-4 rounded-full text-white text-[1vw] max-[1025px]:hidden shadow-lg">
       Sweep your cursor across the canvas - leave a glittering comet trail and watch the model respond.
        </div>

        <div className="absolute bottom-[20vw] w-[90%] left-1/2 -translate-x-1/2 z-40 bg-white/8 backdrop-blur-sm px-8 py-4 rounded-full text-white hidden max-[1025px]:block text-[2.5vw] max-md:text-[3.5vw] text-center">
        Tap to interact. Best experienced on desktop.
        </div>
      </div>);
}
