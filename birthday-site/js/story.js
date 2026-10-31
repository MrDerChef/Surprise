(function () {
  "use strict";
  var B = window.BDAY, cfg = B.cfg;

  var dob = null, timer = 0, started = false;
  var ymdEls = {}, totEls = {}, prev = {};

  function fill(id, paragraphs) {
    var box = B.$(id);
    (paragraphs || []).forEach(function (t) { box.appendChild(B.wordPara(t)); });
  }

  /* calendar difference, in her local time */
  function diff(from, to) {
    var y = to.getFullYear() - from.getFullYear();
    var m = to.getMonth() - from.getMonth();
    var d = to.getDate() - from.getDate();
    var h = to.getHours() - from.getHours();
    var mi = to.getMinutes() - from.getMinutes();
    var s = to.getSeconds() - from.getSeconds();
    if (s < 0) { s += 60; mi--; }
    if (mi < 0) { mi += 60; h--; }
    if (h < 0) { h += 24; d--; }
    if (d < 0) { d += new Date(to.getFullYear(), to.getMonth(), 0).getDate(); m--; }
    if (m < 0) { m += 12; y--; }
    return { y: y, mo: m, d: d, h: h, mi: mi, s: s };
  }

  function fmtNum(n) { try { return n.toLocaleString(); } catch (e) { return String(n); } }
  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function build() {
    var ymd = B.$("#cYmd"), tot = B.$("#cTotals");
    [["y", "Years"], ["mo", "Months"], ["d", "Days"], ["h", "Hours"], ["mi", "Minutes"], ["s", "Seconds"]].forEach(function (u) {
      var el = document.createElement("div");
      el.className = "unit";
      el.innerHTML = "<b>0</b><span>" + u[1] + "</span>";
      ymd.appendChild(el); ymdEls[u[0]] = el.firstChild;
    });
    /* one extra tile in the same style: total days lived */
    var row = document.createElement("div");
    row.className = "unit";
    row.innerHTML = "<b>0</b><span>Total days</span>";
    tot.appendChild(row); totEls.days = row.firstChild;
  }

  function render() {
    var now = new Date();
    var ms = now.getTime() - dob.getTime();
    if (ms < 0) ms = 0;
    var d = diff(dob, now);

    ["y", "mo", "d", "h", "mi", "s"].forEach(function (k) {
      var v = k === "y" ? String(d[k]) : pad(d[k]);
      if (prev[k] !== v) {
        ymdEls[k].textContent = v;
        if (prev[k] !== undefined && !B.reduce) {
          ymdEls[k].classList.remove("tick"); void ymdEls[k].offsetWidth; ymdEls[k].classList.add("tick");
        }
        prev[k] = v;
      }
    });

    totEls.days.textContent = fmtNum(Math.floor(ms / 86400000));
  }

  function loop() {
    render();
    timer = setTimeout(loop, 1000 - (Date.now() % 1000) + 8);   /* stay aligned to her real clock */
  }

  B.initStory = function () {
    B.$("#aboutTitle").textContent = B.fmt(cfg.about.title);
    fill("#aboutText", cfg.about.paragraphs);
    fill("#lifeText", cfg.life.paragraphs);

    var q = cfg.life.quote;
    if (q) {
      B.$("#qEnLabel").textContent = B.fmt(q.enLabel);
      B.$("#qEn").textContent = B.fmt(q.en);
      B.$("#qPoLabel").textContent = B.fmt(q.poLabel);
      var verse = B.$("#qVerse");
      (q.lines || []).forEach(function (line, i) {
        var l = document.createElement("span");
        l.className = "quote__line reveal";
        l.style.setProperty("--d", (i % 3) * 90 + "ms");
        l.textContent = B.fmt(line);
        verse.appendChild(l);
      });
    } else { B.$("#quote").hidden = true; }

    dob = new Date(cfg.dob);
    if (isNaN(dob.getTime()) || dob.getTime() > Date.now()) { B.$("#counter").hidden = true; return; }
    build(); render();
  };

  B.counter = {
    start: function () {
      if (started || !dob || isNaN(dob.getTime())) return;
      started = true; loop();
    }
  };
})();
