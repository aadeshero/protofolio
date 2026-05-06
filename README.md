# 🚀 Aadesh Sangraula — Galaxy Portfolio

A fully-functional, premium personal portfolio website with a futuristic **Galaxy / Space** theme built with pure **HTML5, CSS3, and vanilla JavaScript** — no build tools required.

## ✨ Features

- 🌌 Animated starfield (canvas-based) with twinkling stars & shooting stars
- 🪐 Floating planets with parallax mouse-tracking on the hero
- 💜 Nebula glow blobs with drift animations
- ⌨️ Typing / typewriter animation for roles
- 🎯 Smooth scroll-triggered reveal animations (Intersection Observer)
- 🖱️ Custom glowing cursor (desktop)
- 🔢 Animated stat counters
- 📊 Animated skill progress bars
- 🔭 Orbiting technology icons (pure CSS)
- 🗂️ Project filter by technology category
- 🗓️ Tabbed Education / Experience timeline
- 📬 Contact form with client-side validation
- 📱 Fully responsive — mobile, tablet, desktop
- ⬆️ Back-to-top button
- 🌑 Loading screen with planet animation
- 🔎 SEO-friendly HTML structure

## 📁 Project Structure

```
protofolio/
├── index.html          # Main HTML
├── css/
│   └── style.css       # Full stylesheet (space theme)
├── js/
│   ├── stars.js        # Canvas starfield & shooting stars
│   └── main.js         # All page interactivity
└── assets/
    └── resume.pdf      # (add your resume here)
```

## 🏃 Running Locally

### Option 1 — Open directly (simplest)
```bash
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

### Option 2 — Local dev server (recommended)
```bash
# Python 3
python -m http.server 8080
# visit http://localhost:8080

# Node.js (npx)
npx serve .
# visit http://localhost:3000
```

### Option 3 — VS Code Live Server
Install the **Live Server** extension, right-click `index.html` → *Open with Live Server*.

## 🚀 Deployment

### GitHub Pages
1. Push to a GitHub repository
2. Go to *Settings → Pages → Source: Deploy from branch → main / (root)*
3. Live at `https://<username>.github.io/<repo>/`

### Netlify (drag & drop)
Drag the project folder into [app.netlify.com](https://app.netlify.com/drop).

### Vercel
```bash
npx vercel
```

## 🛠️ Customisation

| What | Where |
|------|-------|
| Name / bio text | `index.html` hero & about sections |
| Typed roles | `js/main.js` → `phrases` array |
| Projects | `index.html` `#projects` section |
| Skill percentages | `index.html` `data-width` attributes |
| Colour palette | `css/style.css` `:root` CSS variables |
| Resume file | Replace `assets/resume.pdf` |
| Social links | `index.html` `#contact` social buttons |

## 📄 License

MIT
