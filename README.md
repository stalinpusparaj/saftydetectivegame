# Safety Detective Town · பாதுகாப்பு துப்பறியும் நகரம்

[![Anil the squirrel detective, Inspector Gaja, Constable Vaalu and Nari the Trickster in the Detective Town square](thumbnail.jpg)](https://stalinpusparaj.github.io/saftydetectivegame/)

**▶ Play: https://stalinpusparaj.github.io/saftydetectivegame/**

A bilingual (English + தமிழ்) 3D browser game that helps children aged 4–7 *think* about safety: spot real dangers among safe look-alikes, predict what happens next, ask a grown-up when unsure, rewind a mistake, and call 112.

Best on a phone held sideways, in Chrome. No install, no sign-in, no ads.

## The cases

| # | Case | Place | What the child does |
|---|---|---|---|
| 1 | The Kitchen Clues | Home | Finds 5 hidden hazards among safe look-alikes, then fixes them |
| 2 | Park Patrol | Park | Predicts what happens next, then picks what Vaalu should do instead |
| 3 | Knock Knock, Who's There? | Home (door) | Looks for clues through the peephole, then calls a grown-up |
| 4 | The Video Call Twin | Home (tablet) | Spots a trickster on a video call asking for secrets |
| 5 | Rewind at the Pool | Pool | Rewinds a story and changes one moment to keep everyone safe |
| 6 | Call 112! | Street | Dials 112, answers the operator, and looks around for landmarks |

Cases unlock in order. Before each new case, a short **Daily Patrol** reviews earlier lessons, focusing on the ones the child found hardest.

## Cast

- **Anil** (squirrel), **Minnu** (kitten), **Kanmani** (calf): the child's detective
- **Inspector Gaja**: wise elephant mentor
- **Constable Vaalu**: clumsy monkey sidekick
- **Nari the Trickster**: a sneaky jackal in disguise. His tail always pokes out.

## For grown-ups

Tap ⚙️, hold the hand button for 3 seconds, then answer the sum to open the **Parent corner**. There you can:

- change language, voice, music, sound effects and reduced motion
- set how many cases can be played per session (1–5)
- see what your child is learning, with tips to talk about at home
- reset progress

The game collects no personal data and makes no network requests after it loads. Progress is saved only in this browser on this device.

## Technical notes

- One file: `index.html`. It uses Three.js 0.160.0 from jsDelivr and the Baloo 2 / Baloo Thambi 2 fonts from Google Fonts. Every character and prop is built from code, with no image, model or audio files.
- **Recorded voice-over:** put files at `audio/<lang>/<lineId>.mp3` (for example `audio/ta/intro_kitchen.mp3`), then set `CONFIG.recordedVoice.ta` (or `.en`) to `true` in `index.html`. Until then the game uses the device's text-to-speech, and every line also shows as a caption.
- **Tamil text:** all lines are drafts. A native Tamil speaker who works with young children should review them before release.
- **Developer flags** (only active with `?debug` in the address): `?debug` shows fps and draw calls, `&case=<id>` jumps straight to a case, `&tick` keeps the game running in a hidden tab, and `&nostore` simulates blocked storage.
