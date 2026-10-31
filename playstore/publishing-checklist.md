# Publishing Checklist — Safety Detective Town (Android)

A plain-language, step-by-step checklist for taking this app from "project on disk" to "live on Google Play," written for someone who has never used Play Console before. Work through it top to bottom.

---

## 1. One-time Play Console setup

Before you can publish anything, you need a Google Play Developer account. This is a one-time setup, not per-app.

- [ ] Go to [play.google.com/console](https://play.google.com/console) and sign in with the Google account you want to publish under.
- [ ] Register as a developer. Google has long charged a one-time **USD 25** registration fee for this — but confirm the exact current fee on the signup page itself, since it may have changed.
- [ ] Complete identity verification (Google may ask for a government ID and/or a short verification video, depending on account type). This can take anywhere from a few hours to a few days.

## 2. Create the app in Play Console

- [ ] Click "Create app."
- [ ] App name: **Safety Detective Town** (English store listing). Tamil name **பாதுகாப்பு துப்பறியும் நகரம்** goes into the Tamil listing later, not here.
- [ ] Default language: English (United States) — add Tamil as an additional language in step 5.
- [ ] App or game: **Game**.
- [ ] Free or paid: **Free**.
- [ ] Declarations: confirm the app is **not** intended for Wear OS, Android Auto, Android TV, or Google TV — this is a phone/tablet game only.

## 3. Build the signed release bundle

This step happens on your computer, not in Play Console.

- [ ] Make sure `android/keystore.properties` exists locally. It is intentionally **never committed to git** — see `android/README.md` for how to create it.
- [ ] From the `android/` folder, run:
  ```
  ./gradlew bundleRelease
  ```
- [ ] Confirm the build finishes without errors and produces a signed `.aab` file (check the Gradle output path, typically under `android/app/build/outputs/bundle/release/`).

## 4. Upload to Closed testing first

Don't go straight to Production for a first release — Closed testing catches problems with zero public risk.

- [ ] In Play Console, go to Testing → Closed testing, create a new track, and upload the `.aab`.
- [ ] Add your own email address as a tester.
- [ ] Install the test build on a real device and confirm it opens and plays correctly.
- [ ] Only after it checks out, promote the release to Production.

## 5. Store listing, screenshots, and graphics

- [ ] Store listing (English): paste title, short description, and full description from `playstore/listing-en.md`.
- [ ] Store listing (Tamil): in Play Console, add Tamil as an additional language, then paste from `playstore/listing-ta.md`.
- [ ] Screenshots: use the images in `screenshots/en/` and `screenshots/ta/`. Play requires at least 2 phone screenshots at minimum 320px on the short side — the existing 1280x720 case screenshots in these folders qualify.
- [ ] Feature graphic and hi-res icon: use `playstore/assets/feature-graphic-1024x500.jpg` and `playstore/assets/hi-res-icon-512.png`.
- [ ] Double-check character limits — `playstore/listing-en.md` and `playstore/listing-ta.md` each state the character count under their title, short description, and full description; re-count after any edit to confirm they stay within Play's limits (title ≤30, short description ≤80, full description ≤4000).

## 6. Content rating and Data safety

- [ ] Fill out the Content rating questionnaire using the guidance in `playstore/compliance.md`.
- [ ] Fill out the Data safety form using the same file — it documents exactly what data (none) the app collects.

## 7. App content declarations

- [ ] Privacy policy URL: `https://stalinpusparaj.github.io/saftydetectivegame/privacy.html` (available in English and Tamil).
- [ ] Target audience / Designed for Families: follow the guidance in `playstore/compliance.md`.
- [ ] Ads declaration: this app contains no ads.
- [ ] News app declaration: **No**.
- [ ] COVID-19 contact tracing / status app: **No**.
- [ ] Government app: **No**.

These last four are quick "No" declarations most apps click through in a minute or two.

## 8. Countries and regions

- [ ] Choose availability. Recommended: start with **India plus Worldwide**, or go **Worldwide** from day one — there's no reason to restrict a free, data-free kids' game to one region.

## 9. Review and roll out

- [ ] Submit for review.
- [ ] Budget extra time: Play's automated and human review for a children's app can take longer than a typical app — sometimes **over a week**. Do not expect same-day approval.

## 10. After approval — updates going forward

- [ ] Remember: updating the game content (`index.html` on the live website) needs **no new Android release at all** — the app is a thin wrapper that always loads the live site.
- [ ] A new `.aab` upload is only needed when the **Android app itself** changes — permissions, icon, package ID, or native code.
- [ ] Any new `.aab` must be signed with the **same signing key** and use a **higher `versionCode`** than the previous release.
