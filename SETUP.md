# Layali website: setup notes

The website is the `site/` folder. Upload only that folder when you publish.

## Placeholders to replace

| What | Where |
| --- | --- |
| WhatsApp number | `site/script.js`, `CONFIG.whatsapp` (e.g. `2547XXXXXXXX`), and the number shown in `site/index.html` under "Come say hi" |
| Instagram handle | Now set to **@cafelayali.ke** (seen tagged in the café's photos). Confirm it's right; it's in `site/index.html`, search for `cafelayali` |
| Founder's story | `site/index.html`, the "STORY" section |
| Sample sticky notes | `site/script.js`, `SAMPLE_NOTES` |
| Game prize | `site/script.js`, `CONFIG.gamePrize`. **Check with the café before going live.** Set it to `""` to hide the prize line |
| Share-preview image address | `site/index.html`, `og:image`. Once the site has a domain, change it to the full address (e.g. `https://yourdomain/og-image.jpg`) so WhatsApp shows the preview |

## After editing the CSS or JavaScript

In `site/index.html`, bump the version number on `styles.css?v=3` and `script.js?v=3` (to `v=4` and so on). Otherwise returning visitors may keep an old cached copy.

## Making sticky notes shared (Firebase, free)

Until this is done, each visitor only sees their own notes plus the samples.

1. Go to https://console.firebase.google.com and sign in with the café's Google account.
2. **Add project**, name it `layali`, and turn off Google Analytics (you don't need it).
3. **Build → Firestore Database → Create database**. Pick a location near Kenya (e.g. `europe-west`), then start in **production mode**.
4. Open the **Rules** tab, paste in everything from `firestore.rules` in this folder, and click **Publish**.
5. Click the gear icon, then **Project settings → Your apps → Web (`</>`)**, and register an app called `layali-site`.
6. Copy the `firebaseConfig = { ... }` object it shows you. In `site/script.js`, replace
   `const FIREBASE_CONFIG = null;` with
   `const FIREBASE_CONFIG = { apiKey: "...", authDomain: "...", projectId: "...", ... };`

   These keys are safe to publish. The rules in step 4 are what protect the data.

The same Firebase setup also turns on the shared weekly **game scoreboard**. Until then, scores are kept on each visitor's own device.

**Handing out the weekly prize:** scores can be faked by someone who knows how. The rules reject impossible scores, but before giving away a free Scud, ask the winner to show the score on their phone at the counter.

**Removing a rude note or name:** for notes, go to Firebase console → Firestore Database → `notes`. For scores, go to `scores` → the week → `entries`. Then delete the entry.

The website blocks some swear words and only lets each visitor post one note every 30 seconds, but it can't catch everything.

## Previewing locally

```bash
python .claude/serve.py
```

Then open http://localhost:5173.
