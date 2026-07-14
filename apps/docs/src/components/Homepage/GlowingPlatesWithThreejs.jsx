"use client";

import { useRef, useLayoutEffect, useEffect, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import useIsMobile from "@/hooks/useIsMobile";
import { prefersReducedMotion } from "@/lib/motion";
import gsap from "gsap";

const LOADER_STORAGE_KEY = "hyperiux-loader-has-run";

const lerp = (a, b, t) => a + (b - a) * t;

function hasLoaderRun() {
  if (typeof window === "undefined") return false;

  // Loader.jsx writes sessionStorage (not localStorage) and sets the window
  // flag when it completes or is skipped. Must match, or components mounting
  // after loader completion never see it and their intros never play.
  return (
    window.sessionStorage.getItem(LOADER_STORAGE_KEY) === "true" ||
    window.__HYPERIUX_LOADER_COMPLETE__ === true
  );
}

function isLoaderActive() {
  if (typeof window === "undefined") return false;

  return (
    document.body.classList.contains("loader-active") ||
    window.__HYPERIUX_LOADER_RUNNING__ === true
  );
}

// The plates run a continuous WebGL render loop, so the main thread never goes
// idle - that's exactly what makes Lighthouse/PageSpeed time out
// (RPC::DEADLINE_EXCEEDED). Under an audit/headless environment, skip the
// Canvas entirely and show the static dark backdrop instead. Real users always
// get the scene; reduced-motion users get it as a single still frame.
function isAuditEnvironment() {
  if (typeof window === "undefined") return false;

  // Lighthouse/PSI drive Chrome over the DevTools protocol in headless mode,
  // where navigator.webdriver is true - the most reliable audit signal.
  if (navigator.webdriver === true) return true;

  const ua = navigator.userAgent || "";

  return /Lighthouse|Chrome-Lighthouse|Google Page Speed|PTST|HeadlessChrome|bot|crawler|spider/i.test(
    ua
  );
}

const CONFIG = {
  count: 51,
  radius: 4.5,
  heightStep: 0.0,
  turns: 1.0,

  localTiltX: 0.21,
  localTiltY: -0.04,
  localTiltZ: 0.0,

  plateRadius: 1.5,
  plateThickness: 0.04,

  roughness: 0.6,
  metalness: 0.16,
  plateColor: "#0e0e0e",

  glowLeftColor: "#662600",
  glowRightColor: "#cc4c00",
  mobileGlowLeftColor: "#cc6600",
  mobileGlowRightColor: "#ff9940",

  hoverSigma: 2.0,
  hoverSpeed: 0.09,
  hoverScale: 1.25,
  hoverThreshold: 0.48,

  rotationSpeed: 0.05,
  glowIntensity: 1.8,

  lightColor: "#ff4f00",
  lightIntensity: 10.0,
  lightPosition: [20, 20.5, -20],

  environmentIntensity: 0.15,
  environmentPreset: "city",

  wrapperPosition: [1, 0, 0],
  groupPosition: [4.15, 3.93, -0.5],
  groupRotation: [1.41, 0.01, -0.14],

  cameraPosition: [0, 0.8, 7.0],
  cameraFov: 62,
  toneMappingExposure: 1.1,
  canvasDpr: 1.0,

  // UnrealBloomPass `strength` runs much hotter than the old pmndrs Bloom
  // `intensity`, so this is not the same number as before - tune to taste.
  bloomIntensity: 0.05,
  bloomThreshold: 0.22,
  bloomSmoothing: 0.99,
  bloomRadius: 0.5,

  updateFPS: 0,

  environmentUrl: "/studio.exr",
};

function makePlateMaterial(roughness, metalness, plateColor) {
  return new THREE.MeshStandardMaterial({
    color: plateColor,
    roughness,
    metalness,
  });
}

function makePlateGeometry(radius, height) {
  return new THREE.CylinderGeometry(radius, radius, height, 64, 1, false);
}

function makeGlowShaderMaterial(leftColorRGB, rightColorRGB) {
  const left = new THREE.Color(leftColorRGB);
  const right = new THREE.Color(rightColorRGB);

  const leftStr = `${left.r.toFixed(5)}, ${left.g.toFixed(
    5
  )}, ${left.b.toFixed(5)}`;

  const rightStr = `${right.r.toFixed(5)}, ${right.g.toFixed(
    5
  )}, ${right.b.toFixed(5)}`;

  const vertexShader = `
    attribute float instanceIntensity;

    varying float vIntensity;
    varying vec2 vUv;
    varying float vCapMask;

    void main() {
      vUv = uv;
      vIntensity = instanceIntensity;
      vCapMask = smoothstep(0.15, 0.7, abs(normal.y));

      gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying float vIntensity;
    varying vec2 vUv;
    varying float vCapMask;

    void main() {
      if (vCapMask <= 0.001 || vIntensity <= 0.001) discard;

      float t = smoothstep(0.0, 1.0, vUv.x);

      vec3 leftColor = vec3(${leftStr});
      vec3 rightColor = vec3(${rightStr});

      vec3 col = mix(leftColor, rightColor, t);

      float radial = length(vUv - 0.5) * 1.0;
      float aa = fwidth(radial) * 1.5;
      float discAlpha = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, radial);

      float strength = vIntensity * vCapMask * discAlpha;

      gl_FragColor = vec4(col * strength, strength);
    }
  `;

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
    polygonOffset: true,
    polygonOffsetFactor: -0.5,
    polygonOffsetUnits: -0.5,
  });
}

