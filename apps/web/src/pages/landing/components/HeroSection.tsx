import { useEffect, useRef } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";

/* ------------------------------------------------------------------
   "The Span", now the whole hero.
   Application lines run edge to edge, are drawn through one gateway
   beam, and fan out to three providers whose marks sit on the right.
   - Requests stream through continuously; each arrival lights its
     provider.
   - The gateway follows your cursor vertically (the whole span leans).
   - Click anywhere to send your own request through it.
   The only orchid mark is still the gateway's port.
   Canvas, one rAF loop, paused off screen, DPR capped at 2.
------------------------------------------------------------------- */

// Brand marks: simple-icons (Anthropic, Gemini) and simple-icons v13 (OpenAI).
const PROVIDERS = [
  {
    name: "OpenAI",
    fill: "#f7f7f7",
    path: "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z",
  },
  {
    name: "Anthropic",
    fill: "#d97757",
    path: "M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z",
  },
  {
    name: "Google Gemini",
    fill: "url(#setu-gem)",
    path: "M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81",
  },
];

const NAV = 68;

/* ----------------------------- geometry --------------------------- */
const LEFT = 34; // application lines
const STRANDS = 4; // strands per provider
const RIGHT = STRANDS * PROVIDERS.length;
const ACC_L = 13; // the faint cyan route
const ACC_R = STRANDS + 1;
const PROV_Y = [0.24, 0.5, 0.76]; // chip centres, fraction of graphic height

