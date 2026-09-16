"use client";

import { useEffect } from "react";

const FAVICON_SIZE = 32;
const BASE_FAVICON_SRC = "/favicon-32x32.png";
const DOT_RADIUS = 6;
const ACTIVE_COLOR = "#22c55e";
const INACTIVE_COLOR = "#ef4444";

function drawFavicon(image, active) {
  const canvas = document.createElement("canvas");
  canvas.width = FAVICON_SIZE;
  canvas.height = FAVICON_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(image, 0, 0, FAVICON_SIZE, FAVICON_SIZE);

  const cx = FAVICON_SIZE - DOT_RADIUS - 1;
  const cy = FAVICON_SIZE - DOT_RADIUS - 1;

  // Dark ring behind the dot so it stays legible against whatever part of
  // the logo it happens to land on.
  ctx.beginPath();
  ctx.arc(cx, cy, DOT_RADIUS + 1.5, 0, Math.PI * 2);
  ctx.fillStyle = "#0c0c0c";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, DOT_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = active ? ACTIVE_COLOR : INACTIVE_COLOR;
  ctx.fill();

  return canvas.toDataURL("image/png");
}

function setFaviconHref(href) {
  // The static <link rel="icon"> tags in layout.js are left alone (and
  // their original hrefs stay the source of truth for e.g. bookmarking) -
  // this adds one more 32x32 icon link, later in <head> so it wins, rather
  // than rewriting those in place.
  let link = document.querySelector('link[rel="icon"][data-tab-status]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.sizes = "32x32";
    link.dataset.tabStatus = "true";
    document.head.appendChild(link);
  }
  link.href = href;
}

// Overlays a small status dot on the tab favicon (bottom-right, over the
// logo) - green while this is the active/visible tab, red once the user
// switches to another tab or app. Purely a glanceable "is this still my
// active tab" cue, driven by the standard Page Visibility API.
export default function TabActivityFavicon() {
  useEffect(() => {
    const image = new Image();

    const update = () => {
      if (!image.complete || image.naturalWidth === 0) return;
      const href = drawFavicon(image, document.visibilityState === "visible");
      if (href) setFaviconHref(href);
    };

    image.onload = update;
    image.src = BASE_FAVICON_SRC;

    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return null;
}
