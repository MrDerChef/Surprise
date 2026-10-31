/* Canvas effects. No dependencies.
   - ambient: drifting fireflies + a few leaves (always on, very light)
   - fx: confetti, sparkles, hearts, fireworks (loop runs only while particles exist) */
(function () {
  "use strict";
  var B = (window.BDAY = window.BDAY || {});
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  B.reduce = reduce;

  var COLORS = ["#e8c987", "#f6e2b3", "#e6f3e9", "#9fc3a8", "#f0c96a", "#c9a35a", "#ffffff"];
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var pick = function (arr) { return arr[(Math.random() * arr.length) | 0]; };

  var W = 0, H = 0, dpr = 1;
  var amb, ambCtx, fxc, fxCtx;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    [amb, fxc].forEach(function (c) {
      if (!c) return;
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      c.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
    });
  }

  /* ---------------- ambient ---------------- */
  var flies = [], leaves = [], glow, ambRunning = false, last = 0;

  function makeGlow() {
    glow = document.createElement("canvas");
    glow.width = glow.height = 64;
    var g = glow.getContext("2d");
    var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,236,170,.55)");
    gr.addColorStop(0.35, "rgba(232,201,135,.2)");
    gr.addColorStop(1, "rgba(232,201,135,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    g.fillStyle = "#fff1c2"; g.beginPath();
    for (var i = 0; i < 10; i++) {
      var r = i % 2 ? 7 : 16, an = -Math.PI / 2 + i * Math.PI / 5;
      g[i ? "lineTo" : "moveTo"](32 + Math.cos(an) * r, 33 + Math.sin(an) * r);
    }
    g.closePath(); g.fill();
  }

  function seedAmbient() {
    var n = reduce ? 10 : 26;
    flies = [];
    for (var i = 0; i < n; i++) {
      flies.push({ x: rnd(0, W), y: rnd(0, H), s: rnd(4, 9), ph: rnd(0, 6.28), sp: rnd(0.4, 1.1),
                   vx: rnd(-0.12, 0.12), vy: rnd(-0.16, 0.05), wob: rnd(10, 30) });
    }
    leaves = [];
    if (!reduce) for (var j = 0; j < 7; j++) leaves.push(newLeaf(true));
  }
  function newLeaf(anywhere) {
    return { x: rnd(0, W), y: anywhere ? rnd(-20, H) : -20, len: rnd(7, 12), rot: rnd(0, 6.28), vr: rnd(-0.01, 0.01),
             vy: rnd(0.18, 0.42), sway: rnd(0.5, 1.4), ph: rnd(0, 6.28), a: rnd(0.14, 0.3) };
  }

  function ambFrame(t) {
    if (!ambRunning) return;
    requestAnimationFrame(ambFrame);
    var dt = Math.min((t - last) / 16.67, 3); last = t;
    ambCtx.clearRect(0, 0, W, H);
    var i, f, l;
    for (i = 0; i < flies.length; i++) {
      f = flies[i];
      f.ph += 0.018 * f.sp * dt;
      f.x += (f.vx + Math.sin(f.ph * 0.7) * 0.14) * dt;
      f.y += f.vy * dt;
      if (f.y < -20) { f.y = H + 20; f.x = rnd(0, W); }
      if (f.x < -20) f.x = W + 20; if (f.x > W + 20) f.x = -20;
      var a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(f.ph * 2.2));
      var sz = f.s * 4 * (0.8 + 0.2 * Math.sin(f.ph * 3.1));
      ambCtx.globalAlpha = a;
      ambCtx.drawImage(glow, f.x - sz / 2, f.y - sz / 2, sz, sz);
    }
    ambCtx.globalAlpha = 1;
    for (i = 0; i < leaves.length; i++) {
      l = leaves[i];
      l.ph += 0.012 * dt; l.rot += l.vr * dt;
      l.y += l.vy * dt; l.x += Math.sin(l.ph * l.sway) * 0.45 * dt;
      if (l.y > H + 24) leaves[i] = newLeaf(false);
      ambCtx.save();
      ambCtx.translate(l.x, l.y); ambCtx.rotate(l.rot + Math.sin(l.ph) * 0.5);
      ambCtx.fillStyle = "rgba(159,195,168," + l.a + ")";
      ambCtx.beginPath();
      ambCtx.moveTo(0, -l.len);
      ambCtx.quadraticCurveTo(l.len * 0.7, -l.len * 0.1, 0, l.len);
      ambCtx.quadraticCurveTo(-l.len * 0.7, -l.len * 0.1, 0, -l.len);
      ambCtx.fill();
      ambCtx.restore();
    }
  }

  function startAmbient() {
    if (ambRunning) return;
    ambRunning = true; last = performance.now();
    if (reduce) { ambRunning = true; ambFrame(last); ambRunning = false; return; }
    requestAnimationFrame(ambFrame);
  }
  document.addEventListener("visibilitychange", function () {
    if (reduce) return;
    if (document.hidden) { ambRunning = false; }
    else if (amb) { ambRunning = true; last = performance.now(); requestAnimationFrame(ambFrame); }
  });

  /* ---------------- particles ---------------- */
  var parts = [], rockets = [], fxRunning = false, fxLast = 0, fireworksUntil = 0, nextRocket = 0;

  function ensureLoop() {
    if (fxRunning) return;
    fxRunning = true; fxLast = performance.now();
    requestAnimationFrame(fxFrame);
  }

  function fxFrame(t) {
    var dt = Math.min((t - fxLast) / 16.67, 3); fxLast = t;
    fxCtx.clearRect(0, 0, W, H);

    if (fireworksUntil > t && t > nextRocket) {
      rockets.push({ x: rnd(W * 0.15, W * 0.85), y: H + 10, vy: -rnd(9, 12.5), ty: rnd(H * 0.14, H * 0.46), c: pick(COLORS) });
      nextRocket = t + rnd(380, 900);
    }

    var i, p;
    for (i = rockets.length - 1; i >= 0; i--) {
      p = rockets[i];
      p.y += p.vy * dt; p.vy += 0.07 * dt;
      fxCtx.globalAlpha = 1; fxCtx.fillStyle = "#fff6d8";
      fxCtx.beginPath(); fxCtx.arc(p.x, p.y, 2, 0, 6.283); fxCtx.fill();
      fxCtx.globalAlpha = 0.4; fxCtx.fillRect(p.x - 1, p.y, 2, 14);
      if (p.y <= p.ty || p.vy > -1.5) { explode(p.x, p.y, p.c); rockets.splice(i, 1); }
    }

    for (i = parts.length - 1; i >= 0; i--) {
      p = parts[i];
      p.life -= p.decay * dt;
      if (p.life <= 0 || p.y > H + 40) { parts.splice(i, 1); continue; }
      p.vx *= Math.pow(p.drag, dt); p.vy = p.vy * Math.pow(p.drag, dt) + p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      var a = Math.min(1, p.life * 1.6);
      fxCtx.globalAlpha = a; fxCtx.fillStyle = p.c; fxCtx.strokeStyle = p.c;
      if (p.k === "conf") {
        fxCtx.save(); fxCtx.translate(p.x, p.y); fxCtx.rotate(p.rot);
        fxCtx.scale(1, Math.cos(p.flip += 0.12 * dt));
        fxCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); fxCtx.restore();
      } else if (p.k === "spark") {
        fxCtx.lineWidth = p.w; fxCtx.lineCap = "round";
        fxCtx.beginPath(); fxCtx.moveTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2); fxCtx.lineTo(p.x, p.y); fxCtx.stroke();
      } else if (p.k === "dot") {
        fxCtx.beginPath(); fxCtx.arc(p.x, p.y, p.w * (0.5 + p.life * 0.5), 0, 6.283); fxCtx.fill();
      } else if (p.k === "star") {
        p.rot += p.vr * dt; star(p.x, p.y, p.w * (0.55 + p.life * 0.45), p.rot, p.c, a);
      }
    }
    fxCtx.globalAlpha = 1;

    if (parts.length || rockets.length || fireworksUntil > t) requestAnimationFrame(fxFrame);
    else { fxRunning = false; fxCtx.clearRect(0, 0, W, H); }
  }

  function star(x, y, r, rot, c, a) {
    fxCtx.save(); fxCtx.translate(x, y); fxCtx.rotate(rot);
    fxCtx.globalAlpha = a; fxCtx.fillStyle = c; fxCtx.beginPath();
    for (var i = 0; i < 10; i++) {
      var rr = i % 2 ? r * 0.45 : r, an = -Math.PI / 2 + i * Math.PI / 5;
      fxCtx[i ? "lineTo" : "moveTo"](Math.cos(an) * rr, Math.sin(an) * rr);
    }
    fxCtx.closePath(); fxCtx.fill(); fxCtx.restore();
  }

  function explode(x, y, c) {
    var n = reduce ? 18 : 64, ring = Math.random() < 0.4;
    for (var i = 0; i < n; i++) {
      var ang = (i / n) * 6.283 + rnd(-0.05, 0.05);
      var sp = ring ? 4.6 : rnd(1.5, 5.6);
      parts.push({ k: "spark", x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, g: 0.05, drag: 0.965,
                   w: rnd(1.4, 2.6), c: Math.random() < 0.25 ? "#ffffff" : c, life: 1, decay: rnd(0.011, 0.02) });
    }
  }

  /* ---------------- public API ---------------- */
  B.fx = {
    init: function () {
      amb = document.getElementById("ambient"); fxc = document.getElementById("fx");
      ambCtx = amb.getContext("2d"); fxCtx = fxc.getContext("2d");
      makeGlow(); size(); seedAmbient(); startAmbient();
      var rt; window.addEventListener("resize", function () {
        clearTimeout(rt); rt = setTimeout(function () { size(); seedAmbient(); if (reduce) { ambCtx.clearRect(0, 0, W, H); ambRunning = true; ambFrame(performance.now()); ambRunning = false; } }, 150);
      });
    },

    /* confetti burst from a point (viewport px). */
    confetti: function (x, y, opts) {
      opts = opts || {};
      var n = Math.round((opts.count || 90) * (reduce ? 0.35 : 1));
      var spread = opts.spread || 1.5, power = opts.power || 11, base = opts.angle != null ? opts.angle : -Math.PI / 2;
      for (var i = 0; i < n; i++) {
        var a = base + rnd(-spread / 2, spread / 2), s = rnd(power * 0.45, power);
        parts.push({ k: "conf", x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 0.22, drag: 0.985,
                     w: rnd(6, 11), h: rnd(4, 8), rot: rnd(0, 6.28), vr: rnd(-0.25, 0.25), flip: rnd(0, 6.28),
                     c: pick(COLORS), life: 1, decay: rnd(0.0045, 0.0075) });
      }
      ensureLoop();
    },

    /* confetti falling from the top of the screen */
    rain: function (count) {
      var n = Math.round((count || 110) * (reduce ? 0.3 : 1));
      for (var i = 0; i < n; i++) {
        parts.push({ k: "conf", x: rnd(0, W), y: rnd(-H * 0.5, -10), vx: rnd(-0.6, 0.6), vy: rnd(1.5, 3.4), g: 0.01, drag: 0.999,
                     w: rnd(6, 11), h: rnd(4, 8), rot: rnd(0, 6.28), vr: rnd(-0.12, 0.12), flip: rnd(0, 6.28),
                     c: pick(COLORS), life: 1, decay: 0.0022 });
      }
      ensureLoop();
    },

    /* small golden sparkle burst */
    sparkle: function (x, y, count) {
      var n = Math.round((count || 22) * (reduce ? 0.4 : 1));
      for (var i = 0; i < n; i++) {
        var a = rnd(0, 6.283), s = rnd(0.8, 4.2);
        parts.push({ k: "star", x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.6, g: 0.04, drag: 0.95,
                     w: rnd(3, 7), rot: rnd(0, 6.28), vr: rnd(-0.08, 0.08), c: pick(["#e6b84f", "#f0c96a", "#f6dc9a"]), life: 1, decay: rnd(0.012, 0.024) });
      }
      ensureLoop();
    },

    /* one bigger golden star plus a few small ones, for taps and clicks */
    star: function (x, y) {
      parts.push({ k: "star", x: x, y: y - 6, vx: 0, vy: -0.9, g: -0.02, drag: 0.96, w: 13, rot: 0, vr: 0.05, c: "#e6b84f", life: 1, decay: 0.03 });
      if (!reduce) for (var i = 0; i < 6; i++) {
        var a = (i / 6) * 6.283 + rnd(-0.3, 0.3), s = rnd(1.4, 3.2);
        parts.push({ k: "star", x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 0.03, drag: 0.93,
                     w: rnd(3.5, 6), rot: rnd(0, 6.28), vr: rnd(-0.1, 0.1), c: "#f0c96a", life: 1, decay: rnd(0.028, 0.045) });
      }
      ensureLoop();
    },

    /* golden stars floating up (kept under the old name "hearts" so callers still work) */
    hearts: function (x, y, count) {
      var n = Math.round((count || 14) * (reduce ? 0.4 : 1));
      for (var i = 0; i < n; i++) {
        parts.push({ k: "star", x: x + rnd(-30, 30), y: y + rnd(-10, 10), vx: rnd(-0.7, 0.7), vy: -rnd(1.4, 3.2), g: -0.012, drag: 0.992,
                     w: rnd(6, 13), rot: rnd(0, 6.28), vr: rnd(-0.04, 0.04), c: pick(["#e6b84f", "#f0c96a", "#f6dc9a", "#e6f3e9"]), life: 1, decay: rnd(0.005, 0.009) });
      }
      ensureLoop();
    },

    /* fireworks for ms milliseconds */
    fireworks: function (ms) {
      if (reduce) { explode(W * 0.3, H * 0.3, "#e8c987"); explode(W * 0.7, H * 0.25, "#9fc3a8"); ensureLoop(); return; }
      fireworksUntil = performance.now() + (ms || 9000); nextRocket = 0; ensureLoop();
    },
    stopFireworks: function () { fireworksUntil = 0; },

    /* center of an element in viewport px */
    at: function (el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  };
})();
