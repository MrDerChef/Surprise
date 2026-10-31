/* Decides what she sees: countdown, the experience, or the closed page.
   Uses fixed moments (config.schedule.open / close), so her phone's timezone doesn't matter. */
(function () {
  "use strict";
  var B = window.BDAY, cfg = B.cfg, S = cfg.schedule || {};
  var OPEN = new Date(S.open).getTime(), CLOSE = new Date(S.close).getTime();
  var forced = null, timer = 0, cd = {}, prev = {}, built = false, current = null;

  function stateFor(now) {
    if (forced) return forced;
    if (!isFinite(OPEN) || !isFinite(CLOSE)) return "open";
    if (now < OPEN) return "countdown";
    if (now >= CLOSE) return "closed";
    return "open";
  }

  function el(id) { return document.getElementById(id); }

  function show(state) {
    current = state;
    var wait = el("s-wait"), closed = el("s-closed"), intro = el("s-intro");
    wait.classList.remove("is-leaving");
    if (state === "open") {
      wait.hidden = true; closed.hidden = true; intro.hidden = false;
    } else {
      /* nothing else is reachable while waiting or closed */
      B.$$("#app > section.scene").forEach(function (s) { s.hidden = true; });
      (state === "countdown" ? wait : closed).hidden = false;
      window.scrollTo(0, 0);
    }
    clearTimeout(timer);
    if (state === "countdown") { build(); tick(); }
    syncPreview();
  }

  /* ---------- countdown ---------- */
  function build() {
    if (built) return; built = true;
    var box = el("cd");
    [["d", "Days"], ["h", "Hours"], ["m", "Minutes"], ["s", "Seconds"]].forEach(function (u) {
      var t = document.createElement("div");
      t.className = "unit"; t.innerHTML = "<b>00</b><span>" + u[1] + "</span>";
      box.appendChild(t); cd[u[0]] = t.firstChild;
    });
  }
  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function tick() {
    if (current !== "countdown") return;
    var left = OPEN - Date.now();
    if (!forced && left <= 0) { goOpen(); return; }
    if (forced && left <= 0) left = 0;           /* preview after the opening time */
    var secs = Math.ceil(left / 1000);          /* round up: starts at exactly 7 days, ends on 1 second */
    var v = { d: pad(Math.floor(secs / 86400)), h: pad(Math.floor(secs % 86400 / 3600)), m: pad(Math.floor(secs % 3600 / 60)), s: pad(secs % 60) };
    Object.keys(v).forEach(function (k) {
      if (prev[k] === v[k]) return;
      cd[k].textContent = v[k];
      if (prev[k] !== undefined && !B.reduce) { cd[k].classList.remove("tick"); void cd[k].offsetWidth; cd[k].classList.add("tick"); }
      prev[k] = v[k];
    });
    timer = setTimeout(tick, 1000 - (Date.now() % 1000) + 8);
  }

  /* the clock hits zero while she is watching: glide into the experience */
  function goOpen() {
    var wait = el("s-wait");
    B.fx.rain(70);
    B.fx.confetti(window.innerWidth / 2, window.innerHeight * 0.55, { count: 90, spread: 2.6, power: 14 });
    wait.classList.add("is-leaving");
    B.sleep(B.reduce ? 100 : 650).then(function () { show("open"); window.scrollTo(0, 0); });
  }

  /* ---------- preview switcher (testing only) ---------- */
  function buildPreview() {
    var bar = document.createElement("div");
    bar.className = "pv"; bar.id = "pv";
    [["countdown", "Countdown"], ["open", "Open"], ["closed", "Closed"]].forEach(function (x) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = x[1]; b.setAttribute("data-s", x[0]);
      b.addEventListener("click", function (e) { e.stopPropagation(); forced = x[0]; show(x[0]); });
      bar.appendChild(b);
    });
    document.body.appendChild(bar);
  }
  function syncPreview() {
    var bar = el("pv"); if (!bar) return;
    B.$$("button", bar).forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-s") === current); });
  }

  B.schedule = {
    start: function () {
      B.$("#waitTitle").textContent = B.fmt(B.get("schedule.wait.title"));
      if (S.allowPreview) buildPreview();
      show(stateFor(Date.now()));
    }
  };
})();
