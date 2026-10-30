# IQRA VOCAB

A vocabulary-learning web app for GRE and English learners, with Bengali support. It covers Word Smart, Barron's, Magoosh, Manhattan, 501 Sentence Completion and GRE Analogy, with flashcards, quizzes, review, worksheets, certificates and progress tracking.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app (single file, includes all word data) |
| `sw.js` | Service worker: fast repeat opens and offline use |
| `manifest.webmanifest`, `icon-*.png`, `apple-touch-icon.png` | Install-to-home-screen support |
| `firebase-messaging-sw.js` | Push notifications |
| `LICENSE`, `robots.txt`, `sitemap.xml` | Licence and search-engine files |
| `404.html` | Friendly page for broken links |
| `og-image.png` | Preview image when the link is shared |
| `privacy.html`, `terms.html` | Legal pages |
| `capacitor.config.json`, `package.json`, `desktop/` | Android and desktop builds |

## Updating the app

1. Replace `index.html` with the new version.
2. If users must get it right away, change `VERSION` in `sw.js` (for example `iq-v1` to `iq-v2`).
3. Commit. Cloudflare Pages (iqravocab.pages.dev) publishes it in a minute or two.

## Notes

- The service worker works only over https or localhost.
- Cloudflare Pages allows 25 MiB per file. `index.html` must stay below that (the Validate workflow checks it).
- Do not commit private keys or `node_modules`.