type Packet = {
  l: number;
  r: number;
  g: number;
  t: number;
  phase: 0 | 1;
  wait: number;
  hot: boolean;
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const bz = (a: number, b: number, c: number, d: number, t: number) => {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
};

function createEngine(
  hero: HTMLElement,
  wrap: HTMLElement,
  canvas: HTMLCanvasElement,
  chips: HTMLElement[],
  tag: HTMLElement,
  hint: HTMLElement | null,
  reduce: boolean,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  let w = 0;
  let h = 0;
  let dpr = 1;
  let neckX = 0;
  let endX = 0;
  let baseY = 0;
  let neckY = 0;
  let targetY = 0;
  let inited = false;
  let ys: number[] = [];
  let gradL: CanvasGradient;
  let gradR: CanvasGradient;
  let gradRuler: CanvasGradient;

  let intro = reduce ? 1 : 0;
  let kick = 0;
  let hover = 0;
  let hoverTarget = 0;
  let raf = 0;
  let last = 0;
  let tagTimer = 0;

  const pool: Packet[] = Array.from({ length: 12 }, (_, i) => ({
    l: 0,
    r: 0,
    g: 0,
    t: 0,
    phase: 0,
    wait: 1.4 + i * 0.5,
    hot: false,
  }));
  const tmp = { x: 0, y: 0 };

  const nyL = (i: number) => neckY + (i - (LEFT - 1) / 2) * 0.9;
  const nyR = (j: number) => neckY + (j - (RIGHT - 1) / 2) * 0.9;
  const eyR = (j: number) =>
    PROV_Y[Math.floor(j / STRANDS)] * h +
    ((j % STRANDS) - (STRANDS - 1) / 2) * 7;

  const resize = () => {
    w = wrap.clientWidth;
    h = wrap.clientHeight;
    if (!w || !h) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    neckX = w * (window.innerWidth <= 700 ? 0.5 : 0.46);
    endX = (chips[0] ? chips[0].offsetLeft : w * 0.85) - 14;
    baseY = h * 0.52;
    if (!inited) {
      neckY = targetY = baseY;
      inited = true;
    } else {
      targetY = baseY;
    }
    const pad = 14;
    ys = Array.from(
      { length: LEFT },
      (_, i) => pad + (i * (h - 2 * pad)) / (LEFT - 1),
    );

    gradL = ctx.createLinearGradient(0, 0, neckX, 0);
    gradL.addColorStop(0, "rgba(48,54,61,0)");
    gradL.addColorStop(0.5, "rgba(58,66,71,0.5)");
    gradL.addColorStop(1, "rgba(86,93,102,1)");
    gradR = ctx.createLinearGradient(neckX, 0, endX, 0);
    gradR.addColorStop(0, "rgba(86,93,102,1)");
    gradR.addColorStop(0.5, "rgba(58,66,71,0.95)");
    gradR.addColorStop(1, "rgba(48,54,61,0.95)");
    gradRuler = ctx.createLinearGradient(0, 0, 0, h);
    gradRuler.addColorStop(0, "rgba(32,32,38,1)");
    gradRuler.addColorStop(0.18, "rgba(32,32,38,0)");
    gradRuler.addColorStop(0.82, "rgba(32,32,38,0)");
    gradRuler.addColorStop(1, "rgba(32,32,38,1)");
    if (reduce) draw();
  };

  const pos = (p: Packet, t: number) => {
    if (p.phase === 0) {
      const y0 = ys[p.l];
      const ny = nyL(p.l);
      tmp.x = bz(0, neckX * 0.5, neckX * 0.58, neckX, t);
      tmp.y = bz(y0, y0, ny, ny, t);
    } else {
      const ny = nyR(p.r);
      const ey = eyR(p.r);
      const dx = endX - neckX;
      tmp.x = bz(neckX, neckX + dx * 0.4, neckX + dx * 0.62, endX, t);
      tmp.y = bz(ny, ny, ey, ey, t);
    }
  };

  const spawn = (p: Packet, hot: boolean, line?: number) => {
    p.l = line ?? Math.floor(Math.random() * LEFT);
    p.g = Math.floor(Math.random() * PROVIDERS.length);
    p.r = p.g * STRANDS + Math.floor(Math.random() * STRANDS);
    p.t = 0;
    p.phase = 0;
    p.wait = 0;
    p.hot = hot;
  };

  const flash = (g: number) => {
    const c = chips[g];
    if (!c) return;
    c.classList.remove("is-hit");
    void c.offsetWidth;
    c.classList.add("is-hit");
  };

  const announce = (g: number) => {
    tag.textContent = `ROUTED → ${PROVIDERS[g].name.toUpperCase()}`;
    tag.dataset.hot = "1";
    window.clearTimeout(tagTimer);
    tagTimer = window.setTimeout(() => {
      tag.textContent = "GATEWAY";
      delete tag.dataset.hot;
    }, 1800);
  };

  const update = (dt: number) => {
    if (intro < 1) intro = Math.min(1, intro + dt / 2.2);
    neckY += (targetY - neckY) * (1 - Math.exp(-dt * 5));
    hover += (hoverTarget - hover) * (1 - Math.exp(-dt * 6));
    kick = Math.max(0, kick - dt * 2.6);
    if (intro < 0.85) return;

    for (const p of pool) {
      if (p.wait > 0) {
        p.wait -= dt;
        if (p.wait <= 0) spawn(p, false);
        continue;
      }
      p.t += dt / (p.phase === 0 ? (p.hot ? 1.1 : 1.5) : p.hot ? 0.8 : 1.1);
      if (p.t < 1) continue;
      if (p.phase === 0) {
        p.phase = 1;
        p.t = 0;
        kick = 1;
      } else {
        flash(p.g);
        if (p.hot) announce(p.g);
        p.hot = false;
        p.wait = 0.3 + Math.random() * 1.5;
      }
    }
  };

  function draw() {
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, w, h);
    const c = ctx!;

    // ruler through the gateway
    c.fillStyle = gradRuler;
    c.fillRect(neckX - 0.5, 0, 1, h);

    const revL = easeOut(clamp01(intro / 0.55));
    const revR = easeOut(clamp01((intro - 0.4) / 0.6));

    // application lines
    c.save();
    c.beginPath();
    c.rect(0, 0, neckX * revL + 1, h);
    c.clip();
    c.lineWidth = 1;
    c.strokeStyle = gradL;
    c.beginPath();
    for (let i = 0; i < LEFT; i++) {
      if (i === ACC_L) continue;
      const y = ys[i];
      const ny = nyL(i);
      c.moveTo(0, y);
      c.bezierCurveTo(neckX * 0.5, y, neckX * 0.58, ny, neckX, ny);
    }
    c.stroke();
    // the faint cyan route
    c.strokeStyle = "rgba(103,232,249,0.4)";
    c.beginPath();
    c.moveTo(0, ys[ACC_L]);
    c.bezierCurveTo(
      neckX * 0.5,
      ys[ACC_L],
      neckX * 0.58,
      nyL(ACC_L),
      neckX,
      nyL(ACC_L),
    );
    c.stroke();
    c.restore();

    // provider strands
    const dx = endX - neckX;
    c.save();
    c.beginPath();
    c.rect(neckX - 1, 0, dx * revR + 2, h);
    c.clip();
    c.strokeStyle = gradR;
    c.beginPath();
    for (let j = 0; j < RIGHT; j++) {
      if (j === ACC_R) continue;
      const ny = nyR(j);
      const ey = eyR(j);
      c.moveTo(neckX, ny);
      c.bezierCurveTo(neckX + dx * 0.4, ny, neckX + dx * 0.62, ey, endX, ey);
    }
    c.stroke();
    c.strokeStyle = "rgba(103,232,249,0.4)";
    c.beginPath();
    c.moveTo(neckX, nyR(ACC_R));
    c.bezierCurveTo(
      neckX + dx * 0.4,
      nyR(ACC_R),
      neckX + dx * 0.62,
      eyR(ACC_R),
      endX,
      eyR(ACC_R),
    );
    c.stroke();
    c.restore();

    // requests in flight
    c.lineCap = "round";
    for (const p of pool) {
      if (p.wait > 0) continue;
      pos(p, p.t);
      const hx = tmp.x;
      const hy = tmp.y;
      let alpha = p.phase === 0 ? clamp01(hx / (neckX * 0.3)) : 1;
      if (p.phase === 1 && p.t > 0.92) alpha *= (1 - p.t) / 0.08;
      const tail = 8;
      const step = p.hot ? 0.026 : 0.019;
      let ax = hx;
      let ay = hy;
      for (let k = 1; k <= tail; k++) {
        pos(p, Math.max(0, p.t - k * step));
        c.strokeStyle = `rgba(165,243,252,${(alpha * (1 - k / tail) * 0.9).toFixed(3)})`;
        c.lineWidth = (p.hot ? 2.6 : 1.7) * (1 - k / (tail * 1.4));
        c.beginPath();
        c.moveTo(ax, ay);
        c.lineTo(tmp.x, tmp.y);
        c.stroke();
        ax = tmp.x;
        ay = tmp.y;
      }
      c.fillStyle = `rgba(224,252,255,${alpha.toFixed(3)})`;
      c.beginPath();
      c.arc(hx, hy, p.hot ? 3.2 : 2.2, 0, Math.PI * 2);
      c.fill();
    }

    // the gateway: one heavy beam, one orchid port
    const bs = easeOut(clamp01((intro - 0.35) / 0.4));
    const bw = 140 * bs;
    const bh = 6 + kick * 3 + hover * 1.5;
    c.fillStyle = "#dce5e9";
    c.fillRect(neckX - bw / 2, neckY - bh / 2, bw, bh);
    if (kick > 0.02) {
      c.fillStyle = `rgba(103,232,249,${(kick * 0.55).toFixed(3)})`;
      c.fillRect(neckX - bw / 2, neckY - bh / 2, bw, bh);
    }
    c.fillStyle = `rgba(232,121,249,${bs.toFixed(3)})`;
    c.fillRect(neckX - 1, neckY - 13, 2, 26);
  }

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    draw();
  };

  const start = () => {
    if (raf || reduce) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const onMove = (e: PointerEvent) => {
    if (reduce) return;
    const r = wrap.getBoundingClientRect();
    const lim = h * 0.14;
    targetY =
      baseY + Math.max(-lim, Math.min(lim, (e.clientY - r.top - baseY) * 0.3));
    hoverTarget = 1;
  };
  const onLeave = () => {
    targetY = baseY;
    hoverTarget = 0;
  };
  const onDown = (e: PointerEvent) => {
    if (reduce) return;
    if ((e.target as Element).closest("a, button, nav")) return;
    const r = wrap.getBoundingClientRect();
    const py = e.clientY - r.top;
    if (py < 0 || py > h) return;
    const idx = Math.round(clamp01((py - 14) / (h - 28)) * (LEFT - 1));
    const free = pool.find((p) => p.wait > 0) ?? pool[0];
    spawn(free, true, idx);
    hint?.classList.add("is-gone");
  };

  const ro = new ResizeObserver(resize);
  ro.observe(wrap);
  resize();

  const io = new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? start() : stop()),
    { threshold: 0.02 },
  );
  io.observe(hero);

  hero.addEventListener("pointermove", onMove, { passive: true });
  hero.addEventListener("pointerleave", onLeave);
  hero.addEventListener("pointerdown", onDown);

  return () => {
    stop();
    window.clearTimeout(tagTimer);
    ro.disconnect();
    io.disconnect();
    hero.removeEventListener("pointermove", onMove);
    hero.removeEventListener("pointerleave", onLeave);
    hero.removeEventListener("pointerdown", onDown);
  };
}

