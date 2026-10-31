(function () {
  "use strict";
  var B = window.BDAY, cfg = B.cfg, F = cfg.finale || {};
  var blown = false, micStream = null, micCtx = null, micRaf = 0;

  function cakeSvg(n) {
    var cs = "", fl = "", sm = "", i, x;
    var spread = 22, start = 150 - ((n - 1) * spread) / 2;
    for (i = 0; i < n; i++) {
      x = start + i * spread;
      cs += '<rect x="' + (x - 3.5) + '" y="86" width="7" height="30" rx="2" fill="' + (i % 2 ? "#9fc3a8" : "#e6f3e9") + '"/>' +
            '<path d="M' + (x - 3.5) + ' 96l7 -5M' + (x - 3.5) + ' 106l7 -5" stroke="#e8c987" stroke-width="2" stroke-linecap="round"/>';
      fl += '<g class="flame" style="--fl:' + (i * 0.23) + 's"><path d="M' + x + ' 64c6 8 8 13 0 21c-8 -8 -6 -13 0 -21z" fill="#ffd36b"/><path d="M' + x + ' 72c3 4 4 7 0 11c-4 -4 -3 -7 0 -11z" fill="#fff4c4"/></g>';
      sm += '<path class="smoke" style="--sd:' + (i * 0.12) + 's" d="M' + x + ' 80c-5 -8 5 -12 0 -22"/>';
    }
    return '<svg viewBox="0 0 300 270" aria-hidden="true">' +
      '<defs><radialGradient id="halo"><stop offset="0" stop-color="#ffd36b" stop-opacity=".55"/><stop offset="1" stop-color="#ffd36b" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="tierA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c8a65"/><stop offset="1" stop-color="#1a5c42"/></linearGradient>' +
      '<linearGradient id="tierB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3da57f"/><stop offset="1" stop-color="#247556"/></linearGradient></defs>' +
      '<circle class="halo" cx="150" cy="86" r="96" fill="url(#halo)"/>' +
      '<ellipse cx="150" cy="252" rx="132" ry="14" fill="#0b2a1c"/><ellipse cx="150" cy="248" rx="126" ry="12" fill="#e6f3e9" opacity=".9"/>' +
      '<rect x="46" y="170" width="208" height="78" rx="10" fill="url(#tierA)"/>' +
      '<path d="M46 180c0-6 6-10 12-10h184c6 0 12 4 12 10v6c-8 0-8 12-18 12s-10-10-20-10-10 14-22 14-10-12-22-12-10 12-22 12-10-14-22-14-10 14-22 14-10-10-20-10-10 8-16 8z" fill="#e6f3e9"/>' +
      '<rect x="86" y="118" width="128" height="58" rx="9" fill="url(#tierB)"/>' +
      '<path d="M86 126c0-5 4-8 9-8h110c5 0 9 3 9 8v5c-6 0-6 9-14 9s-8-8-16-8-8 11-17 11-8-9-17-9-8 9-16 9-8-7-14-7z" fill="#f6e2b3"/>' +
      '<g fill="#e8c987"><circle cx="70" cy="214" r="2.6"/><circle cx="102" cy="226" r="2.6"/><circle cx="142" cy="212" r="2.6"/><circle cx="182" cy="228" r="2.6"/><circle cx="222" cy="214" r="2.6"/><circle cx="116" cy="154" r="2.4"/><circle cx="160" cy="160" r="2.4"/><circle cx="196" cy="152" r="2.4"/></g>' +
      '<g fill="#9fc3a8"><circle cx="86" cy="200" r="2.6"/><circle cx="124" cy="232" r="2.6"/><circle cx="206" cy="204" r="2.6"/><circle cx="138" cy="142" r="2.4"/></g>' +
      cs + sm + fl + '</svg>';
  }

  B.initFinale = function () {
    B.$("#hbName").textContent = B.fmt("{name}");
    B.$("#hbDate").textContent = B.fmt(cfg.birthdayLabel || "");
    B.$("#hbFrom").textContent = B.fmt("-{from}");
    B.$("#afterName").textContent = B.fmt("{name}");
    B.$("#afterFrom").textContent = B.fmt(F.afterSign || "-{from}");
    B.$(".envelope__to").textContent = "";
    B.$("#cake").innerHTML = cakeSvg(F.candles || 3);

    B.$("#envBtn").addEventListener("click", openEnvelope);
    B.$("#wishBtn").addEventListener("click", showCake);
    var cake = B.$("#cake");
    cake.addEventListener("click", blow);
    cake.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); blow(); } });
    B.$("#micBtn").addEventListener("click", listen);
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && (window.AudioContext || window.webkitAudioContext))) B.$("#micBtn").hidden = true;
  };

  /* ---- step 1: the envelope opens ---- */
  function openEnvelope() {
    var env = B.$("#envelope");
    if (env.classList.contains("is-open")) return;
    env.classList.add("is-open");
    var p = B.fx.at(B.$("#envBtn"));
    B.fx.sparkle(p.x, p.y, 36);
    B.sleep(B.reduce ? 300 : 1700).then(function () {
      env.classList.add("is-leaving-up");
      return B.sleep(480);
    }).then(function () {
      env.hidden = true;
      var card = B.$("#hbCard");
      card.hidden = false; card.classList.add("is-entering");
      var q = B.fx.at(card);
      B.fx.confetti(q.x, q.y + 30, { count: 70, spread: 2.2, power: 13 });
      B.fx.hearts(q.x, q.y + 120, 8);
      B.audio.swell(1.2);
    });
  }

  /* ---- step 2: the cake ---- */
  function showCake() {
    var card = B.$("#hbCard");
    card.classList.remove("is-entering");
    card.classList.add("is-leaving-up");
    B.sleep(480).then(function () {
      card.hidden = true;
      var wrap = B.$("#cakeWrap");
      wrap.hidden = false; wrap.classList.add("is-entering");
      B.scrollToEl(B.$("#finaleStage"), 90);
    });
  }

  /* ---- step 3: blow them out ---- */
  function blow() {
    if (blown) return; blown = true;
    stopMic();
    var cake = B.$("#cake");
    cake.classList.add("is-out");
    B.$("#cakeHint").style.opacity = "0";
    B.$("#micBtn").hidden = true;
    var p = B.fx.at(cake);
    B.fx.sparkle(p.x, p.y - 60, 28);
    B.audio.swell(1.3);

    B.sleep(B.reduce ? 400 : 1500).then(function () {
      var wrap = B.$("#cakeWrap");
      wrap.classList.remove("is-entering"); wrap.classList.add("is-leaving-up");
      return B.sleep(480);
    }).then(function () {
      B.$("#cakeWrap").hidden = true;
      var after = B.$("#after");
      after.hidden = false; after.classList.add("is-entering");
      var w = window.innerWidth, h = window.innerHeight;
      B.fx.fireworks(14000);
      B.fx.confetti(w * 0.2, h * 0.9, { count: 80, angle: -1.1, spread: 0.9, power: 16 });
      B.fx.confetti(w * 0.8, h * 0.9, { count: 80, angle: -2.04, spread: 0.9, power: 16 });
      B.sleep(900).then(function () { B.fx.rain(110); B.fx.hearts(w / 2, h * 0.7, 14); });
      B.sleep(5200).then(function () { B.fx.hearts(w / 2, h * 0.75, 12); });
    });
  }

  /* optional: blow into the microphone */
  function listen() {
    var btn = B.$("#micBtn");
    var AC = window.AudioContext || window.webkitAudioContext;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      micStream = stream; micCtx = new AC();
      var src = micCtx.createMediaStreamSource(stream), an = micCtx.createAnalyser();
      an.fftSize = 512; src.connect(an);
      var buf = new Uint8Array(an.fftSize), hits = 0;
      btn.querySelector("span").textContent = "Listening… blow gently";
      (function tick() {
        if (blown) return;
        an.getByteTimeDomainData(buf);
        var sum = 0; for (var i = 0; i < buf.length; i++) { var v = (buf[i] - 128) / 128; sum += v * v; }
        var rms = Math.sqrt(sum / buf.length);
        hits = rms > 0.16 ? hits + 1 : Math.max(0, hits - 1);
        if (hits > 6) { blow(); return; }
        micRaf = requestAnimationFrame(tick);
      })();
    }).catch(function () {
      btn.hidden = true;     /* permission refused: tapping the flames still works */
    });
  }
  function stopMic() {
    cancelAnimationFrame(micRaf);
    if (micStream) micStream.getTracks().forEach(function (t) { t.stop(); });
    if (micCtx && micCtx.close) micCtx.close().catch(function () {});
    micStream = null; micCtx = null;
  }
})();
