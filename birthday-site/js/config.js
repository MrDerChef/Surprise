/* ==========================================================================
   EVERYTHING PERSONAL LIVES IN THIS FILE.
   To reuse the site for someone else, edit only this file (and the audio).
   Search for  ✎  to find the spots you still need to fill in.
   ========================================================================== */
window.BDAY_CONFIG = {

  /* ---------- Who is it for ---------- */
  name: "Nusaiba Afsheen",
  firstName: "Nusaiba",
  nickname: "Kutty Scammer",           // used on the countdown screen
  fromName: "Der Chef",                // signs the poem, the card and the final screen
  birthdayLabel: "8 November",         // shown on the birthday card

  /* Date of birth, used by the live age counter.
     Format: "YYYY-MM-DDTHH:MM:SS" in HER local time.
     (If you don't know the time of birth, keep T00:00:00.) */
  dob: "2002-11-08T00:00:00",

  /* ---------- When the site is open (India time, +05:30) ----------
     Before "open"  : a live countdown screen.
     Between        : the full experience.
     After "close"  : a polite "come back next year" screen.
     The check uses fixed moments, so her phone's timezone doesn't matter.
     allowPreview adds a little Countdown / Open / Closed switcher so you can test
     all three screens. Keep it FALSE for the version you send to her. */
  schedule: {
    open:  "2026-11-08T00:00:00+05:30",
    close: "2026-11-09T00:00:00+05:30",
    allowPreview: false,

    wait: {
      kicker: "Opens 8 November, 12:00 AM",
      title: "Not yet, {nick}.",
      line: "Your surprise is being processed. Estimated delivery: 8 November.",
      note: "Peeking is allowed. Chargebacks are not."
    },
    closed: {
      kicker: "Closed for the year",
      title: "Come back next year.",
      line: "This page has been closed. The candle is out, the cake is gone, and it’s time to turn the page.",
      foot: "Until then, keep shining, star."
    }
  },

  /* ---------- Scene 1: the question ---------- */
  quiz: {
    hostNickname: "the Chef",
    kicker: "Before anything else…",
    question: "What does {host} call you?",
    hint: "Five guesses. Press enter after each one.",
    boxes: 5,
    placeholders: ["Guess 1", "Guess 2", "Guess 3", "Guess 4", "Guess 5"],
    successTitle: "All 5 are right!",
    successLine: "Of course they are. Come in, there’s more.",
    startLabel: "Tap to begin"
  },

  /* ---------- Where the answers go: your email (Web3Forms) ----------
     The access key is not a secret. It only forwards submissions to your inbox.
     Leave accessKey "" to turn logging off (answers then stay on her phone). */
  logging: {
    accessKey: "6cee822d-3c0f-4f47-aa60-e31cf948f5d3",
    subject: "Birthday site: {first}’s answers"
  },

  /* ---------- Scene 2: about her (with the live age counter) ---------- */
  about: {
    kicker: "A little about you",
    title: "Meet {first}.",
    paragraphs: [
      "The girl who made me laugh, think, listen, rant, and showed me who I really am. 🥹",
      "Who is saved in my contacts as “Potential Fraud” and “Suspected Spam”. Fraud is half right: she is, after all, a Frau (a woman, in German 😛). Spam, I now understand: messages delivered, read at her leisure, replied to in a later quarter, and forgotten before the reply. 😛"
    ],
    counterTitle: "You’ve been lighting up the world for",
    counterNote: "and this clock is ticking live, right now, just for you."
  },

  /* ---------- Scene 3: what she's been in my life ---------- */
  life: {
    kicker: "And in my life",
    title: "What you’ve been.",
    paragraphs: [],                       // add your own lines here if you ever want some

    /* the "In English / In poetry" block */
    quote: {
      enLabel: "In English, we say:",
      en: "“You are my favorite person.”",
      poLabel: "In poetry, we say:",
      lines: [
        "You are my north, my south,",
        "my east and my west. The calm",
        "in my chaos, the peace in all",
        "the rest. My noon, my midnight,",
        "my silence, my song. My safe",
        "place, when I can’t stay strong.",
        "You are the light",
        "that carries me through.",
        "Thank you for being you."
      ]
    },

    /* the Duolingo card */
    duo: {
      kicker: "Our Duolingo streak",
      enTag: "In English",
      en: "Boss",
      deTag: "Auf Deutsch",
      de: "Chef",
      line: "Two languages, one title, and a streak neither of us is allowed to break."
    }
  },

  /* ---------- Scene 4: the poem ---------- */
  poem: {
    kicker: "I wrote something for you",
    sealHint: "Tap the seal",
    title: "For {first}",
    /* One string per line. Use "" for a blank line between stanzas. */
    lines: [
      "To the girl born in November,",
      "whom I always like to remember.",
      "Has eyes that glow like amber,",
      "looks like princess Aurora upon slumber.",
      "",
      "With a voice as soft as gentle timbre,",
      "Has a smile that brings light to my chamber.",
      "A kind friend and a valued team member,",
      "Happy birthday, may every dream come true by next November!"
    ],
    signoff: "-{from}",
    /* a little footnote under the signature */
    ps: "P.S. Four months, two lines a month. Final version. Almost nothing rhymes with November, and I used all of it.",
    continueLabel: "One last thing"
  },

  /* ---------- Scene 5: finale ---------- */
  finale: {
    envelopeHint: "Tap to open",
    cardTitle: "Alles Gute zum Geburtstag",
    cardMessage: "Your name means “noble blessing,” and you live up to it daily. May you keep showering light on everyone around you.",
    wishButton: "Make a wish",
    cakeHint: "Tap the flames to blow them out",
    micLabel: "or blow into your mic",
    afterBlow: "May every wish come true.",
    afterExtra: "Happy Diwali, and enjoy the Bangalore days.",
    afterSign: "-{from}",
    candles: 3
  },

  /* ---------- Music ---------- */
  audio: {
    src: "assets/audio/song.mp3",       // ✎ add your own file here
    volume: 0.6
  },

  /* ---------- Desktop gate ---------- */
  gate: {
    title: "Good things come in small screens.",
    text: "This one was tailored to fit a pocket, not a monitor. Scan the code and let it unfold in your hands.",
    scanHint: "Point your phone’s camera here"
  },

  /* ---------- Colours (override the CSS variables if you like) ---------- */
  theme: {
    /* e.g.  "--accent": "#e8c987" */
  }
};
