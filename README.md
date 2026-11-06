# Steady website

A small static site for **Steady: Daily Spending**: no build step, no libraries, no tracking.

| File | Page |
| --- | --- |
| `index.html` | Home: live phone demo, features, how it works, a "Try it" calculator, privacy, FAQ, App Store and Google Play buttons |
| `privacy.html` | Privacy policy (same text as `docs/privacy-policy.md`). Use this URL for the stores' **Privacy Policy URL** |
| `support.html` | Contact email and help. Use this URL for the App Store's **Support URL** |
| `main.js` | Animations: scroll reveals, counters, the phone demo, the calculator and the privacy page's contents highlight. The site still works without it, and it respects "reduce motion" |
| `styles.css` | Shared styles, using the app's colours and fonts (light and dark mode) |
| `assets/` | App icon, favicon and the two fonts (with their OFL licences) |

## Before going live: the App Store link

The Google Play link already uses the package name (`app.dailynumber.steady`) and works once the app is published.

The App Store link needs the app's **Apple ID** number:

1. Open App Store Connect › your app › **App Information**.
2. Copy the **Apple ID** (a number like `6739123456`).
3. In `index.html`, replace both `APP_STORE_ID` with it, for example `https://apps.apple.com/app/id6739123456`.

## Preview

Open `index.html` in a browser, or run a local server from this folder:

```bash
python3 -m http.server 8000
```

Then go to http://localhost:8000.

## Publish (free)

- **Netlify Drop:** go to app.netlify.com/drop and drag this `website` folder onto the page. You get a URL straight away.
- **GitHub Pages:** the repo is public, so you can publish this folder with a GitHub Actions "Static HTML" Pages workflow (path: `website`).
- **Cloudflare Pages:** create a project from the repo with the build output directory set to `website`.
# Steady-Daily-Spending
