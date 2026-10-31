(function () {
  "use strict";
  var B = window.BDAY, cfg = B.cfg, P = cfg.poem || {};
  var opened = false, io;

  B.initPoem = function () {
    B.$("#poemTitle").textContent = B.fmt(P.title);
    B.$("#poemSign").textContent = B.fmt(P.signoff);
    var body = B.$("#poemBody");
    (P.lines || []).forEach(function (line) {
      var s = document.createElement("span");
      s.className = "pl" + (line.trim() === "" ? " pl--gap" : "");
      /* the last word of each line is set in bold, to show the rhyme */
      var m = line.match(/^(.*?)([\p{L}’'-]+)([^\p{L}]*)$/u);
      if (m) {
        s.appendChild(document.createTextNode(m[1]));
        var b = document.createElement("b"); b.textContent = m[2]; s.appendChild(b);
        s.appendChild(document.createTextNode(m[3]));
      } else { s.textContent = line; }
      body.appendChild(s);
    });
    var ps = B.$("#poemPs");
    if (P.ps) ps.textContent = B.fmt(P.ps); else ps.hidden = true;
    var next = B.$("#poemNext");
    next.textContent = B.fmt(P.continueLabel || "One last thing");
    next.addEventListener("click", function () {
      var p = B.fx.at(next); B.fx.sparkle(p.x, p.y, 26);
      next.disabled = true;
      B.audio.swell(1.15);
      B.unlock("s-finale");
    });

    B.$("#seal").addEventListener("click", open);
  };

  function open() {
    if (opened) return; opened = true;
    var letter = B.$("#letter"), seal = B.$("#seal");
    var p = B.fx.at(seal);
    letter.classList.add("is-open");
    B.$("#sealHint").style.opacity = "0";
    B.fx.sparkle(p.x, p.y, 46);
    B.fx.hearts(p.x, p.y, 6);

    B.sleep(B.reduce ? 200 : 1150).then(function () {
      letter.classList.add("is-gone");
      return B.sleep(480);
    }).then(function () {
      letter.hidden = true; B.$("#sealHint").hidden = true;
      var poem = B.$("#poem");
      poem.hidden = false;
      void poem.offsetWidth;
      poem.classList.add("in");
      B.$("#poemNext").hidden = false;
      B.scrollToEl(poem, 70);
      watch(poem);
    });
  }

  /* each line surfaces as it enters view, in a soft cascade */
  function watch(poem) {
    var items = B.$$(".pl, .poem__sign, .poem__ps, #poemNext", poem);
    if (!("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); return; }
    io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.setProperty("--d", (k++ * 130) + "ms");
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { threshold: 0.7, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }
})();
