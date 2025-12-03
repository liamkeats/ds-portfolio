# TODO – DS Lite Portfolio

## 🎨 Blender Phase
- [x] Import DS Lite source model into Blender
- [x] Inspect object hierarchy
- [x] Create separate meshes & name:
      - [ ] TopScreen
      - [ ] BottomScreen
      - [x] Button_A
      - [x] Button_B
      - [x] Button_X
      - [x] Button_Y
      - [x] Dpad_Up
      - [x] Dpad_Down
      - [x] Dpad_Left
      - [x] Dpad_Right
      - [ ] Button_Start
      - [ ] Button_Select
- [ ] Remove hidden / backside geometry
- [ ] Apply transforms (Ctrl+A → All Transforms)
- [x] Re-export updated `nintendo_ds_lite_buttons.glb` to `/public` folder

---

## 💻 Three.js Phase
- [x] Initialize scene, camera, renderer
- [x] Add basic lighting (ambient + directional)
- [x] Import DS Lite GLB model
- [x] Position + scale model and center it
- [ ] Add slight idle animation (breathing rotate on dsGroup)
- [x] Setup raycaster for detecting clicks
- [x] Implement interactive elements:
      - [x] Touchscreen plane aligned to bottom screen
      - [x] Top screen overlay plane aligned to top screen
      - [x] D-pad pieces clickable (Up/Down/Left/Right logging to console)
      - [ ] Face buttons (A/B/X/Y) clickable + logging
      - [ ] Start/Select clickable + logging
- [ ] Map button interactions into real behavior:
      - [ ] A = select/confirm
      - [ ] B = back
      - [ ] D-pad = navigate menu on bottom screen
      - [x] Touchscreen = cycle screen state (`home / projects / about / contact` for now)

---

## 📱 Screen UI Phase
- [x] Create bottom screen overlay geometry (Three.js plane)
- [x] Create top screen overlay geometry
- [ ] Replace solid colors with proper DS-style UI
- [ ] Build the following UI “screens”:
      - [ ] Home
      - [ ] Projects (Nova site, Sloclap clone, DS portfolio, etc.)
      - [ ] About
      - [ ] Contact / links
- [ ] Add retro DS UI animations (screen transitions, selection cursor)
- [ ] Add tap/press effects on button click (visual feedback tied to A/B/D-pad)

---

## 🧪 Testing Phase
- [ ] Mobile performance test
- [ ] Responsiveness test (canvas sizing, camera behavior on small screens)
- [ ] Optimize model size
- [ ] Optimize texture resolution
- [ ] Preload model to avoid delay (loading screen / progress bar)

---

## 🚀 Deployment Phase
- [ ] Create `netlify.toml`
- [ ] Push repo to GitHub
- [ ] Connect to Netlify
- [ ] Enable automatic deploys
- [ ] Final polish (colors, camera framing, copy, links)
