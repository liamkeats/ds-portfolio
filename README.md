# Nintendo DS Lite Portfolio

A fully interactive 3D Nintendo DS Lite portfolio website built using:
- Three.js (3D rendering + interactions)
- HTML/CSS (screen overlays)
- Netlify (deployment + hosting)
- Blender (model cleanup + optimization)

The top DS screen displays animated visuals or project previews.
The bottom DS screen functions as a touchscreen-style navigation UI
(Home, Projects, About, Contact).

This project is designed as a creative developer portfolio showcase.

---

## 🚀 Features (Planned)
- ✔ Load & render a DS Lite .glb model
- ✔ Custom lighting, camera setup, and materials
- ✔ Interactive buttons (A/B, D-pad, Start/Select)
- ✔ Clickable touchscreen with animated menu transitions
- ✔ Swappable HTML content inside the bottom screen
- ✔ Project previews and demos inside the top screen
- ✔ Boot animation (DS startup)

---

## 🧰 Tech Stack
- **Three.js** – WebGL rendering
- **GSAP** – Optional animations
- **HTML/CSS** – Screen UI
- **JavaScript/ES Modules**
- **Blender** – Model optimization
- **Netlify** – Hosting & CI/CD

---

## 📦 Folder Structure
public/ → 3D models, textures
src/js/ → main JavaScript logic (Three.js)
src/css/ → animations + layout
src/html/ → content for DS bottom screen
netlify.toml → build and deploy config
index.html → app entry point


---

## 🔧 Setup & Development

1. Clone the repo:
- git clone
- cd ds-portfolio
2. Run a local web server (Three.js requires one):
- npx serve
```nginx
OR
```
- python3 -m http.server

3. Open in the browser:
- http://localhost:5000

---

## 🚀 Deployment (Netlify)
Push your repo → Netlify automatically deploys.

Or drag the entire project folder into Netlify Drop.

`netlify.toml` ensures proper settings.

---

## 📝 License
MIT License – free to modify however you want.
