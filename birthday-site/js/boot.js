(function () {
  "use strict";
  var B = window.BDAY, cfg = B.cfg;

  /* once the quiz is done, the story scenes (about, life, poem) become scrollable */
  B.revealStory = function () {
    ["s-life", "s-poem"].forEach(function (id) {
      var el = document.getElementById(id);
      el.hidden = false; B.observe(el);
    });
  };

  function drawGate() {
    var url = location.href.split("#")[0];
    try {
      var qr = qrcode(0, "M");
      qr.addData(url); qr.make();
      B.$("#gateQr").innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    } catch (e) { B.$("#gateQr").hidden = true; }
  }

  /* every tap or click leaves a little golden star */
  var STAR_PATH = "M12 2.2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.8l1.4-6.8L2.2 9.3l6.9-.8z";
  function gateVisible() { return getComputedStyle(document.getElementById("gate")).display !== "none"; }
  function domStar(x, y, size, dx, dy, delay) {
    var el = document.createElement("span");
    el.setAttribute("aria-hidden", "true");
    el.style.cssText = "position:fixed;left:" + (x - size / 2) + "px;top:" + (y - size / 2) + "px;width:" + size + "px;height:" + size +
      "px;pointer-events:none;z-index:1100;will-change:transform,opacity";
    el.innerHTML = '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="#e6b84f" d="' + STAR_PATH + '"/></svg>';
    document.body.appendChild(el);
    var end = B.reduce ? "translate(0,0) scale(1)" : "translate(" + dx + "px," + dy + "px) scale(1.1) rotate(" + (dx > 0 ? 90 : -90) + "deg)";
    var a = el.animate([
      { transform: "translate(0,0) scale(.3) rotate(0deg)", opacity: 0 },
      { opacity: 1, offset: 0.25 },
      { transform: end, opacity: 0 }
    ], { duration: B.reduce ? 500 : 760, delay: delay || 0, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "both" });
    a.onfinish = function () { el.remove(); };
  }
  B.tapStar = function (x, y, forceDom) {
    if (forceDom || gateVisible()) {
      domStar(x, y, 26, 0, -26, 0);
      if (!B.reduce) for (var i = 0; i < 6; i++) {
        var ang = (i / 6) * 6.283 + Math.random() * 0.6, r = 34 + Math.random() * 26;
        domStar(x, y, 9 + Math.random() * 6, Math.cos(ang) * r, Math.sin(ang) * r, 40);
      }
    } else {
      B.fx.star(x, y);
    }
  };
  function initTapStars() {
    document.addEventListener("pointerdown", function (e) { B.tapStar(e.clientX, e.clientY); }, { passive: true });
  }

  function boot() {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    B.applyTheme();
    B.bindText(document);
    document.title = "Happy Birthday, " + (cfg.firstName || cfg.name || "") + " ✦";

    drawGate();
    B.fx.init();
    B.audio.init();
    B.initQuiz();
    B.initStory();
    B.initPoem();
    B.initFinale();
    B.observe(document.getElementById("s-intro"));
    initTapStars();
    B.schedule.start();

    if (!/^\d{4}-\d{2}-\d{2}/.test(cfg.dob || "")) console.warn("[bday] config.dob looks wrong");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
