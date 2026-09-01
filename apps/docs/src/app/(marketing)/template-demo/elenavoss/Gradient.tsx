import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface NoiseMaterialProps {
  colorA: string;
  colorB: string;
}

const NoiseMaterial = ({ colorA, colorB }: NoiseMaterialProps) => {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
      fragmentShader={`
        varying vec2 vUv;
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) +
         (c - a) * u.y * (1.0 - u.x) +
         (d - b) * u.x * u.y;
}

void main() {
  vec2 st = vUv;

  float invertedY = 1.0 - vUv.y;

  float noiseValue = noise(vec2(vUv.x * 3.0, uTime * 0.2)) * 0.5 + 0.5;
  float wavePhase = noiseValue * 6.2831;

  float wave = sin(vUv.x * 10.0 + uTime + wavePhase) * 0.05;
  float verticalOffset = sin(uTime * 0.5) * 0.05;

  float waveHeight = 0.5;
  float yPos = invertedY + verticalOffset;

  float waveMask = smoothstep(waveHeight - 0.1, waveHeight + 0.3, yPos + wave);
  float edgeFalloff = smoothstep(0.0, 0.1, yPos);
  float finalMask = waveMask * edgeFalloff;

  vec3 gradientColor = mix(uColorA, uColorB, invertedY);


  vec3 finalColor = mix(vec3(0.0), gradientColor, finalMask);

  gl_FragColor = vec4(finalColor, 1.0);
}
      `}
      uniforms={{
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color(colorA) },
        uColorB: { value: new THREE.Color(colorB) },
      }}
    />
  );
};

const Plane = ({ colorA, colorB }: NoiseMaterialProps) => {
  const { viewport } = useThree();
  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <NoiseMaterial colorA={colorA} colorB={colorB} />
    </mesh>
  );
};

const Gradient = () => {
  return (
    <div
      style={{ width: "100vw", height: "100vh", background: "#000" }}
      className="overflow-visible"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        className="h-[100vw] w-screen translate-y-[20%]"
      >
        <Plane colorA="#E61216" colorB="#F16B0D" />
      </Canvas>
    </div>
  );
};

export default Gradient;
