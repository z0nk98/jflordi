# Judy Dinaga — portfolio

A fast, accessible, recruiter- and ATS-friendly portfolio. No build step and no dependencies.

Two portfolios share one stylesheet and script, so you can send each employer the version that fits the job.

| Portfolio | Page | ATS resume (Save as PDF) | Theme |
|---|---|---|---|
| PeopleSoft & Oracle Application Support | `index.html` | `resume.html` | Indigo |
| Virtual Assistant | `va.html` | `va-resume.html` | Teal |

| Shared file | What it is |
|---|---|
| `css/style.css` | Styles for both. `data-variant="va"` on `<html>` switches to the teal theme. |
| `js/main.js` | Enhancements for both: theme toggle, quick-jump palette, scroll-spy, copy buttons. |
| `js/va.js` | VA-only: live Cebu clock and the "Build your support plan" tool. |

All content is plain HTML, so ATS parsers and search engines read it without JavaScript.

## Updating content

1. Edit the text in the portfolio page, then make the same change in its resume page (`index.html` ↔ `resume.html`, `va.html` ↔ `va-resume.html`).
2. If your title, certifications or skills change, update the JSON-LD block and the `<title>`/`<meta>` tags in that page.
3. Skill cards carry `data-tags` (`tech`, `process`, `tools`) that drive the highlight buttons above them.

## Features

- **Easy to navigate:** sticky nav that highlights the current section, a mobile menu, and a quick-jump palette (press `Ctrl/⌘ + K` or `/`)
- **Interactive:** dark/light mode, skill-area highlights, animated stats, reveal-on-scroll, one-click copy email
- **ATS & SEO:** semantic headings, schema.org `Person` data, a plain-text resume page, and a clean print stylesheet
- **Accessible:** skip link, keyboard support, visible focus, `prefers-reduced-motion` respected, WCAG-friendly contrast

## Preview & deploy

```sh
python3 -m http.server 8000   # then visit http://localhost:8000
```

Live at **https://z0nk98.github.io/jflordi/** (application support) and **https://z0nk98.github.io/jflordi/va.html** (virtual assistant). Pushing to `main` updates the site within a minute or two.

Hosted with GitHub Pages from the root of the `main` branch.
