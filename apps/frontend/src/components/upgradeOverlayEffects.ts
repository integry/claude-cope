export const UPGRADE_NAG_CLOSE_EFFECTS = [
  "death-spiral",
  "emergency-eject",
  "singularity",
  "task-manager",
  "bsod",
  "catastrophic-reorg",
  "heat-death",
  "moonfall",
  "tectonic-slip",
  "vacuum-decay",
  "sun-expansion",
  "planet-kernel-panic",
  "chrono-rollback",
  "rapture-protocol",
  "black-hole-compliance",
  "reality-patch-tuesday",
  "ocean-overwrite",
  "sky-crack",
] as const;

export type UpgradeNagCloseEffect = typeof UPGRADE_NAG_CLOSE_EFFECTS[number];

export const DEFAULT_CLOSE_EFFECT: UpgradeNagCloseEffect = "death-spiral";

export const CLOSE_EFFECT_STYLES = `
@keyframes upgrade-overlay-death-spiral{0%{opacity:1;filter:blur(0) saturate(1) contrast(1);transform:perspective(1200px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1) skew(0deg,0deg)}100%{opacity:0;filter:blur(12px) saturate(.15) contrast(1.8);transform:perspective(1200px) rotateX(-24deg) rotateY(24deg) rotateZ(-18deg) scale(.68) skew(-8deg,5deg)}}
@keyframes upgrade-overlay-emergency-eject{0%{opacity:1;filter:blur(0) brightness(1);transform:translate3d(0,0,0) rotate(0deg) scale(1)}20%{transform:translate3d(18px,-12px,0) rotate(4deg) scale(1.02)}100%{opacity:0;filter:blur(10px) brightness(1.5);transform:translate3d(180px,-120vh,0) rotate(18deg) scale(.72)}}
@keyframes upgrade-overlay-singularity{0%{opacity:1;filter:blur(0) hue-rotate(0deg);transform:scale(1) rotate(0deg)}45%{opacity:1;filter:blur(1px) hue-rotate(90deg);transform:scale(1.08) rotate(-8deg)}100%{opacity:0;filter:blur(18px) hue-rotate(240deg);transform:scale(.03) rotate(1080deg)}}
@keyframes upgrade-overlay-task-manager{0%{opacity:1;filter:grayscale(0) blur(0);transform:scaleX(1) scaleY(1) translate3d(0,0,0)}50%{opacity:1;filter:grayscale(.8) blur(1px);transform:scaleX(1.06) scaleY(.92) translate3d(-12px,0,0)}100%{opacity:0;filter:grayscale(1) blur(8px);transform:scaleX(.02) scaleY(.78) translate3d(-120vw,0,0)}}
@keyframes upgrade-overlay-bsod{0%{opacity:1;background-color:#1e232b;color:inherit;filter:blur(0);transform:scale(1) rotate(0deg)}12%{background-color:#0015aa;color:#d6e4ff}55%{opacity:1;filter:blur(1px);transform:scale(1.02) rotate(-1deg)}100%{opacity:0;background-color:#0015aa;color:#d6e4ff;filter:blur(14px);transform:scale(.82) rotate(-7deg) translate3d(0,26vh,0)}}
@keyframes upgrade-overlay-catastrophic-reorg{0%{opacity:1;filter:blur(0) saturate(1);transform:translate3d(0,0,0) rotate(0deg) scale(1)}15%{transform:translate3d(-24px,8px,0) rotate(-3deg) scale(1.02)}30%{transform:translate3d(26px,-10px,0) rotate(4deg) scale(1.03)}45%{transform:translate3d(-18px,14px,0) rotate(-6deg) scale(1.01)}100%{opacity:0;filter:blur(16px) saturate(2.1) hue-rotate(135deg);transform:translate3d(0,120vh,0) rotate(22deg) scale(1.28)}}
@keyframes upgrade-overlay-heat-death{0%{opacity:1;filter:brightness(1) saturate(1);transform:scale(1)}35%{opacity:1;filter:brightness(1.8) saturate(1.5);transform:scale(1.04)}100%{opacity:0;filter:brightness(2.8) saturate(.1) blur(14px);transform:scale(1.22)}}
@keyframes upgrade-overlay-moonfall{0%{opacity:1;transform:translate3d(0,0,0) rotate(0deg) scale(1)}25%{transform:translate3d(0,-14px,0) rotate(-2deg) scale(1.02)}100%{opacity:0;filter:blur(12px);transform:translate3d(-10vw,110vh,0) rotate(28deg) scale(.7)}}
@keyframes upgrade-overlay-tectonic-slip{0%{opacity:1;clip-path:inset(0 0 0 0);transform:translate3d(0,0,0)}30%{clip-path:inset(0 0 10% 0);transform:translate3d(-18px,0,0)}60%{clip-path:inset(12% 0 0 0);transform:translate3d(22px,8px,0)}100%{opacity:0;filter:blur(10px);clip-path:inset(48% 0 0 0);transform:translate3d(0,80vh,0)}}
@keyframes upgrade-overlay-vacuum-decay{0%{opacity:1;filter:invert(0) blur(0);transform:scale(1)}10%{filter:invert(1) blur(0)}55%{opacity:1;filter:invert(1) hue-rotate(180deg) blur(3px);transform:scale(1.08)}100%{opacity:0;filter:invert(1) hue-rotate(320deg) blur(18px);transform:scale(.01)}}
@keyframes upgrade-overlay-sun-expansion{0%{opacity:1;box-shadow:0 0 0 rgba(255,180,0,0);transform:scale(1)}40%{opacity:1;box-shadow:0 0 60px rgba(255,180,0,.65);transform:scale(1.08)}100%{opacity:0;filter:blur(15px);box-shadow:0 0 140px rgba(255,220,120,.95);transform:scale(1.45)}}
@keyframes upgrade-overlay-planet-kernel-panic{0%{opacity:1;transform:rotate(0deg) translate3d(0,0,0)}18%{transform:rotate(-4deg) translate3d(-22px,6px,0)}36%{transform:rotate(6deg) translate3d(26px,-10px,0)}54%{transform:rotate(-8deg) translate3d(-30px,12px,0)}100%{opacity:0;filter:blur(16px) contrast(1.8);transform:rotate(20deg) translate3d(0,-130vh,0) scale(.62)}}
@keyframes upgrade-overlay-chrono-rollback{0%{opacity:1;filter:blur(0);transform:scale(1)}20%{opacity:.2;transform:scale(1.08)}40%{opacity:1;transform:scale(.96)}60%{opacity:.3;transform:scale(1.05)}100%{opacity:0;filter:blur(9px);transform:translate3d(-140vw,0,0) scale(.9)}}
@keyframes upgrade-overlay-rapture-protocol{0%{opacity:1;filter:brightness(1);transform:translate3d(0,0,0) scale(1)}35%{opacity:1;filter:brightness(1.7);transform:translate3d(0,-24px,0) scale(1.04)}100%{opacity:0;filter:brightness(2.1) blur(13px);transform:translate3d(0,-120vh,0) scale(.55)}}
@keyframes upgrade-overlay-black-hole-compliance{0%{opacity:1;transform:perspective(1200px) rotateY(0deg) scale(1)}45%{opacity:1;transform:perspective(1200px) rotateY(22deg) scale(.82)}100%{opacity:0;filter:blur(20px) contrast(2.2);transform:perspective(1200px) rotateY(90deg) scale(.02)}}
@keyframes upgrade-overlay-reality-patch-tuesday{0%{opacity:1;filter:blur(0);transform:translate3d(0,0,0)}12%{opacity:.7;transform:translate3d(-40px,0,0)}13%{opacity:1;transform:translate3d(46px,0,0)}40%{opacity:1;filter:blur(2px) hue-rotate(90deg)}100%{opacity:0;filter:blur(12px) hue-rotate(270deg);transform:translate3d(0,0,0) scaleX(1.4) scaleY(.08)}}
@keyframes upgrade-overlay-ocean-overwrite{0%{opacity:1;transform:translate3d(0,0,0)}30%{opacity:1;transform:translate3d(0,18px,0) skewY(2deg)}100%{opacity:0;filter:blur(14px) saturate(1.6);transform:translate3d(0,120vh,0) skewY(10deg) scale(1.08)}}
@keyframes upgrade-overlay-sky-crack{0%{opacity:1;clip-path:polygon(0 0,100% 0,100% 100%,0 100%);transform:scale(1)}35%{opacity:1;clip-path:polygon(0 0,100% 0,84% 100%,18% 100%);transform:scale(1.01)}100%{opacity:0;filter:blur(11px);clip-path:polygon(46% 0,54% 0,100% 100%,0 100%);transform:scale(1.16)}}
@keyframes upgrade-overlay-backdrop-collapse{0%{opacity:.7;backdrop-filter:blur(0)}100%{opacity:0;backdrop-filter:blur(6px)}}
@keyframes upgrade-overlay-backdrop-pulse-out{0%{opacity:.7;transform:scale(1)}35%{opacity:.9;transform:scale(1.01)}100%{opacity:0;transform:scale(1.08)}}
@keyframes upgrade-overlay-backdrop-blue-screen{0%{opacity:.7;background:rgba(0,0,0,.7)}15%{opacity:.95;background:rgba(0,21,170,.96)}100%{opacity:0;background:rgba(0,21,170,.2)}}
@keyframes upgrade-overlay-backdrop-flash-fry{0%{opacity:.7;background:rgba(0,0,0,.7)}30%{opacity:1;background:rgba(255,140,0,.6)}100%{opacity:0;background:rgba(255,230,180,.15)}}
@keyframes upgrade-overlay-backdrop-void{0%{opacity:.7;background:rgba(0,0,0,.7)}100%{opacity:0;background:rgba(255,255,255,.04)}}
@keyframes upgrade-overlay-backdrop-flood{0%{opacity:.7;background:rgba(0,0,0,.7)}45%{opacity:.95;background:rgba(35,122,255,.55)}100%{opacity:0;background:rgba(35,122,255,.12)}}
@keyframes upgrade-overlay-screen-quake{0%,100%{transform:translate3d(0,0,0)}10%{transform:translate3d(-16px,6px,0)}20%{transform:translate3d(14px,-10px,0)}30%{transform:translate3d(-12px,-6px,0)}40%{transform:translate3d(18px,12px,0)}50%{transform:translate3d(-14px,8px,0)}60%{transform:translate3d(10px,-12px,0)}70%{transform:translate3d(-8px,10px,0)}80%{transform:translate3d(12px,-8px,0)}90%{transform:translate3d(-6px,4px,0)}}
@keyframes upgrade-overlay-screen-strobe{0%,100%{filter:invert(0)}50%{filter:invert(1)}}
@keyframes upgrade-overlay-screen-tilt{0%,100%{transform:rotate(0deg)}25%{transform:rotate(-1.4deg)}75%{transform:rotate(1.2deg)}}
`;

