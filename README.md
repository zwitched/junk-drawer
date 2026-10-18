# Junk Drawer

Somebody needs something. It's in the junk drawer. Find it.

A portrait mobile game about digging through a kitchen drawer. People leave you notes ("Where's the car key? The one with the black top."), and you dig, shove, untangle and pry things off magnets until you find the right thing. Runs in any modern browser on phone or desktop. No build step, no libraries, every graphic is drawn in code and every sound is synthesized.

## Play it

- Online: https://zwitched.github.io/junk-drawer/ (once Pages is enabled, see below)
- Offline single file: open `dist/index.html` straight from disk. Everything is inlined.
- From the source folder: open `index.html` directly, or serve it:

```
cd junk-drawer
python3 -m http.server 8000
# then open http://localhost:8000 (on your phone: http://<your computer's LAN IP>:8000)
```

Served over http(s) it also installs as an app (manifest + service worker) and works offline after the first visit.

## Controls

| Do this | Touch | Mouse |
|---|---|---|
| Pick something | tap it | click |
| Hand it over | tap it again, press Give, or drag it onto the note | same |
| Move things | drag (fling to slide) | drag |
| Rotate | two-finger twist, or the rotate buttons | mouse wheel while holding, or the buttons |
| Store / bring back | drag into the tray, or the Tray button | same |
| Closer look | hold your finger on it | hold the button down |
| Untangle | tap the knot, or shake the lump while dragging | same |

## Modes

- **Quick Rummage**: 60 seconds, every find adds a few seconds.
- **The Big Cleanout**: 20 handcrafted drawers that introduce one idea at a time. Up to 3 stars each (clear it, beat par, no mistakes). Each one unlocks the next.
- **Bottomless Drawer**: never ends, each request has its own timer, three timeouts and you're done. Wrong picks cost points, never strikes.
- **Daily Drawer**: one drawer per date, the same for everyone (seeded from the date).
- **Just Fiddling**: no clock, no requests.

## Deploy to GitHub Pages

```
git init && git add -A && git commit -m "Junk Drawer"
gh repo create <you>/junk-drawer --public --source=. --push
gh api repos/<you>/junk-drawer/pages -X POST -f "source[branch]=main" -f "source[path]=/"
# wait a minute, then open https://<you>.github.io/junk-drawer/
```

Or in the GitHub UI: Settings, Pages, Source "Deploy from a branch", branch `main`, folder `/ (root)`. Any static host works the same way; upload the folder, or just `dist/index.html`.

## Rebuild the single file

```
python3 build.py      # writes dist/index.html
```

## Tests

Browser tests use Playwright with headless Chromium and real CDP touch events.

```
pip install playwright && python3 -m playwright install chromium
tests/run_all.sh
```

- `test_core.py`: launch, tutorial with real touches, every menu, drag/lift/fling/collisions/stacking, tray, rotate, twist, pause and backgrounding, resize, haptics and audio calls.
- `test_mechanics.py`: fragile, magnets, tangles, mystery requests, combos, false matches, all four disasters, hints, oddities.
- `test_modes.py`: every mode start to finish, stars persisting, challenge unlock order, daily seed reproducibility, achievements, unlocks, settings surviving a reload, reset.
- `test_layout.py`: 320x568, 360x740, 390x844, 430x932, desktop and landscape phone.
- `test_perf.py`: tick and render cost with a crowded drawer.
- `test_bot.py`: a solver bot plays endless rounds and all 20 challenges to prove no drawer can get stuck.
- `test_http.py`: manifest, service worker, offline reload, and the single-file build.
- `shots.py`: regenerates the screenshots in `screenshots/`.

## Files

```
index.html            the page
css/style.css         paper and wood look
js/rng.js             seeded random (mulberry32)
js/art.js, objects.js drawing helpers and the 59 object types
js/sprites.js         cached sprites, shadows and touch masks
js/world.js           physics, stacking, magnets, tangles, disasters
js/levels.js          requests, lookalikes, combos, the 20 challenges
js/audio.js           Web Audio sound effects and music
js/progress.js        save data, achievements, drawer designs, collections
js/scoring.js, render.js, input.js, ui.js, game.js
sw.js, manifest.webmanifest, icon.png, icon-192.png
build.py              makes dist/index.html
```

Progress is saved in localStorage under `junkdrawer.save.v1`. Settings, Reset progress wipes it but keeps your sound settings.
