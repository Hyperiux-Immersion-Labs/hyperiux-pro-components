/* The fluid off the main thread: fluid-field.js transfers its two canvases here (OffscreenCanvas)
   and sends one "frame" message per animation frame while the field is moving. Each frame is
   simulated and drawn here, so scrolling and the page's own animations never wait on it. */
import { createFluidCore } from "./fluid-core";

let core = null;

self.onmessage = ({ data: msg }) => {
  switch (msg.type) {
    case "init":
      core = createFluidCore(msg.options, msg.ink, msg.dots);
      break;
    case "resize":
      core.resize(msg.width, msg.height, msg.pixelRatio, msg.viewportHeight);
      core.draw();
      break;
    case "pointer":
      core.pointer(msg.x, msg.y);
      break;
    case "frame":
      // The reply tells the page whether the field has settled, and that it may send the next frame
      self.postMessage({ type: "done", calm: core.frame(msg.scrollY, msg.wake) });
      break;
    case "splash":
      core.splash(msg.x, msg.y);
      break;
    case "burst":
      core.burst(msg.x, msg.y, msg.power);
      break;
    case "vortex":
      core.setVortex(msg.x, msg.y, msg.a);
      break;
    case "clear":
      core?.clear();
      break;
  }
};
