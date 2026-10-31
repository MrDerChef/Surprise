(function () {
  "use strict";
  var B = window.BDAY, cfg = B.cfg, Q = cfg.quiz || {};
  var answers = [], boxes = [], done = false, lastPartialCount = 0;

  var TICK = '<svg class="box__tick" viewBox="0 0 26 26" aria-hidden="true"><circle cx="13" cy="13" r="13"/><path d="M7.5 13.5l4 4 7-8.5"/></svg>';

  B.initQuiz = function () {
    var total = Q.boxes || 5;
    var list = B.$("#boxes");
    B.$("#quizQuestion").textContent = B.fmt(Q.question);

    for (var i = 0; i < total; i++) {
      var li = document.createElement("li");
      li.className = "box " + (i === 0 ? "is-current" : "is-wait");
      li.innerHTML = '<span class="box__n">' + (i + 1) + '</span>' +
        '<input type="text" inputmode="text" autocomplete="off" autocapitalize="words" autocorrect="off" spellcheck="false" ' +
        'enterkeyhint="' + (i === total - 1 ? "done" : "next") + '" maxlength="40" aria-label="Guess ' + (i + 1) + '" ' +
        'placeholder="' + ((Q.placeholders && Q.placeholders[i]) || "Guess " + (i + 1)) + '"' + (i === 0 ? "" : " disabled") + '>' + TICK;
      list.appendChild(li);
      boxes.push({ li: li, input: li.querySelector("input") });
    }

    boxes.forEach(function (b, idx) {
      b.input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.keyCode === 13) { e.preventDefault(); lock(idx); }
      });
      b.input.addEventListener("focus", function () {
        setTimeout(function () { b.li.scrollIntoView({ block: "center", behavior: B.reduce ? "auto" : "smooth" }); }, 250);
      });
    });

    B.$("#startBtn").addEventListener("click", start);
    B.$("#successBtn").addEventListener("click", proceed);

    /* if she leaves midway, still keep what she typed */
    function partial() {
      if (done) return;
      var typed = answers.slice();
      var live = boxes[answers.length];
      if (live && live.input.value.trim()) typed.push(live.input.value.trim());
      if (!typed.length || typed.length === lastPartialCount) return;
      lastPartialCount = typed.length;
      B.log({ event: "quiz", status: "partial", count: typed.length, answers: typed }, true);
    }
    window.addEventListener("pagehide", partial);
    document.addEventListener("visibilitychange", function () { if (document.hidden) partial(); });
  };

  function start() {
    B.audio.start();                       /* the tap is what lets music play */
    var p = B.fx.at(B.$("#startBtn"));
    B.fx.sparkle(p.x, p.y, 34);

    B.$("#introTap").hidden = true;
    var quiz = B.$("#introQuiz");
    quiz.hidden = false;
    window.scrollTo(0, 0);
    boxes[0].input.focus({ preventScroll: true });   /* same gesture, so the keyboard opens */
    B.raf().then(function () { quiz.classList.add("in"); });
  }

  function lock(i) {
    var b = boxes[i];
    var val = b.input.value.trim();
    if (!val) { b.li.classList.remove("is-nudge"); void b.li.offsetWidth; b.li.classList.add("is-nudge"); return; }

    answers[i] = val;
    b.input.readOnly = true;
    b.li.classList.remove("is-current");
    b.li.classList.add("is-done", "is-pop");

    var p = B.fx.at(b.li);
    B.fx.sparkle(p.x + 60, p.y, 12);

    var next = boxes[i + 1];
    if (next) {
      next.li.classList.remove("is-wait");
      next.li.classList.add("is-current");
      next.input.disabled = false;
      next.input.focus({ preventScroll: true });          /* still inside the key event */
    } else {
      b.input.blur();
      finish();
    }
  }

  function finish() {
    done = true;
    B.log({ event: "quiz", status: "complete", count: answers.length, answers: answers });
    B.sleep(650).then(function () {
      var s = B.$("#success");
      s.hidden = false;
      void s.offsetWidth;
      s.classList.add("is-on");
      B.audio.swell(1.25);
      var w = window.innerWidth, h = window.innerHeight;
      B.fx.confetti(w * 0.15, h * 0.85, { count: 70, angle: -1.05, spread: 0.9, power: 15 });
      B.fx.confetti(w * 0.85, h * 0.85, { count: 70, angle: -2.09, spread: 0.9, power: 15 });
      B.sleep(450).then(function () { B.fx.rain(90); });
    });
  }

  function proceed() {
    var s = B.$("#success");
    s.classList.remove("is-on");
    B.sleep(450).then(function () {
      s.hidden = true;
      B.revealStory();
      B.unlock("s-about");
      B.counter.start();
    });
  }
})();
