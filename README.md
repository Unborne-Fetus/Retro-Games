# Retro Games Arcade

A browser-based collection of original retro/arcade-inspired games. No installation, build tools, account, or server is required.

## Play
Open `index.html` in a modern browser, or use GitHub Pages after enabling **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Included games
- Star Defender — arcade space shooter
- Pixel Invaders — formation-based alien shooter
- Maze Munch — pellet-collecting maze chase
- Neon Breakout — paddle and bricks
- Pixel Snake — growing snake survival

Use arrow keys or WASD. Press Space to fire in the shooters. Mobile/touch controls are available.

## Add your own games
Press **+ Add Game**, provide a title, and select a standalone `.html` file. Imported games are stored locally in the browser using localStorage, and run inside a sandboxed iframe. Browser storage can be cleared by the browser and imported games are not synced between users/devices. For larger games and permanent public contributions, add files to the repository via pull request instead.

Use only games you trust and have the right to distribute. The built-in games use original minimalist graphics and are inspired by arcade genres, not official copyrighted arcade ROMs.

## Hosting
The GitHub Actions workflow deploys the static site to GitHub Pages if GitHub Pages is configured to use Actions.
