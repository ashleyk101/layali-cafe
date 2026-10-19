# Layali · ليالي

Website for **Layali**, a neighbourhood café at Magharibi Place, South C, Nairobi.

It's a single-page static site (plain HTML, CSS and JavaScript, no build step) with:

- The full drinks and eats menu, with WhatsApp ordering (currently switched off)
- Hand-drawn, vintage-sketch illustrations of the signature drinks, plus real photos from the café
- Backlit sandstone panels and a day/night lantern mode with tonight's real moon phase
- A drink finder quiz, a sticky-note door visitors can write on, and the *Build the Scud* mini game with a weekly scoreboard
- A calligraphy intro animation that plays once per visit

## Project layout

```
site/                 ← the website (this is the folder to publish)
  index.html          page markup + SVG illustration sprite
  styles.css          styles, themes, animations
  script.js           menu data, ordering, quiz, notes, game, night sky
  images/             cropped, web-sized photos
  favicon.svg, apple-touch-icon.png, og-image.jpg
firestore.rules       Firebase rules for shared notes + scoreboard
SETUP.md              placeholders to fill in, Firebase + go-live steps
.claude/serve.py      small local preview server
```

## Preview locally

```bash
python .claude/serve.py
```

Then open http://localhost:5173. You can also just open `site/index.html` in a browser.

## Before going live

See [SETUP.md](SETUP.md) for the placeholders to fill in: the WhatsApp number (ordering is off until it's set), the founder's story, the Firebase config for shared notes and scores, and the share-image address.

## Publishing

Upload the `site/` folder to any static host (Netlify, GitHub Pages, Cloudflare Pages). There's no build step.
