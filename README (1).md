# Jonah Despain: Senior Capstone

A static, steampunk-themed rebuild of the Google Sites capstone. Plain HTML, CSS and JavaScript, so it runs on GitHub Pages with no build step.

## Files

- `index.html`, `about.html`, `employability.html`, `projects.html`, `future.html`: the five pages
- `style.css`: the theme (charcoal and antique gold, Caveat Brush / Merriweather / Pinyon Script / Cabin fonts)
- `steam.js`: draws the page headers (meshing, spinning gears, a live clock, a globe, pistons, a bar chart) as inline SVG, so there are no header images to host
- `main.js`: menu, sliders, scroll effects, and placeholders for missing images
- `assets/`: put your images here (create this folder)

## Images to add to `assets/`

Until these exist, each spot shows a dashed placeholder with the expected file name.

| File | Used on |
| --- | --- |
| `jonah.jpg` | Home, portrait |
| `letter-1.png`, `letter-2.png` | Employability, letters |
| `mines.jpg`, `cu-boulder.jpg` | Future, college slider |

## Things still to fill in

- **Career presentation** (`future.html`): see the `TODO` comment for how to embed Google Slides.
- **More slides**: the personality test slider (`about.html`) and the astronomer slides (`projects.html`) each have one slide. The `TODO` comments show how to add more. Dots and arrows appear automatically once a slider has two or more slides.
- **Your original header art**: if you'd rather use the AI-made header images from the Google Site, save them into `assets/` and set them as the `.banner` background in `style.css`.

## Deploy on GitHub Pages

1. Create a new repository on GitHub (for example `capstone`).
2. Upload all files in this folder, including `assets/`, to the repository's main branch.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to "Deploy from a branch", choose `main` and `/ (root)`, then save.
5. After a minute or two the site is live at `https://<your-username>.github.io/<repo-name>/`.

## Before you publish

GitHub Pages sites are public. The phone number from your résumé was left off on purpose; add it back in `employability.html` only if you want it public. Check that your letters and email address are fine for anyone to see.
