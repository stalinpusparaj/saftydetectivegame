# Google Play Console Compliance Mapping — Safety Detective Town

This document maps the app's actual behaviour to the two Play Console forms a developer
fills in by hand: **App content** (target audience, content rating, data safety, ads) and
the **Store listing** contact fields. It tells you exactly what to click/select/type. It
does not submit anything — a human must still go into Play Console and do this.

Everything here is derived strictly from the GAME FACTS supplied for this app. Nothing is
invented. Anywhere Play Console's exact wording may differ from what's described below
(Console UI text changes over time), that is flagged explicitly — verify the live screen
before submitting.

---

## Target audience and content

**Console path:** App content → Target audience and content

- **Target age group:** The app is designed for children aged 4-7. In the age-band picker,
  select the band covering ages 5-8. Play's exact age-band options (e.g. "5 and under",
  "6-8", "9-12", etc.) change over time and may not line up exactly with 4-7 — **pick the
  closest match Console actually offers today**, and verify against the live screen rather
  than assuming the bands named here still exist.
- **"This app is designed for children" / mixed audience:** Since the primary audience is
  young children, answer in line with that (select the children's age range(s) that apply;
  do not also select adult-oriented ranges unless Console requires a broader span to
  include the band chosen above).
- **Enrolling in "Designed for Families":** Recommend enrolling. Families Program
  eligibility requires either no ads at all, or ads served only through
  Families-certified ad SDKs. This app has **zero ads** (per GAME FACTS: "no ads"), so it
  qualifies cleanly without needing any certified ad SDK.
  - Caveat: Google's Families Policy Requirements change periodically (e.g. requirements
    around data collection, metadata, or additional declarations). Before submitting,
    the developer must re-check the current **Play Console → Policy → Families Policy
    Requirements** page as the final source of truth — this document only reflects what
    the policy requires as understood today.

---

## Content rating (IARC questionnaire)

**Console path:** App content → Content ratings → fill out the IARC questionnaire

Based strictly on GAME FACTS — the game depicts mild, cartoonish, never-scary hazard
scenarios with no blood or violence, by its own design (hidden-hazard spotting, predicting
outcomes, calling a trusted adult, rewinding a story, practising a 112 call). For every
category below, answer **None / No** on the corresponding IARC question.

| Category | Answer | Reasoning |
|---|---|---|
| Violence | None | No combat, injury, blood, or threatening depictions — cases are about spotting hazards (e.g. a hot stove, a spilled liquid) and predicting safe outcomes, not violence. |
| Sexuality | None | No romantic, sexual, or suggestive content of any kind anywhere in the described cases or characters. |
| Language | None | No profanity, crude humor, or offensive language — dialogue is child-directed safety coaching (Inspector Gaja, Constable Vaalu, Nari the Trickster). |
| Controlled substances | None | No references to drugs, alcohol, tobacco, or any controlled substance in any of the six cases. |
| Gambling | No | No betting, wagering, or simulated gambling mechanics — rewards are stickers/costume pieces and star ratings, not chance-based prizes. |
| User-generated content | No | The app has no feature for users to create, upload, or share content with others — it's a fixed set of six authored cases. |
| Location sharing | No | No location permission is requested and no location data is shared (per GAME FACTS: "no special device permissions... no location"). |
| Personal info sharing | No | No accounts, no sign-in, and no personal information is collected or shared about children or adults. |
| Purchases | No | No in-app purchases exist (per GAME FACTS: "no in-app purchases"). |

---

## Data safety form

**Console path:** App content → Data safety

**Top-of-form summary (state this first, as the one-paragraph overview):**
This app collects and shares **no data at all**, in any category. There are no accounts,
no sign-in, no analytics, no tracking, no ads, and no network transmission of user data.
The only data stored is game progress, which is saved locally on the child's own device and
can be deleted by a parent at any time; it is never transmitted anywhere. The one Android
runtime permission requested (notifications, for an optional local daily reminder) does not
involve any data collection — the reminder is generated and scheduled entirely on-device,
with nothing sent to any server.

For the "Does your app collect or share any of the required user data types?" question,
select **No** (then confirm "Data isn't collected" / "Data isn't shared" for each category
Console walks through, matching the per-category list below).

| Data category | Declaration | Why |
|---|---|---|
| Location | Not collected | No location permission is requested; no location data is read or transmitted. |
| Personal info | Not collected | No accounts, sign-in, names, emails, or other personal identifiers are collected. |
| Financial info | Not collected | No purchases, no payment methods, no financial data of any kind — the app is free with no IAP. |
| Health and fitness | Not collected | The app has no health, fitness, or biometric data collection features. |
| Messages | Not collected | No SMS, email, or in-app messaging features exist. |
| Photos and videos | Not collected | No camera or media-library access is requested or used. |
| Audio files | Not collected | No microphone access is requested; no audio is recorded from the user. |
| Files and docs | Not collected | No file system access beyond the app's own local storage of progress data, which is never transmitted. |
| Calendar | Not collected | No calendar permission is requested or used. |
| Contacts | Not collected | No contacts permission is requested or used. |
| App activity | Not collected | No analytics or in-app behavioral tracking is implemented. |
| Web browsing | Not collected | No browsing history is accessed or collected. |
| App info and performance | Not collected | No crash logs, diagnostics, or performance data are collected or transmitted off-device. |
| Device or other IDs | Not collected | No device identifiers (advertising ID, IMEI, etc.) are read or transmitted. |

**Verify-yourself flag:** the exact category names and sub-questions in the Data safety
form have changed in past Console updates. Confirm the live form still lists these same
categories and wording before final submission.

---

## Ads and in-app purchases declaration

**Console path:** App content → Ads, and the store listing's in-app purchases toggle

- **Contains ads:** **No.** Verified in GAME FACTS: "no ads." There is no ad SDK integrated
  and no ad inventory anywhere in the app.
- **In-app purchases:** **No.** Verified in GAME FACTS: "no in-app purchases." The app is
  free (per GAME FACTS: "Price: Free") with no purchasable content, currency, or
  subscriptions.

---

## Privacy policy field

**Console path:** App content → Privacy policy (and also Store listing)

Paste this exact URL:

```
https://stalinpusparaj.github.io/saftydetectivegame/privacy.html
```

(This is the same privacy policy referenced in GAME FACTS, available in English and Tamil.)

---

## Store listing contact details

**Console path:** Store settings → Store listing contact details (or similar, under App content/Store presence depending on current Console layout)

- **Email:** `gemmyapps@gmail.com`
- **Phone / address:** Not supplied in GAME FACTS. If Console marks these fields optional,
  leave them blank. If Console requires a phone number or physical address to publish, the
  developer must fill in their own real contact details — **do not invent a phone number or
  address**, as none was provided.

---

## General verification note

Play Console's question wording, category lists, and age-band options are updated by
Google periodically. Every section above is the correct mapping based on today's known
Console terminology and the GAME FACTS provided; the developer should still skim the live
form for any renamed field or added question before hitting submit.
