# Birthday site

A phone-only, scroll-through birthday surprise. Plain HTML, CSS and JavaScript. No build step, no frameworks.
Made for GitHub Pages, but it works on any static host.

## When it's open

The site checks the phone's clock against fixed moments in India time (set in `js/config.js` under `schedule`):

| When | What she sees |
|---|---|
| Before 8 Nov 2026, 12:00 AM (from 1 Nov it reads 7 days and counts down; earlier it shows more days) | **Countdown:** "Not yet, Nusaiba." with live days, hours, minutes and seconds. At zero it glides into the experience by itself, no reload. |
| 8 Nov 12:00 AM to 9 Nov 12:00 AM | **The experience** (below). |
| From 9 Nov 12:00 AM | **"Come back next year."** A punny closed page. |

Because the moments are fixed, her phone's timezone doesn't matter. The desktop gate shows in every state on large screens.

**Test all three screens:** set `allowPreview: true` in the `schedule` block. A small *Countdown / Open / Closed* switcher appears at the bottom. **Set it back to `false` before you send her the link.**

**A real close:** the date check can be fooled by changing a phone's clock, and the files are still public. On 9 November, to truly close it, turn off GitHub Pages (Settings → Pages → Unpublish) or make the repo private.

## What she sees (during the open window)

1. **Desktop gate:** on laptops and monitors: "Good things come in small screens", plus a QR code.
2. **Tap to begin**, then **"What does the Chef call you?"** with five boxes. Every answer is accepted and emailed to you. Then **"All 5 are right!"**
3. **About her**, with a live age counter (years, months, days, hours, minutes, seconds, plus running totals).
4. **What you've been**, a warm note for a friend and colleague, with the Duolingo card (Boss in English, Chef in German).
5. **The poem**, sealed in a letter. A tap breaks the seal and the lines surface one by one.
6. **Finale:** envelope, birthday card, cake with candles (tap the flames or blow into the mic), then fireworks.

Stars are the motif throughout: drifting in the background, on every tap or click, in the seal and the envelope, and in the celebrations.

## Quick start

1. Open `js/config.js` and fill in everything marked **✎**: her date of birth, the "About her" and "What you've been" texts, and the card message. The poem and your name ("Der Chef") are already in.
2. Put your song at `assets/audio/song.mp3`.
3. Check the email setup under **Log the answers** below.
4. Push to GitHub and turn on Pages (see **Deploy**).

### Testing on your computer

The desktop gate hides the site on wide, mouse-driven screens. To see the real thing:

- **Easiest:** shrink the browser window below about 700px wide, or
- open DevTools and switch on the **device toolbar** (phone icon), or
- run `python3 -m http.server 8000` in this folder and open `http://YOUR-COMPUTER-IP:8000` on your phone (same Wi-Fi).

Please try it on a real phone at least once. Emulators don't reproduce keyboard behaviour, safe areas or touch feel.

## Log the answers (email)

A static site can't write to a file by itself, so the answers are emailed to you through [Web3Forms](https://web3forms.com) (free, 250 emails a month).
One email arrives each time she fills in the five boxes. It shows the status, a timestamp (IST) and the five answers. If she leaves part-way, what she typed so far arrives as a `(partial)` email.

**Setup (already done for this project)**

1. On web3forms.com, enter the email address that should receive the answers. The access key is emailed to you.
2. Put the key in `js/config.js`:
   ```js
   logging: {
     accessKey: "YOUR_ACCESS_KEY",
     subject: "Birthday site: {first}’s answers"
   }
   ```
3. Test: open the site, answer the five boxes, and check your inbox (and the spam folder the first time).

**Good to know**

- The access key is public by design. It forwards submissions to your inbox and can't sign in to anything. Your email address itself is not in the code. The worst case is someone sending you junk through the key.
- There is no running list, so your inbox is the log. Search for the subject line to find them all.
- The "partial" email depends on the browser letting a message go out as the page closes. It usually does, but it isn't guaranteed.
- For a different person, create a new access key (or reuse this one and change `subject`).

## Deploy to GitHub Pages

1. Create a GitHub repo and push this folder's contents to it (the files should sit at the top level, so `index.html` is in the repo root).
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
3. After a minute your site is live at `https://USERNAME.github.io/REPO/`.

All paths in the project are relative, so the `/REPO/` sub-path works fine. The empty `.nojekyll` file tells GitHub not to process the folder.

**The song:** a public repo means the audio file is public. If you use a copyrighted track, a short clip (30–60 seconds) is safer than the full song. Free GitHub Pages needs a public repo.

## Reuse it for someone else

Everything personal lives in `js/config.js`. For the next person, change:

- `name`, `firstName`, `fromName`, `birthdayLabel`, `dob`
- the `quiz` question and `hostNickname`
- `about`, `life` (including the Duolingo card), the `poem` and the finale card text
- the song in `assets/audio/`
- optionally the colours (see `theme` in the config, or the `:root` variables at the top of `css/style.css`)

Use a different `subject` (or a new Web3Forms key) for each person so their emails stay separate.

## Project map

```
index.html            page skeleton
css/style.css         all styling and motion
js/config.js          ← the file you edit
js/fx.js              drifting stars, tap stars, confetti, fireworks (canvas)
js/core.js            helpers, scene unlocking, scroll reveals, audio, email logging
js/quiz.js            scene 1
js/story.js           about, life, live counter
js/poem.js            sealed letter + poem
js/finale.js          envelope, cake, blow-out
js/schedule.js        countdown / open / closed logic + preview switcher
js/boot.js            wires it all together
vendor/qrcode.js      QR code for the desktop gate (MIT, self-hosted)
```

## Notes

- **Fonts:** Cormorant Garamond and Figtree load from Google Fonts. Offline, it falls back to Georgia and the system font.
- **Reduced motion:** if her phone has "reduce motion" switched on, movement becomes gentle fades, and the effects use far fewer particles.
- **iPhone volume:** iPhones ignore programmatic volume, so the music fade-in won't work there.
- **Sound:** browsers only allow audio after a tap, which is why the site opens with "Tap to begin". A mute button appears in the corner once music is playing.
- **Mic blow-out:** optional. The browser asks for permission. If she declines, tapping the flames works too.
