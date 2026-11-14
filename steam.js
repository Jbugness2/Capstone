/* Procedural steampunk art: meshing, spinning gears, a live clock, a globe,
   pistons and a rising bar chart. Everything is drawn as inline SVG so there
   are no image files to host. */
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const TAU = Math.PI * 2;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const el = (name, attrs, parent) => {
    const e = document.createElementNS(NS, name);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };

  /* ---------- shared gradients & filters (one hidden svg) ---------- */
  function buildDefs() {
    if (document.getElementById("steam-defs")) return;
    const svg = el("svg", { id: "steam-defs", width: 0, height: 0, "aria-hidden": "true" });
    svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    const d = el("defs", {}, svg);
    const lin = (id, stops, x2 = "1", y2 = "1") => {
      const g = el("linearGradient", { id, x1: "0", y1: "0", x2, y2 }, d);
      stops.forEach(([o, c]) => el("stop", { offset: o, "stop-color": c }, g));
    };
    lin("m-bronze", [[0, "#f0cf86"], [0.35, "#b9822f"], [0.7, "#7a4f19"], [1, "#3d260c"]]);
    lin("m-gold", [[0, "#fff0b0"], [0.4, "#d4ae3d"], [0.75, "#8a6a1c"], [1, "#4a3810"]]);
    lin("m-steel", [[0, "#9a9ca3"], [0.4, "#5d5f66"], [0.8, "#2e2f35"], [1, "#1a1a1f"]]);
    lin("m-rod", [[0, "#6d5217"], [0.5, "#f3d98a"], [1, "#6d5217"]], "1", "0");
    const rg = el("radialGradient", { id: "m-globe", cx: "0.35", cy: "0.3", r: "0.9" }, d);
    [[0, "#7a5a22"], [0.6, "#2c1f0b"], [1, "#120d05"]].forEach(([o, c]) =>
      el("stop", { offset: o, "stop-color": c }, rg));
    const beam = el("linearGradient", { id: "m-beam", x1: "0", y1: "0", x2: "1", y2: "0" }, d);
    [[0, "rgba(255,214,120,0)"], [0.5, "rgba(255,226,150,.95)"], [1, "rgba(255,214,120,0)"]].forEach(([o, c]) =>
      el("stop", { offset: o, "stop-color": c }, beam));
    const f = el("filter", { id: "glow", x: "-50%", y: "-50%", width: "200%", height: "200%" }, d);
    el("feGaussianBlur", { stdDeviation: "6" }, f);
    document.body.appendChild(svg);
  }

  /* ---------- gears ---------- */
  function gearPath(n, ro, rr) {
    const st = TAU / n;
    let d = "";
    for (let i = 0; i < n; i++) {
      const a = i * st;
      [[a, rr], [a + 0.1 * st, ro], [a + 0.4 * st, ro], [a + 0.5 * st, rr]].forEach(([ang, r], j) => {
        d += (i === 0 && j === 0 ? "M" : "L") + (r * Math.cos(ang)).toFixed(1) + " " + (r * Math.sin(ang)).toFixed(1) + " ";
      });
      const na = a + st;
      d += `A ${rr} ${rr} 0 0 1 ${(rr * Math.cos(na)).toFixed(1)} ${(rr * Math.sin(na)).toFixed(1)} `;
    }
    return d + "Z";
  }

  function gear(parent, o) {
    const { x, y, n, m = 8, rot = 0, mat = "steel", dir = 1, spokes = 6, k = 1.6 } = o;
    const r = (n * m) / 2, ro = r + m * 0.6, rr = r - m * 0.75, hole = rr * 0.8;
    const g = el("g", { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` }, parent);
    const spin = el("g", { transform: `rotate(${rot})` }, g);
    const d = gearPath(n, ro, rr) +
      ` M ${hole} 0 A ${hole} ${hole} 0 1 0 ${-hole} 0 A ${hole} ${hole} 0 1 0 ${hole} 0 Z`;
    el("path", { d, "fill-rule": "evenodd", fill: `url(#m-${mat})`, stroke: "#0a0908", "stroke-width": 1.2 }, spin);
    el("circle", { r: hole, fill: "none", stroke: "rgba(255,232,170,.28)", "stroke-width": 2 }, spin);
    el("circle", { r: rr * 0.9, fill: "none", stroke: "rgba(0,0,0,.4)", "stroke-width": 1 }, spin);
    const w = rr * 0.15;
    for (let i = 0; i < spokes; i++) {
      el("rect", {
        x: 0, y: -w / 2, width: hole, height: w, fill: `url(#m-${mat})`,
        stroke: "#0a0908", "stroke-width": 0.8, transform: `rotate(${(i * 360) / spokes})`
      }, spin);
    }
    el("circle", { r: rr * 0.27, fill: `url(#m-${mat})`, stroke: "#0a0908", "stroke-width": 1.2 }, spin);
    el("circle", { r: rr * 0.1, fill: "#0a0908" }, spin);
    for (let i = 0; i < 8; i++) {
      const a = (i * TAU) / 8;
      el("circle", { cx: (rr * 0.9 * Math.cos(a)).toFixed(1), cy: (rr * 0.9 * Math.sin(a)).toFixed(1), r: Math.max(1.4, m * 0.18), fill: "rgba(255,236,176,.65)" }, spin);
    }
    if (!reduce) {
      el("animateTransform", {
        attributeName: "transform", type: "rotate",
        from: `${rot}`, to: `${rot + 360 * dir}`, dur: `${(k * n).toFixed(1)}s`, repeatCount: "indefinite"
      }, spin);
    }
    return { x, y, n, m, r, rot, dir, k };
  }

  /* Place a gear so its teeth interlock with parent p, in the direction `ang` (degrees). */
  function mesh(parent, p, { n, ang, mat, spokes }) {
    const th = (ang * Math.PI) / 180, r2 = (n * p.m) / 2, dist = p.r + r2;
    const stA = TAU / p.n, stB = TAU / n, rotA = (p.rot * Math.PI) / 180;
    const f = ((((th - rotA - 0.25 * stA) % stA) + stA) % stA) / stA;
    const rotB = th + Math.PI - 0.75 * stB + f * stB;
    return gear(parent, {
      x: p.x + dist * Math.cos(th), y: p.y + dist * Math.sin(th), n, m: p.m,
      rot: (rotB * 180) / Math.PI, mat, dir: -p.dir, spokes: spokes || 6, k: p.k
    });
  }

  /* ---------- clock (shows the real time) ---------- */
  function clock(parent, cx, cy, R) {
    const g = el("g", { transform: `translate(${cx} ${cy})` }, parent);
    el("circle", { r: R, fill: "url(#m-bronze)", stroke: "#0a0908", "stroke-width": 2 }, g);
    el("circle", { r: R * 0.9, fill: "#0e0d12", stroke: "#5a3f12", "stroke-width": 4 }, g);
    const inner = el("g", { opacity: 0.28 }, g);
    gear(inner, { x: 0, y: 0, n: 24, m: R * 0.036, mat: "gold", spokes: 8, k: 2.4 });
    for (let i = 0; i < 60; i++) {
      const a = (i * 6 * Math.PI) / 180, big = i % 5 === 0;
      el("line", {
        x1: (R * 0.82 * Math.sin(a)).toFixed(1), y1: (-R * 0.82 * Math.cos(a)).toFixed(1),
        x2: (R * (big ? 0.72 : 0.77) * Math.sin(a)).toFixed(1), y2: (-R * (big ? 0.72 : 0.77) * Math.cos(a)).toFixed(1),
        stroke: "#c9a431", "stroke-width": big ? 3 : 1.2
      }, g);
    }
    ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"].forEach((t, i) => {
      const tg = el("g", { transform: `rotate(${i * 30}) translate(0 ${-R * 0.56})` }, g);
      const tx = el("text", {
        "text-anchor": "middle", "dominant-baseline": "middle", fill: "#d9b64a",
        "font-family": "Merriweather, Georgia, serif", "font-weight": 700, "font-size": R * 0.14
      }, tg);
      tx.textContent = t;
    });
    const hand = (len, w, color) => el("line", { x1: 0, y1: R * 0.1, x2: 0, y2: -R * len, stroke: color, "stroke-width": w, "stroke-linecap": "round" }, g);
    const hh = hand(0.4, 8, "#e6c565"), mh = hand(0.62, 5, "#f3dc92"), sh = hand(0.7, 2, "#d9743a");
    el("circle", { r: 8, fill: "#c9a431", stroke: "#0a0908" }, g);
    const tick = () => {
      const t = new Date(), s = t.getSeconds(), mi = t.getMinutes() + s / 60, h = (t.getHours() % 12) + mi / 60;
      hh.setAttribute("transform", `rotate(${h * 30})`);
      mh.setAttribute("transform", `rotate(${mi * 6})`);
      sh.setAttribute("transform", `rotate(${s * 6})`);
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- globe ---------- */
  function globe(parent, cx, cy, R) {
    const g = el("g", { transform: `translate(${cx} ${cy})` }, parent);
    el("rect", { x: -5, y: R, width: 10, height: R * 0.35, fill: "url(#m-bronze)" }, g);
    el("ellipse", { cx: 0, cy: R * 1.38, rx: R * 0.55, ry: R * 0.13, fill: "url(#m-bronze)", stroke: "#0a0908" }, g);
    el("circle", { r: R, fill: "url(#m-globe)", stroke: "#0a0908", "stroke-width": 2 }, g);
    [-60, -30, 0, 30, 60].forEach((lat) => {
      const a = (lat * Math.PI) / 180;
      el("ellipse", { cx: 0, cy: (R * Math.sin(a)).toFixed(1), rx: (R * Math.cos(a)).toFixed(1), ry: (R * Math.cos(a) * 0.16).toFixed(1), fill: "none", stroke: "rgba(224,184,80,.45)" }, g);
    });
    for (let i = 0; i < 6; i++) {
      el("ellipse", { cx: 0, cy: 0, rx: (R * Math.abs(Math.cos((i * Math.PI) / 6))).toFixed(1), ry: R, fill: "none", stroke: "rgba(224,184,80,.35)" }, g);
    }
    el("circle", { r: R + 12, fill: "none", stroke: "url(#m-bronze)", "stroke-width": 9, transform: "rotate(-23)" }, g);
    el("circle", { r: R + 12, fill: "none", stroke: "#0a0908", "stroke-width": 1, transform: "rotate(-23)" }, g);
  }

  /* ---------- pistons ---------- */
  function piston(parent, x, baseY, dur, travel) {
    el("rect", { x: x - 20, y: baseY - 170, width: 40, height: 130, fill: "url(#m-steel)", stroke: "#0a0908" }, parent);
    el("rect", { x: x - 24, y: baseY - 176, width: 48, height: 14, fill: "url(#m-gold)", stroke: "#0a0908" }, parent);
    const rod = el("g", {}, parent);
    el("rect", { x: x - 6, y: baseY - 250, width: 12, height: 90, fill: "url(#m-rod)", stroke: "#0a0908" }, rod);
    el("rect", { x: x - 18, y: baseY - 258, width: 36, height: 14, rx: 3, fill: "url(#m-gold)", stroke: "#0a0908" }, rod);
    if (!reduce) {
      el("animateTransform", {
        attributeName: "transform", type: "translate", values: `0 0; 0 ${-travel}; 0 0`,
        dur: `${dur}s`, repeatCount: "indefinite", calcMode: "spline", keySplines: ".45 0 .55 1; .45 0 .55 1"
      }, rod);
    }
  }

  /* ---------- scenes (drawn at the LEFT edge of a 620x420 box;
     the right-hand art is the same kind of drawing, mirrored by CSS) ---------- */
  const scenes = {
    home: {
      L(s) {
        const a = gear(s, { x: 40, y: 360, n: 30, m: 9, mat: "steel", spokes: 7, k: 1.5 });
        const b = mesh(s, a, { n: 18, ang: -38, mat: "bronze" });
        mesh(s, b, { n: 12, ang: -110, mat: "steel" });
        mesh(s, b, { n: 22, ang: 62, mat: "gold", spokes: 8 });
      },
      R(s) {
        const a = gear(s, { x: 20, y: 90, n: 28, m: 9, mat: "bronze", spokes: 7, k: 1.5 });
        const b = mesh(s, a, { n: 16, ang: 70, mat: "steel" });
        mesh(s, a, { n: 20, ang: 8, mat: "steel", spokes: 8 });
        mesh(s, b, { n: 12, ang: 150, mat: "gold" });
      }
    },
    about: {
      L(s) {
        const a = gear(s, { x: 30, y: 330, n: 32, m: 9, mat: "bronze", spokes: 8, k: 1.5 });
        const b = mesh(s, a, { n: 18, ang: -35, mat: "steel" });
        mesh(s, b, { n: 12, ang: -105, mat: "gold" });
        mesh(s, a, { n: 20, ang: 18, mat: "steel" });
      },
      R(s) {
        const g = el("g", { transform: "translate(40 400) rotate(-36)" }, s);
        el("rect", { x: -320, y: -10, width: 760, height: 20, fill: "url(#m-beam)", filter: "url(#glow)" }, g);
        el("rect", { x: -320, y: -3, width: 760, height: 6, fill: "url(#m-beam)" }, g);
        const e = gear(s, { x: 30, y: 60, n: 26, m: 8, mat: "bronze", spokes: 6 });
        const f = mesh(s, e, { n: 14, ang: 70, mat: "steel" });
        mesh(s, e, { n: 20, ang: 14, mat: "gold" });
        mesh(s, f, { n: 10, ang: 125, mat: "steel" });
      }
    },
    employability: {
      L(s) {
        globe(s, 125, 125, 92);
        const a = gear(s, { x: 150, y: 372, n: 24, m: 8, mat: "bronze", spokes: 7 });
        mesh(s, a, { n: 14, ang: -150, mat: "steel" });
        mesh(s, a, { n: 16, ang: -20, mat: "gold" });
      },
      R(s) {
        const base = 362, hs = [250, 215, 185, 150, 120, 92, 64];
        const pts = [];
        hs.forEach((h, i) => {
          const x = 24 + i * 50;
          el("rect", { x, y: base - h, width: 38, height: h, fill: "url(#m-bronze)", stroke: "#0a0908", opacity: 0.92 }, s);
          el("rect", { x: x + 4, y: base - h + 4, width: 5, height: h - 8, fill: "rgba(255,236,176,.25)" }, s);
          pts.push([x + 19, base - h - 16]);
        });
        for (let i = 1; i < 6; i++) el("line", { x1: 0, x2: 400, y1: base - i * 55, y2: base - i * 55, stroke: "rgba(224,184,80,.14)" }, s);
        el("polyline", { points: pts.map((p) => p.join(",")).join(" "), fill: "none", stroke: "#d9b64a", "stroke-width": 3 }, s);
        pts.forEach(([x, y]) => el("circle", { cx: x, cy: y, r: 7, fill: "#15131a", stroke: "#f0d27a", "stroke-width": 3 }, s));
        const a = gear(s, { x: 30, y: 30, n: 14, m: 7, mat: "steel" });
        mesh(s, a, { n: 10, ang: 55, mat: "bronze" });
      }
    },
    projects: {
      L(s) {
        const a = gear(s, { x: 50, y: 230, n: 34, m: 8, mat: "bronze", spokes: 8, k: 1.4 });
        mesh(s, a, { n: 16, ang: 28, mat: "steel" });
        const c = mesh(s, a, { n: 20, ang: -42, mat: "gold", spokes: 8 });
        mesh(s, c, { n: 12, ang: 10, mat: "steel" });
      },
      R(s) {
        piston(s, 120, 372, 2.2, 36);
        piston(s, 190, 372, 2.9, 28);
        piston(s, 260, 372, 2.5, 40);
        const e = gear(s, { x: 20, y: 40, n: 18, m: 8, mat: "steel", spokes: 6 });
        mesh(s, e, { n: 12, ang: 50, mat: "bronze" });
      }
    },
    future: {
      L(s) {
        clock(s, 170, 205, 118);
        const a = gear(s, { x: 70, y: 392, n: 20, m: 8, mat: "bronze", spokes: 7 });
        const b = mesh(s, a, { n: 14, ang: -8, mat: "steel" });
        mesh(s, b, { n: 10, ang: -50, mat: "gold" });
      },
      R(s) {
        const a = gear(s, { x: 40, y: 120, n: 28, m: 9, mat: "bronze", spokes: 8, k: 1.5 });
        mesh(s, a, { n: 16, ang: 75, mat: "steel" });
        const c = mesh(s, a, { n: 12, ang: 20, mat: "gold" });
        mesh(s, c, { n: 18, ang: -50, mat: "steel" });
      }
    }
  };

  /* ---------- mount ---------- */
  buildDefs();
  document.querySelectorAll("[data-scene]").forEach((banner) => {
    const sc = scenes[banner.dataset.scene];
    if (!sc) return;
    ["L", "R"].forEach((side) => {
      const svg = el("svg", { class: `art art-${side.toLowerCase()}`, viewBox: "0 0 620 420", "aria-hidden": "true", focusable: "false" });
      sc[side](svg);
      banner.insertBefore(svg, banner.firstChild);
    });
  });

  /* Emblem in the header */
  document.querySelectorAll(".emblem").forEach((box) => {
    const svg = el("svg", { viewBox: "-22 -22 44 44", width: 38, height: 38, "aria-hidden": "true" }, box);
    gear(svg, { x: 0, y: 0, n: 14, m: 2.6, mat: "bronze", spokes: 5, k: 3 });
    const t = el("text", {
      "text-anchor": "middle", "dominant-baseline": "central", fill: "#fff0b0",
      "font-family": "Pinyon Script, cursive", "font-size": 17, y: 1
    }, svg);
    t.textContent = "D";
  });
})();