/* ------------------------------ motion ---------------------------- */
const ease = [0.16, 1, 0.3, 1] as const;

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
};

const lineUp: Variants = {
  hidden: { y: "108%" },
  visible: { y: 0, transition: { duration: 0.95, ease } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

const hoverSpring = { type: "spring" as const, stiffness: 400, damping: 20 };

export default function HeroSection() {
  const navigate = useNavigate();
  const reduceMotion = Boolean(useReducedMotion());
  const heroRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const hero = heroRef.current;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const tag = tagRef.current;
    if (!hero || !wrap || !canvas || !tag) return;
    return createEngine(
      hero,
      wrap,
      canvas,
      chipRefs.current.filter((c): c is HTMLDivElement => Boolean(c)),
      tag,
      hintRef.current,
      reduceMotion,
    );
  }, [reduceMotion]);

  return (
    <section className="setu-hero" ref={heroRef}>
      <motion.div
        className="setu-top"
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        variants={stagger}
      >
        <div className="setu-headline">
          <motion.p className="setu-eyebrow" variants={fadeUp}>
            SETU / LLM GATEWAY
          </motion.p>
          <h1 className="setu-title">
            <span className="setu-line">
              <motion.span variants={lineUp}>One gateway.</motion.span>
            </span>
            <span className="setu-line">
              <motion.span variants={lineUp}>Every model.</motion.span>
            </span>
            <span className="setu-line">
              <motion.span variants={lineUp}>Total control.</motion.span>
            </span>
          </h1>
        </div>

        <motion.div className="setu-aside" variants={fadeUp}>
          <p>
            Route requests, monitor usage, and control LLM spending through one
            unified gateway.
          </p>
          <div className="setu-actions">
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={hoverSpring}
            >
              <button
                type="button"
                className="setu-primary cursor-pointer"
                onClick={() =>
                  navigate(
                    localStorage.getItem("token") ? "/dashboard" : "/login",
                  )
                }
              >
                <span>Get Started</span>
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3.333 8h9.334M8 3.333L12.667 8 8 12.667"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </motion.div>
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={hoverSpring}
            >
              <a
                href="https://github.com/JejurkarYash/setu"
                target="_blank"
                rel="noreferrer"
                className="setu-secondary"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.48.99.11-.77.42-1.3.76-1.6-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.47 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .5Z"
                  />
                </svg>
                <span>GitHub</span>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      <div className="setu-graphic" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className="setu-canvas"
          role="img"
          aria-label="Many application request lines are drawn into a single gateway, then routed out to OpenAI, Anthropic and Google Gemini"
        />

        {PROVIDERS.map((p, i) => (
          <div
            key={p.name}
            className="setu-chip"
            ref={(el) => {
              chipRefs.current[i] = el;
            }}
            style={{ top: `${PROV_Y[i] * 100}%` }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {p.name === "Google Gemini" && (
                <defs>
                  <linearGradient id="setu-gem" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0" stopColor="#4796e3" />
                    <stop offset="0.55" stopColor="#9177c7" />
                    <stop offset="1" stopColor="#ca6673" />
                  </linearGradient>
                </defs>
              )}
              <path d={p.path} fill={p.fill} />
            </svg>
            <span>{p.name}</span>
          </div>
        ))}

        <span className="setu-tag setu-tag-in" aria-hidden="true">
          APPLICATIONS
        </span>
        <span className="setu-tag setu-tag-out" aria-hidden="true">
          PROVIDERS
        </span>
        <span className="setu-tag setu-hint" ref={hintRef} aria-hidden="true">
          CLICK TO SEND A REQUEST
        </span>
        <span
          className="setu-tag setu-tag-gate"
          ref={tagRef}
          aria-hidden="true"
        >
          GATEWAY
        </span>
      </div>

      <style>{`
        .setu-hero {
          position: relative;
          isolation: isolate;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: clamp(640px, calc(100svh - ${NAV}px), 840px);
          margin: 0 clamp(20px, 2.5vw, 32px) 0 clamp(20px, 6.5vw, 88px);
          overflow: hidden;
          border-left: 1px solid #19191d;
          border-bottom: 1px solid #19191d;
          background: #050505;
          font-family: "Geist", sans-serif;
        }

        .setu-top {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(260px, 340px);
          align-items: end;
          gap: clamp(24px, 4vw, 80px);
          padding: clamp(44px, 8vh, 96px) clamp(20px, 3.4vw, 48px) 0;
        }

        .setu-eyebrow {
          margin: 0 0 24px;
          color: #8f8f97;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.16em;
        }

        .setu-title {
          margin: 0;
          color: #f7f7f7;
          font-size: clamp(46px, 6.6vw, 104px);
          font-weight: 600;
          letter-spacing: -0.07em;
          line-height: 0.95;
        }

        .setu-line { display: block; overflow: hidden; padding-bottom: 0.08em; }
        .setu-line > span { display: block; }

        .setu-aside { padding-bottom: 0.8vw; }

        .setu-aside p {
          max-width: 310px;
          margin: 0;
          color: #969ba3;
          font-size: 15px;
          line-height: 1.6;
        }

        .setu-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 28px;
        }

        .setu-primary,
        .setu-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          height: 48px;
          font-family: "Geist", sans-serif;
          font-size: 14.5px;
          font-weight: 600;
          text-decoration: none;
          transition: background 220ms ease, border-color 220ms ease, color 220ms ease;
        }

        .setu-primary { min-width: 148px; padding: 0 22px; background: #fff; color: #08070b; }
        .setu-primary:hover { background: #f0abfc; }
        .setu-primary svg { width: 15px; height: 15px; transition: transform 200ms ease; }
        .setu-primary:hover svg { transform: translateX(4px); }

        .setu-secondary {
          min-width: 118px;
          padding: 0 20px;
          border: 1px solid #27272d;
          background: #0d0d11;
          color: #e4e4e7;
        }

        .setu-secondary:hover { border-color: #3a4247; background: #111318; color: #fff; }
        .setu-secondary svg { width: 17px; height: 17px; flex: 0 0 auto; }

        .setu-primary:focus-visible,
        .setu-secondary:focus-visible { outline: 2px solid #f0abfc; outline-offset: 4px; }

        /* ---- the span ---- */
        .setu-graphic {
          position: relative;
          flex: 1;
          min-height: 340px;
          margin-top: clamp(24px, 5vh, 56px);
          border-top: 1px solid #19191d;
        }

        .setu-canvas { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }

        .setu-chip {
          position: absolute;
          right: clamp(16px, 2.4vw, 32px);
          display: flex;
          align-items: center;
          gap: 12px;
          width: 176px;
          height: 44px;
          padding: 0 14px;
          border: 1px solid #27272d;
          background: #0d0d11;
          color: #e4e4e7;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          white-space: nowrap;
          transform: translateY(-50%);
          animation: setu-fade 800ms ease 1.9s both;
        }

        .setu-chip::before {
          content: "";
          position: absolute;
          top: 50%;
          left: -14px;
          width: 14px;
          height: 1px;
          background: #3a4247;
        }

        .setu-chip svg { flex: 0 0 auto; width: 16px; height: 16px; }
        .setu-chip.is-hit { animation: setu-hit 1100ms cubic-bezier(0.16, 1, 0.3, 1); }

        .setu-tag {
          position: absolute;
          color: #565d66;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
          white-space: nowrap;
          pointer-events: none;
          animation: setu-fade 800ms ease 1.2s both;
        }

        .setu-tag-in { top: 14px; left: clamp(20px, 3.4vw, 48px); }
        .setu-tag-out { top: 14px; right: clamp(16px, 2.4vw, 32px); }

        .setu-hint {
          top: 14px;
          left: 46%;
          transform: translateX(-50%);
          color: #686873;
          transition: opacity 400ms ease;
        }

        .setu-hint.is-gone { opacity: 0; }

        .setu-tag-gate {
          bottom: 14px;
          left: 46%;
          transform: translateX(-50%);
          color: #686873;
          transition: color 300ms ease;
        }

        .setu-tag-gate[data-hot] { color: #67e8f9; }

        @keyframes setu-fade { from { opacity: 0; } to { opacity: 1; } }

        @keyframes setu-hit {
          0% { border-color: #67e8f9; background: #0f1a1d; color: #fff; }
          100% { border-color: #27272d; background: #0d0d11; color: #e4e4e7; }
        }

        @media (max-width: 860px) {
          .setu-hero { min-height: auto; }
          .setu-top { grid-template-columns: 1fr; align-items: start; gap: 28px; padding-top: 52px; }
          .setu-title { font-size: clamp(44px, 13vw, 80px); }
          .setu-aside { padding-bottom: 0; }
          .setu-graphic { flex: none; height: 360px; margin-top: 44px; }
        }

        @media (max-width: 700px) {
          .setu-hero { margin-left: 0; margin-right: 0; border-left: 0; }
          .setu-top { padding-left: 20px; padding-right: 20px; }
          .setu-actions { flex-direction: column; align-items: stretch; }
          .setu-actions > div,
          .setu-actions a { width: 100%; }
          .setu-chip { width: 46px; padding: 0; justify-content: center; right: 12px; }
          .setu-chip span { display: none; }
          .setu-tag-in { left: 20px; }
          .setu-tag-out { right: 12px; }
          .setu-hint,
          .setu-tag-gate { left: 50%; }
          .setu-hint { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .setu-chip,
          .setu-tag { animation: none; }
          .setu-chip.is-hit { animation: none; }
          .setu-hint { display: none; }
        }
      `}</style>
    </section>
  );
}
