import { AUDIT_UA_PATTERN, SOFTWARE_RENDERER_PATTERN } from "./audit";

// Session flag the homepage loader writes once it has played (see loader-state.js)
export const LOADER_PLAYED_KEY = "hyperiux-v3:loader-played";

/**
 * The homepage decides before its first paint whether this visit plays the loader and
 * the hero intro, instead of covering the page until React hydrates and decides then.
 * Everything the intro animates in can then paint straight from the server HTML when
 * there is no intro (audits, reduced motion, software WebGL), and stays hidden from the
 * very first frame when there is one, so it never shows and then jumps away.
 *
 * Sets on <html>, homepage only:
 * - data-hx-hero-intro: the hero's heading, copy and buttons will animate in
 * - data-hx-loader: the loader plays (first visit this session)
 * and window.__HX_INTRO_GATE__ = { loader, hero }, read once by Loader and Hero via
 * takeIntroGate(). The same checks as their own fallbacks, so the two never disagree.
 *
 * The WebGL probe's result is kept on window.__HX_SOFTWARE_GL__ for isSoftwareRenderer().
 */
export const INTRO_GATE_SCRIPT = `(function(){try{
var p=location.pathname;if(p!=='/'&&p!=='/index')return;
var n=navigator,audit=n.webdriver===true||${AUDIT_UA_PATTERN}.test(n.userAgent||'');
var reduced=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
var soft=false;
if(!audit&&!reduced){try{var c=document.createElement('canvas'),gl=c.getContext('webgl')||c.getContext('experimental-webgl');
var di=gl&&gl.getExtension('WEBGL_debug_renderer_info');var r=gl?(di?gl.getParameter(di.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)):'';
soft=typeof r==='string'&&${SOFTWARE_RENDERER_PATTERN}.test(r);var lc=gl&&gl.getExtension('WEBGL_lose_context');lc&&lc.loseContext();
}catch(e){soft=true}window.__HX_SOFTWARE_GL__=soft;}
var hero=!audit&&!reduced&&!soft,played=false;
try{played=sessionStorage.getItem('${LOADER_PLAYED_KEY}')==='1'}catch(e){}
var loader=hero&&!played,el=document.documentElement;
if(hero)el.setAttribute('data-hx-hero-intro','');
if(loader)el.setAttribute('data-hx-loader','');
window.__HX_INTRO_GATE__={loader:loader,hero:hero};
}catch(e){}})();`;

/**
 * The head script's decision for `key` ("loader" or "hero"), once per full page load.
 * Returns null on a later client-side visit to the homepage, where the caller falls back
 * on its own checks.
 */
export function takeIntroGate(key) {
  if (typeof window === "undefined") return null;
  const gate = window.__HX_INTRO_GATE__;
  if (!gate || !(key in gate)) return null;
  const value = gate[key];
  delete gate[key];
  return value;
}