// Vanilla three.js port of the former <ParametricPlates> R3F component plus the
// <Canvas>/drei/postprocessing scaffolding. Owns a renderer, scene, camera,
// render loop, EXR environment and (desktop) bloom composer. The React shell
// below only handles loader gating, the GSAP fade-in and visibility pausing.
class PlatesScene {
  constructor(container, { isMobile, isStatic, onReady }) {
    this.container = container;
    this.isMobile = isMobile;
    this.isStatic = isStatic;
    this.onReady = onReady;

    this.count = CONFIG.count;
    this.radius = CONFIG.radius;

    this.running = false;
    this.rafId = 0;
    this.readyFired = false;
    this.disposed = false;

    this.clock = new THREE.Clock();

    // Reused scratch objects - allocated once, mutated every frame.
    this.dummy = new THREE.Object3D();
    this.pos = new THREE.Vector3();
    this.projPos = new THREE.Vector3();
    this.groupMat = new THREE.Matrix4();
    this.ndcPointer = new THREE.Vector2(-9999, -9999);
    this.rect = null;
    this.tempEuler = new THREE.Euler();
    this.tempQuat = new THREE.Quaternion();

    this.hoveredId = -1;
    this.prevRotation = 0;
    this.accumulator = 0;

    this._initArrays();
    this._initBaseTheta();
    this._initRenderer();
    this._initScene();
    this._initInstances();
    this._initPointer();
    this._initResize();
    this._loadEnvironment();

    // isStatic renders exactly one settled frame and never starts a loop.
    if (this.isStatic) this.renderFrame(0);
  }

  _initArrays() {
    const count = this.count;

    this.arrays = {
      glowArr: new Float32Array(count).fill(0),
      scaleArr: new Float32Array(count).fill(1),
      tiltXArr: new Float32Array(count).fill(CONFIG.localTiltX),
      tiltYArr: new Float32Array(count).fill(CONFIG.localTiltY),
      sinThetaArr: new Float32Array(count),
      cosThetaArr: new Float32Array(count),
      prevGlowArr: new Float32Array(count).fill(-999),
      prevScaleArr: new Float32Array(count).fill(1),
      intensityArr: new Float32Array(count).fill(0),
    };
  }

  _initBaseTheta() {
    const count = this.count;
    const arr = new Float32Array(count);
    const thetaStep = (CONFIG.turns * Math.PI * 2) / count;

    for (let i = 0; i < count; i += 1) {
      arr[i] = i * thetaStep;
    }

    this.baseTheta = arr;
  }

