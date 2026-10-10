# Retro Games Arcade

A Windows desktop and web collection of 261 playable arcade-inspired games.

## Games

The app includes **261 launchable entries: 13 initial mini-games, 48 additional arcade mini-games, and 200 themed variants** of eight shared gameplay engines. These are not 261 distinct commercial-quality game engines or full ports of the named games.
Galaga, Space Invaders, Pac-Man, Breakout, Snake, Pong, Asteroids, Tetris, Frogger, Flappy Bird, 2048, Missile Command, Out Run, Doodle Jump, Crossy Road, Temple Run, Subway Surfers, Fruit Ninja, Donkey Kong, Super Mario Bros., 1942, Xevious, Arkanoid, Simon, and many more.



These are unofficial, simplified independent implementations, **not** original arcade ROMs or licensed commercial releases.

## Get Windows EXE
Go to [Actions → Build Windows EXE](https://github.com/Unborne-Fetus/Retro-Games/actions/workflows/windows.yml). Open a successful run, then download the **Retro-Games-Windows-EXE** artifact. It includes the installer and a portable version.

To build on Windows using Node.js:

```powershell
npm install
npm run build:win
```

Output goes to `dist/`. To run in development, use `npm start`.

## Web version
Open `index.html` in a browser, or enable GitHub Pages (Settings → Pages → GitHub Actions).

## Add your own games
Click **+ Add Game**, then select a self-contained HTML game (under 1.5 MB). Imported games run in a sandboxed iframe, and are stored locally within the app/browser. Imports are **not** shared with other users and can be lost if app/browser storage is cleared. Only import games you trust and have permission to use.

Permanent game additions can be contributed as pull requests.

## Galaga improvements
Galaga now uses a dedicated enhanced fixed-screen shooter engine with original pixel-art fighters and enemy sprites, entering formations, bees/butterflies/two-hit commanders, looping dives, enemy projectiles, tractor beams, fighter capture and rescue, dual ships, bonus challenge stages, stage progression, hit-rate display, explosions, and locally saved high scores. It is a fan-inspired recreation rather than an asset-for-asset port of the original.

## First 50 gameplay/visual overhaul
The first **50** library entries now use improved dedicated or specialized arcade engines and original procedural cover artwork, with extra mechanics across the collection. Galaga has formations, dives, commanders, tractor beams, dual-fighter rescue, bonus stages, rapid-fire and shield pick-ups; Space Invaders has destructible bunkers, timed invader attacks, bonus UFO and waves; Pac-Man has power pellets, ghost behavior, fruits and stage progression. The other classics gain arcade effects and features (power-ups in Breakout, hold in Tetris, bonus food in Snake, etc.). The first 37 additional entries now have more elaborate themed platforming, crossing, running, shooting, paddle and collecting systems, with Fruit Ninja-inspired swipe controls and Donkey Kong-inspired ladder/barrel gameplay.

**These are original, simplified arcade-inspired implementations**, not carbon copies, licensed games or extracted commercial game sprites/audio. Many titles still share engines. Real-device playtesting and arcade accuracy are ongoing work.

## Automated testing
Run `npm run test:smoke` to check all 50 targeted games start and step through simulation, verify the full catalog, and ensure every loaded JavaScript file is included in the Windows executable configuration.