type CloseEffectPresentation = {
  panelAnimation: string;
  backdropAnimation: string;
  overlayAnimation?: string;
};

const CLOSE_EFFECT_PRESENTATIONS: Record<UpgradeNagCloseEffect, CloseEffectPresentation> = {
  "death-spiral": { panelAnimation: "upgrade-overlay-death-spiral 3s cubic-bezier(0.2, 0.02, 0.1, 1) forwards", backdropAnimation: "upgrade-overlay-backdrop-collapse 3s ease-out forwards" },
  "emergency-eject": { panelAnimation: "upgrade-overlay-emergency-eject 3s cubic-bezier(0.18, 0.7, 0.18, 1) forwards", backdropAnimation: "upgrade-overlay-backdrop-pulse-out 3s ease-out forwards" },
  singularity: { panelAnimation: "upgrade-overlay-singularity 3s cubic-bezier(0.45, 0, 0.2, 1) forwards", backdropAnimation: "upgrade-overlay-backdrop-pulse-out 3s ease-in forwards" },
  "task-manager": { panelAnimation: "upgrade-overlay-task-manager 3s cubic-bezier(0.3, 0.02, 0.1, 1) forwards", backdropAnimation: "upgrade-overlay-backdrop-collapse 3s linear forwards" },
  bsod: { panelAnimation: "upgrade-overlay-bsod 3s cubic-bezier(0.15, 0.75, 0.2, 1) forwards", backdropAnimation: "upgrade-overlay-backdrop-blue-screen 3s ease-out forwards" },
  "catastrophic-reorg": { panelAnimation: "upgrade-overlay-catastrophic-reorg 3s cubic-bezier(0.18, 0.82, 0.18, 1) forwards", backdropAnimation: "upgrade-overlay-backdrop-pulse-out 3s ease-out forwards", overlayAnimation: "upgrade-overlay-screen-quake 260ms steps(2, end) 0s 10" },
  "heat-death": { panelAnimation: "upgrade-overlay-heat-death 3s ease-in forwards", backdropAnimation: "upgrade-overlay-backdrop-flash-fry 3s ease-out forwards" },
  moonfall: { panelAnimation: "upgrade-overlay-moonfall 3s cubic-bezier(0.22, 0.66, 0.18, 1) forwards", backdropAnimation: "upgrade-overlay-backdrop-collapse 3s ease-in forwards", overlayAnimation: "upgrade-overlay-screen-tilt 420ms ease-in-out 0s 7" },
  "tectonic-slip": { panelAnimation: "upgrade-overlay-tectonic-slip 3s cubic-bezier(0.16, 0.84, 0.14, 1) forwards", backdropAnimation: "upgrade-overlay-backdrop-collapse 3s linear forwards", overlayAnimation: "upgrade-overlay-screen-quake 220ms steps(2, end) 0s 11" },
  "vacuum-decay": { panelAnimation: "upgrade-overlay-vacuum-decay 3s cubic-bezier(0.55, 0, 0.2, 1) forwards", backdropAnimation: "upgrade-overlay-backdrop-void 3s ease-out forwards", overlayAnimation: "upgrade-overlay-screen-strobe 110ms steps(2, end) 0s 16" },
  "sun-expansion": { panelAnimation: "upgrade-overlay-sun-expansion 3s ease-in forwards", backdropAnimation: "upgrade-overlay-backdrop-flash-fry 3s ease-out forwards" },
  "planet-kernel-panic": { panelAnimation: "upgrade-overlay-planet-kernel-panic 3s cubic-bezier(0.2, 0.78, 0.2, 1) forwards", backdropAnimation: "upgrade-overlay-backdrop-blue-screen 3s ease-in forwards", overlayAnimation: "upgrade-overlay-screen-quake 180ms steps(2, end) 0s 13" },
  "chrono-rollback": { panelAnimation: "upgrade-overlay-chrono-rollback 3s steps(1, end) forwards", backdropAnimation: "upgrade-overlay-backdrop-void 3s linear forwards", overlayAnimation: "upgrade-overlay-screen-strobe 150ms steps(2, end) 0s 12" },
  "rapture-protocol": { panelAnimation: "upgrade-overlay-rapture-protocol 3s cubic-bezier(0.18, 0.78, 0.16, 1) forwards", backdropAnimation: "upgrade-overlay-backdrop-void 3s ease-out forwards" },
  "black-hole-compliance": { panelAnimation: "upgrade-overlay-black-hole-compliance 3s cubic-bezier(0.52, 0, 0.18, 1) forwards", backdropAnimation: "upgrade-overlay-backdrop-void 3s ease-in forwards" },
  "reality-patch-tuesday": { panelAnimation: "upgrade-overlay-reality-patch-tuesday 3s steps(2, end) forwards", backdropAnimation: "upgrade-overlay-backdrop-blue-screen 3s linear forwards", overlayAnimation: "upgrade-overlay-screen-strobe 90ms steps(2, end) 0s 18" },
  "ocean-overwrite": { panelAnimation: "upgrade-overlay-ocean-overwrite 3s cubic-bezier(0.18, 0.7, 0.15, 1) forwards", backdropAnimation: "upgrade-overlay-backdrop-flood 3s ease-out forwards" },
  "sky-crack": { panelAnimation: "upgrade-overlay-sky-crack 3s cubic-bezier(0.24, 0.8, 0.18, 1) forwards", backdropAnimation: "upgrade-overlay-backdrop-pulse-out 3s linear forwards", overlayAnimation: "upgrade-overlay-screen-tilt 360ms ease-in-out 0s 8" },
};

export function getCloseEffectPresentation(effect: UpgradeNagCloseEffect): CloseEffectPresentation {
  return CLOSE_EFFECT_PRESENTATIONS[effect] ?? CLOSE_EFFECT_PRESENTATIONS[DEFAULT_CLOSE_EFFECT];
}
