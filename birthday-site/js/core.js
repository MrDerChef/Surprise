(function () {
  "use strict";
  var B = (window.BDAY = window.BDAY || {});
  var cfg = (B.cfg = window.BDAY_CONFIG || {});

  /* ---------- tiny helpers ---------- */
  B.$ = function (s, r) { return (r || document).querySelector(s); };
  B.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  B.sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  B.raf = function () { return new Promise(function (r) { requestAnimationFrame(function () { requestAnimationFrame(r); }); }); };

  B.get = function (path) {
    return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, cfg);
  };
  B.fmt = function (s) {
    return String(s == null ? "" : s)
      .replace(/\{first\}/g, cfg.firstName || cfg.name || "")
      .replace(/\{name\}/g, cfg.name || "")
      .replace(/\{nick\}/g, cfg.nickname || cfg.firstName || "")
      .replace(/\{host\}/g, (cfg.quiz && cfg.quiz.hostNickname) || "")
      .replace(/\{from\}/g, cfg.fromName || "");
  };
  B.bindText = function (root) {
    B.$$("[data-t]", root).forEach(function (el) { el.textContent = B.fmt(B.get(el.getAttribute("data-t"))); });
  };

  /* apply theme overrides */
  B.applyTheme = function () {
    var t = cfg.theme || {};
    Object.keys(t).forEach(function (k) { document.documentElement.style.setProperty(k, t[k]); });
  };

  /* ---------- scroll reveal ---------- */
  var io = null;
  B.observe = function (root) {
    var items = B.$$(".reveal, .para", root);
    if (!("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); return; }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { threshold: 0.2, rootMargin: "0px 0px -6% 0px" });
    }
    items.forEach(function (el) { if (!el.classList.contains("in")) io.observe(el); });
  };

  /* split a paragraph into word spans for the soft word-by-word reveal */
  B.wordPara = function (text) {
    var p = document.createElement("p");
    p.className = "para";
    var words = B.fmt(text).split(/\s+/);
    words.forEach(function (w, i) {
      var s = document.createElement("span");
      s.className = "w"; s.style.setProperty("--i", i); s.textContent = w;
      p.appendChild(s);
      if (i < words.length - 1) p.appendChild(document.createTextNode(" "));
    });
    return p;
  };

  /* ---------- scenes ---------- */
  B.unlock = function (id, opts) {
    opts = opts || {};
    var el = document.getElementById(id);
    if (!el) return Promise.resolve();
    el.hidden = false;
    document.body.classList.remove("is-locked");
    B.observe(el);
    return B.raf().then(function () {
      var top = el.getBoundingClientRect().top + window.pageYOffset - (opts.offset || 0);
      window.scrollTo({ top: top, behavior: B.reduce ? "auto" : "smooth" });
    });
  };

  B.scrollToEl = function (el, offset) {
    var top = el.getBoundingClientRect().top + window.pageYOffset - (offset == null ? 80 : offset);
    window.scrollTo({ top: top, behavior: B.reduce ? "auto" : "smooth" });
  };

  /* ---------- audio ---------- */
  var song, muteBtn, userMuted = false, started = false, fadeId = 0;
  B.audio = {
    init: function () {
      song = document.getElementById("song");
      muteBtn = document.getElementById("mute");
      var a = cfg.audio || {};
      if (a.src) song.src = a.src;
      muteBtn.addEventListener("click", function () { B.audio.toggle(); });
      document.addEventListener("visibilitychange", function () {
        if (!started) return;
        if (document.hidden) song.pause();
        else if (!userMuted) song.play().catch(function () {});
      });
    },
    start: function () {
      if (started || !song || !song.src) return;
      started = true;
      var target = (cfg.audio && cfg.audio.volume) != null ? cfg.audio.volume : 0.6;
      song.volume = 0;
      var p = song.play();
      if (p && p.then) {
        p.then(function () {
          muteBtn.hidden = false;
          requestAnimationFrame(function () { muteBtn.classList.add("is-on"); });
          B.audio.fadeTo(target, 2600);
        }).catch(function () { started = false; /* no file yet, or autoplay refused: stay silent */ });
      }
      song.addEventListener("error", function () { muteBtn.hidden = true; }, { once: true });
    },
    fadeTo: function (v, ms) {
      var id = ++fadeId, from = song.volume, t0 = performance.now();
      (function step(t) {
        if (id !== fadeId) return;
        var k = Math.min(1, (t - t0) / ms);
        song.volume = Math.max(0, Math.min(1, from + (v - from) * k));
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    },
    toggle: function () {
      userMuted = !userMuted;
      var target = (cfg.audio && cfg.audio.volume) != null ? cfg.audio.volume : 0.6;
      muteBtn.classList.toggle("is-muted", userMuted);
      muteBtn.setAttribute("aria-pressed", String(userMuted));
      muteBtn.setAttribute("aria-label", userMuted ? "Unmute music" : "Mute music");
      if (userMuted) { B.audio.fadeTo(0, 350); } else { song.play().catch(function () {}); B.audio.fadeTo(target, 700); }
    },
    /* swell for the big moments */
    swell: function (mult) {
      if (!started || userMuted) return;
      var target = (cfg.audio && cfg.audio.volume) != null ? cfg.audio.volume : 0.6;
      B.audio.fadeTo(Math.min(1, target * (mult || 1.3)), 1800);
    }
  };

  /* ---------- logging by email (Web3Forms) ----------
     Sends the answers to the inbox the access key belongs to. Uses a plain form
     post (FormData), which browsers allow cross-site without any extra setup. */
  B.log = function (payload, useBeacon) {
    var L = cfg.logging || {};
    var answers = (payload && payload.answers) || [];
    var status = (payload && payload.status) || "";
    var when;
    try { when = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "medium" }) + " IST"; }
    catch (e) { when = new Date().toString(); }

    var lines = ["Status: " + status + " (" + answers.length + " answer" + (answers.length === 1 ? "" : "s") + ")", "Time: " + when, ""];
    answers.forEach(function (a, i) { lines.push((i + 1) + ". " + a); });
    lines.push("", "Device: " + (navigator.userAgent || "").slice(0, 140));

    try { localStorage.setItem("bday:last", lines.join("\n")); } catch (e) {}
    if (!L.accessKey) { if (window.console) console.info("[bday] logging disabled, would send:\n" + lines.join("\n")); return; }

    var fd = new FormData();
    fd.append("access_key", L.accessKey);
    fd.append("subject", B.fmt(L.subject || "Birthday site: {first}’s answers") + (status === "partial" ? " (partial)" : ""));
    fd.append("from_name", "Birthday site");
    fd.append("status", status);
    fd.append("time", when);
    answers.forEach(function (a, i) { fd.append("answer_" + (i + 1), a); });
    fd.append("message", lines.join("\n"));

    try {
      if (useBeacon && navigator.sendBeacon) navigator.sendBeacon(L.endpoint || "https://api.web3forms.com/submit", fd);
      else fetch(L.endpoint || "https://api.web3forms.com/submit", { method: "POST", body: fd, keepalive: true }).catch(function () {});
    } catch (e) {}
  };
})();
