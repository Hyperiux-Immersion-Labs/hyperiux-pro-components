import { useRef } from "react";
import type { ThreeElements } from "@react-three/fiber";
import type * as THREE from "three";

type LightProps = Partial<ThreeElements["spotLight"]>;

type LightsProps = {
  lights: LightProps | [LightProps, LightProps, LightProps];
};

const Lights = ({ lights }: LightsProps) => {
  const lightRef1 = useRef<THREE.SpotLight>(null);
  const lightRef2 = useRef<THREE.SpotLight>(null);
  const lightRef3 = useRef<THREE.SpotLight>(null);
  const lightList = Array.isArray(lights) ? lights : [lights, lights, lights];

  return (
    <>
      <spotLight {...lightList[0]} ref={lightRef1} />
      <spotLight {...lightList[1]} ref={lightRef2} />
      <spotLight {...lightList[2]} ref={lightRef3} />
    </>
  );
};

export default Lights;