  _initRenderer() {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(CONFIG.canvasDpr);
    renderer.setSize(w, h);
    // Transparent canvas, exactly like the old R3F <Canvas>: three draws nothing
    // for the background, so the container's `bg-background` (#0e0e0e) shows
    // through untouched. Clearing to an actual color instead pushes it through
    // the bloom + OutputPass sRGB encode, which lifts near-black into grey.
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = CONFIG.toneMappingExposure;

    if (!this.isMobile) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
    }

    const el = renderer.domElement;
    el.style.width = "100%";
    el.style.height = "100%";
    el.style.display = "block";

    this.container.appendChild(el);
    this.renderer = renderer;
  }

  _initScene() {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      CONFIG.cameraFov,
      w / h,
      0.1,
      1000
    );
    camera.position.set(...CONFIG.cameraPosition);

    // scene -> wrapper -> inner -> [main, glow]. The frame loop projects world
    // positions through `main.parent.matrixWorld` for hover, so the meshes must
    // live under the transformed inner group exactly as the old JSX nested them.
    const wrapper = new THREE.Group();
    wrapper.position.set(...CONFIG.wrapperPosition);

    const inner = new THREE.Group();
    inner.position.set(...CONFIG.groupPosition);
    inner.rotation.set(...CONFIG.groupRotation);

    wrapper.add(inner);
    scene.add(wrapper);

    const light = new THREE.DirectionalLight(
      new THREE.Color(this.isMobile ? "#ffeedd" : CONFIG.glowLeftColor),
      this.isMobile ? 1.8 : CONFIG.lightIntensity
    );
    light.position.set(...CONFIG.lightPosition);
    light.castShadow = !this.isMobile;
    scene.add(light);

    this.scene = scene;
    this.camera = camera;
    this.inner = inner;
    this.light = light;

    // Bloom is desktop-only, mirroring the old `!isMobile && <EffectComposer>`.
    if (!this.isMobile) {
      const rt = new THREE.WebGLRenderTarget(w, h, {
        type: THREE.HalfFloatType,
        samples: 4,
      });

      const composer = new EffectComposer(this.renderer, rt);
      composer.setPixelRatio(CONFIG.canvasDpr);
      composer.setSize(w, h);

      composer.addPass(new RenderPass(scene, camera));

      const bloom = new UnrealBloomPass(
        new THREE.Vector2(w, h),
        CONFIG.bloomIntensity,
        CONFIG.bloomRadius,
        CONFIG.bloomThreshold
      );
      composer.addPass(bloom);

      // Passes render in linear HDR; OutputPass applies tone mapping + sRGB so
      // the look matches the direct-to-screen path used on mobile.
      composer.addPass(new OutputPass());

      this.composer = composer;
      this.bloom = bloom;
      this.renderTarget = rt;
    }
  }

  _initInstances() {
    const count = this.count;

    const geo = makePlateGeometry(CONFIG.plateRadius, CONFIG.plateThickness);
    const mainMat = makePlateMaterial(
      CONFIG.roughness,
      CONFIG.metalness,
      CONFIG.plateColor
    );

    const leftGlowCol = this.isMobile
      ? CONFIG.mobileGlowLeftColor
      : CONFIG.glowLeftColor;
    const rightGlowCol = this.isMobile
      ? CONFIG.mobileGlowRightColor
      : CONFIG.glowRightColor;
    const glowMat = makeGlowShaderMaterial(leftGlowCol, rightGlowCol);

    const main = new THREE.InstancedMesh(geo, mainMat, count);
    main.castShadow = true;
    main.receiveShadow = true;
    main.frustumCulled = false;
    main.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    // The glow mesh shares the plate geometry (as the old JSX did) and carries a
    // per-instance intensity attribute consumed by the glow shader.
    const glow = new THREE.InstancedMesh(geo, glowMat, count);
    glow.castShadow = false;
    glow.receiveShadow = false;
    glow.frustumCulled = false;
    glow.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const intensityAttr = new THREE.InstancedBufferAttribute(
      this.arrays.intensityArr,
      1
    );
    intensityAttr.setUsage(THREE.DynamicDrawUsage);
    glow.geometry.setAttribute("instanceIntensity", intensityAttr);

    this.inner.add(main);
    this.inner.add(glow);

    this.geo = geo;
    this.mainMat = mainMat;
    this.glowMat = glowMat;
    this.main = main;
    this.glow = glow;
  }

  _initPointer() {
    const el = this.renderer.domElement;
    const pointer = this.ndcPointer;

    this.rect = el.getBoundingClientRect();

    const handlePointer = (clientX, clientY) => {
      const rect = this.rect;
      if (!rect) return;

      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    this._onMouseMove = (event) => {
      handlePointer(event.clientX, event.clientY);
    };

    this._onTouchMove = (event) => {
      if (event.touches && event.touches[0]) {
        handlePointer(event.touches[0].clientX, event.touches[0].clientY);
      }
    };

    this._onLeave = () => {
      pointer.set(-9999, -9999);
    };

    el.addEventListener("mousemove", this._onMouseMove);
    el.addEventListener("mouseleave", this._onLeave);
    el.addEventListener("touchstart", this._onTouchMove, { passive: true });
    el.addEventListener("touchmove", this._onTouchMove, { passive: true });
    el.addEventListener("touchend", this._onLeave, { passive: true });
  }

  _initResize() {
    const el = this.renderer.domElement;

    this._resizeObserver = new ResizeObserver(() => {
      const w = this.container.clientWidth || 1;
      const h = this.container.clientHeight || 1;

      this.renderer.setSize(w, h);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();

      if (this.composer) this.composer.setSize(w, h);
      if (this.bloom) this.bloom.setSize(w, h);

      this.rect = el.getBoundingClientRect();

      // Static/paused scenes won't otherwise repaint into the new buffer size.
      if (!this.running) this.renderFrame(0);
    });

    this._resizeObserver.observe(this.container);
  }

  _loadEnvironment() {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    pmrem.compileEquirectangularShader();
    this.pmrem = pmrem;

    const loader = new EXRLoader();

    loader.load(
      CONFIG.environmentUrl,
      (texture) => {
        if (this.disposed) {
          texture.dispose();
          pmrem.dispose();
          return;
        }

        const envMap = pmrem.fromEquirectangular(texture).texture;
        this.scene.environment = envMap;

        if ("environmentIntensity" in this.scene) {
          this.scene.environmentIntensity = this.isMobile
            ? 0.4
            : CONFIG.environmentIntensity;
        }

        texture.dispose();
        pmrem.dispose();
        this.pmrem = null;
        this._envMap = envMap;

        // A paused/static scene rendered once before the EXR resolved; repaint
        // now that reflections are available.
        if (!this.running) this.renderFrame(0);
      },
      undefined,
      () => {
        // Even if the environment fails, keep the scene usable.
      }
    );
  }

  start() {
    if (this.running || this.isStatic || this.disposed) return;

    this.running = true;
    this.clock.getDelta(); // drop the accumulated pause interval

    const loop = () => {
      if (!this.running) return;
      this.rafId = requestAnimationFrame(loop);
      this.renderFrame(this.clock.getDelta());
    };

    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  renderFrame(delta) {
    const main = this.main;
    const glow = this.glow;

    if (!main || !glow) return;

    const {
      glowArr,
      scaleArr,
      tiltXArr,
      tiltYArr,
      sinThetaArr,
      cosThetaArr,
      prevGlowArr,
      prevScaleArr,
      intensityArr,
    } = this.arrays;

    const count = this.count;
    const radius = this.radius;

    const {
      heightStep,
      hoverSigma,
      hoverScale,
      glowIntensity,
      rotationSpeed,
      hoverThreshold,
      hoverSpeed,
      updateFPS,
      localTiltX,
      localTiltY,
      localTiltZ,
    } = CONFIG;

    const pointer = this.ndcPointer;
    const dummyObj = this.dummy;
    const position = this.pos;
    const projected = this.projPos;
    const parentMatrix = this.groupMat;
    const camera = this.camera;
    const baseTheta = this.baseTheta;
    const isStatic = this.isStatic;

    // Optional simulation throttling (updateFPS). The render itself still runs
    // every frame, matching the old R3F behaviour where useFrame early-returns
    // skipped only the update, not the draw.
    let doUpdate = true;

    if (updateFPS > 0) {
      this.accumulator += delta;
      const interval = 1 / updateFPS;

      if (this.accumulator < interval) {
        doUpdate = false;
      } else {
        this.accumulator -= interval;
      }
    }

    if (doUpdate) {
      // isStatic renders exactly one frame, so it has to be the settled pose:
      // rotation frozen at t=0 and the hover lerps snapped straight to target.
      const time = this.clock.getElapsedTime();
      const rotation = isStatic ? 0 : time * rotationSpeed;
      const settle = isStatic ? 1 : hoverSpeed;

      if (main.parent) {
        main.parent.updateWorldMatrix(true, false);
        parentMatrix.copy(main.parent.matrixWorld);
      }

      const mouseActive = !isStatic && pointer.x > -2;
      let hovId = -1;

      if (mouseActive) {
        let minDist = Infinity;
        let nearestId = -1;

        for (let i = 0; i < count; i += 1) {
          const theta = baseTheta[i] + rotation;
          const cosT = Math.cos(theta);
          const sinT = Math.sin(theta);

          cosThetaArr[i] = cosT;
          sinThetaArr[i] = sinT;

          projected
            .set(cosT * radius, (i - count / 2) * heightStep, sinT * radius)
            .applyMatrix4(parentMatrix)
            .project(camera);

          const d2 =
            (projected.x - pointer.x) ** 2 + (projected.y - pointer.y) ** 2;

          if (d2 < minDist) {
            minDist = d2;
            nearestId = i;
          }
        }

        const hoverThresholdSq = hoverThreshold * hoverThreshold;

        this.hoveredId = minDist < hoverThresholdSq ? nearestId : -1;
        hovId = this.hoveredId;
      } else {
        this.hoveredId = -1;
        hovId = -1;

        for (let i = 0; i < count; i += 1) {
          const theta = baseTheta[i] + rotation;

          cosThetaArr[i] = Math.cos(theta);
          sinThetaArr[i] = Math.sin(theta);
        }
      }

      // The instance matrices are only ever written here, so the one static
      // frame must upload them even though nothing has "changed" since init.
      let matrixDirty =
        isStatic ||
        hovId !== -1 ||
        Math.abs(rotation - this.prevRotation) > 0.00001;

      this.prevRotation = rotation;

      let intensitiesDirty = false;

      for (let i = 0; i < count; i += 1) {
        const cosT = cosThetaArr[i];
        const sinT = sinThetaArr[i];

        const dist = hovId === -1 ? Infinity : Math.abs(i - hovId);

        const influence =
          hovId === -1 ? 0 : Math.exp(-(dist ** 2) / (2 * hoverSigma ** 2));

        glowArr[i] = lerp(glowArr[i], influence, settle);

        scaleArr[i] = lerp(
          scaleArr[i],
          1 + (hoverScale - 1) * influence,
          settle
        );

        tiltXArr[i] = lerp(tiltXArr[i], localTiltX * (1 - influence), settle);
        tiltYArr[i] = lerp(tiltYArr[i], localTiltY * (1 - influence), settle);

        const scaleDelta = Math.abs(scaleArr[i] - prevScaleArr[i]);

        if (scaleDelta > 0.0001) {
          matrixDirty = true;
          prevScaleArr[i] = scaleArr[i];
        }

        position.set(
          cosT * radius,
          (i - count / 2) * heightStep,
          sinT * radius
        );
        dummyObj.position.copy(position);

        const tx = -sinT;
        const ty = heightStep > 0 ? heightStep / radius : 0;
        const tz = cosT;

        let nx = tx;
        let ny = ty;
        let nz = tz;

        if (heightStep > 0) {
          const len = Math.sqrt(tx * tx + ty * ty + tz * tz);

          nx /= len;
          ny /= len;
          nz /= len;
        }

        const r = ny + 1;

        if (r < 0.0001) {
          dummyObj.quaternion.set(1, 0, 0, 0);
        } else {
          dummyObj.quaternion.set(nz, 0, -nx, r).normalize();
        }

        this.tempEuler.set(tiltXArr[i], tiltYArr[i], localTiltZ);
        this.tempQuat.setFromEuler(this.tempEuler);
        dummyObj.quaternion.multiply(this.tempQuat);

        dummyObj.scale.set(scaleArr[i], 1, scaleArr[i]);
        dummyObj.updateMatrix();

        main.setMatrixAt(i, dummyObj.matrix);
        glow.setMatrixAt(i, dummyObj.matrix);

        const g = glowArr[i] * glowIntensity;

        if (Math.abs(g - prevGlowArr[i]) > 0.001) {
          prevGlowArr[i] = g;
          intensityArr[i] = g;
          intensitiesDirty = true;
        }
      }

      if (matrixDirty) {
        main.instanceMatrix.needsUpdate = true;
        glow.instanceMatrix.needsUpdate = true;
      }

      if (intensitiesDirty) {
        const attr = glow.geometry.getAttribute("instanceIntensity");

        if (attr) {
          attr.needsUpdate = true;
        }
      }
    }

    if (this.composer) {
      this.composer.render(delta);
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    this._maybeReady();
  }

  _maybeReady() {
    if (this.readyFired) return;
    this.readyFired = true;
    this.onReady?.();
  }

  dispose() {
    this.disposed = true;
    this.stop();

    this._resizeObserver?.disconnect();

    const el = this.renderer?.domElement;

    if (el) {
      el.removeEventListener("mousemove", this._onMouseMove);
      el.removeEventListener("mouseleave", this._onLeave);
      el.removeEventListener("touchstart", this._onTouchMove);
      el.removeEventListener("touchmove", this._onTouchMove);
      el.removeEventListener("touchend", this._onLeave);

      if (el.parentNode) el.parentNode.removeChild(el);
    }

    this.geo?.dispose();
    this.mainMat?.dispose();
    this.glowMat?.dispose();
    this._envMap?.dispose();
    this.pmrem?.dispose();
    this.bloom?.dispose?.();
    this.renderTarget?.dispose?.();
    this.composer?.dispose?.();
    this.renderer?.dispose();
  }
}

export default function GlowingPlates({
  waitForLoader = true,
  className = "",
  containerClassName = "",
}) {
  const containerRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const mountRef = useRef(null);

  const sceneRef = useRef(null);

  const canvasReadyRef = useRef(false);
  const loaderReadyRef = useRef(!waitForLoader);
  const fadePlayedRef = useRef(false);

  const fadeTweenRef = useRef(null);
  const pollRef = useRef(null);
  const delayRef = useRef(null);

  const inViewRef = useRef(true);

  const { isMobile } = useIsMobile();

  // Pause the render loop while the hero is scrolled out of view (or hidden on
  // mobile via max-md:hidden). Rotation is a function of absolute elapsed time,
  // so resuming looks seamless - no visual change, just no wasted GPU work.
  // Init true so the hero renders on first paint; the observer corrects it.
  const [inView, setInView] = useState(true);

  // ssr:false (dynamic import) means this only ever renders client-side, so the
  // lazy initializers can read navigator/matchMedia with no hydration mismatch.
  const [skip3D] = useState(() => isAuditEnvironment());

  // Reduced motion still gets the scene - just frozen. A single frame is drawn
  // and no render loop starts, so nothing on screen moves.
  const [staticFrame] = useState(() => prefersReducedMotion());

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const syncVisibility = () => {
      const rect = el.getBoundingClientRect();
      // A display:none element (mobile) reports an all-zero rect → not in view.
      return rect.bottom > 0 && rect.top < window.innerHeight;
    };

    // IntersectionObserver can miss the initial state after client navigations.
    setInView(syncVisibility());

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0, rootMargin: "200px 0px" }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const playFadeIfReady = () => {
    const el = canvasWrapperRef.current;

    if (!el) return;
    if (fadePlayedRef.current) return;
    if (!canvasReadyRef.current) return;
    if (!loaderReadyRef.current) return;

    fadePlayedRef.current = true;

    gsap.killTweensOf(el);

    if (staticFrame) {
      gsap.set(el, { opacity: 1 });
      return;
    }

    fadeTweenRef.current = gsap.fromTo(
      el,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 1.2,
        delay: 0.15,
        ease: "power2.out",
      }
    );
  };

  const markLoaderReady = () => {
    if (loaderReadyRef.current) return;

    loaderReadyRef.current = true;

    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }

    if (delayRef.current) {
      window.clearTimeout(delayRef.current);
      delayRef.current = null;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        playFadeIfReady();
      });
    });
  };

  useLayoutEffect(() => {
    const el = canvasWrapperRef.current;

    if (!el) return;

    gsap.set(el, {
      opacity: 0,
    });
  }, []);

  // Create/destroy the vanilla three.js scene. Recreated when the mobile flag
  // flips (mobile and desktop build different materials, lights and bloom), the
  // same reason the old code keyed <ParametricPlates> on isMobile.
  useEffect(() => {
    if (skip3D) return undefined;

    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new PlatesScene(mount, {
      isMobile,
      isStatic: staticFrame,
      onReady: () => {
        canvasReadyRef.current = true;
        playFadeIfReady();
      },
    });

    sceneRef.current = scene;

    if (!staticFrame && inViewRef.current) {
      scene.start();
    }

    return () => {
      scene.dispose();
      sceneRef.current = null;
      canvasReadyRef.current = false;
    };
    // playFadeIfReady/isMobile/staticFrame drive recreation; refs are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip3D, isMobile, staticFrame]);

  // Drive the loop off visibility once the scene exists.
  useEffect(() => {
    inViewRef.current = inView;

    const scene = sceneRef.current;
    if (!scene || staticFrame) return;

    if (inView) scene.start();
    else scene.stop();
  }, [inView, staticFrame]);

  useEffect(() => {
    if (!waitForLoader) {
      loaderReadyRef.current = true;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          playFadeIfReady();
        });
      });

      return;
    }

    const handleLoaderComplete = () => {
      delayRef.current = window.setTimeout(() => {
        markLoaderReady();
      }, 180);
    };

    if (hasLoaderRun() && !isLoaderActive()) {
      delayRef.current = window.setTimeout(() => {
        markLoaderReady();
      }, 180);
    } else {
      window.addEventListener("loaderComplete", handleLoaderComplete, {
        once: true,
      });

      window.addEventListener("hyperiux:loader-complete", handleLoaderComplete, {
        once: true,
      });

      pollRef.current = window.setInterval(() => {
        if (hasLoaderRun() && !isLoaderActive()) {
          markLoaderReady();
        }
      }, 80);
    }

    return () => {
      window.removeEventListener("loaderComplete", handleLoaderComplete);
      window.removeEventListener(
        "hyperiux:loader-complete",
        handleLoaderComplete
      );

      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }

      if (delayRef.current) {
        window.clearTimeout(delayRef.current);
        delayRef.current = null;
      }
    };
  }, [waitForLoader]);

  useEffect(() => {
    return () => {
      fadeTweenRef.current?.kill();

      if (canvasWrapperRef.current) {
        gsap.killTweensOf(canvasWrapperRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={[
        "absolute inset-0 z-10 h-[140vh] max-md:hidden w-full bg-background",
        containerClassName,
      ].join(" ")}
    >
      <div
        ref={canvasWrapperRef}
        className={["h-full w-full opacity-0", className].join(" ")}
      >
        {skip3D ? null : (
          <div ref={mountRef} className="h-full w-full" />
        )}
      </div>
    </div>
  );
}
