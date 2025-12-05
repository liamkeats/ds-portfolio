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
- [ ] Add slight idle animation (breathing rotate on `dsGroup`)
- [x] Setup raycaster for detecting clicks
- [x] Implement interactive elements:
      - [x] Touchscreen plane aligned to bottom screen
      - [x] Top screen overlay plane aligned to top screen
      - [x] D-pad pieces clickable (Up/Down/Left/Right)
      - [ ] Face buttons (A/B/X/Y) clickable + logging (A/B partially used in UI)
      - [ ] Start/Select clickable + logging
- [x] Map button interactions into real behavior:
      - [x] A = select/confirm (intro start, projects/contact actions)
      - [x] B = back (home + exit contact typing)
      - [x] D-pad = navigate menu / scroll on bottom screen
      - [x] Touchscreen = screen interaction (earlier cycle; can repurpose later)

---

## 🧠 Code Structure & State Machine
- [x] Split logic into `main.js` (3D DS shell) and `ds-ui.js` (screen UI)
- [x] Implement DS state machine:
      - [x] `intro` mode → “Press A to Start”
      - [x] `pages` mode → Home / Projects / About / Contact
- [x] Implement page loop:
      - [x] Home → Projects → About → Contact → Home via D-pad left/right
- [x] Per-page behavior:
      - [x] Projects: Mario-style list, 4 items visible, scroll window (2–3–4–5 etc.)
      - [x] About: scrollable wrapped text with up/down
      - [x] Contact: list of contact methods + fake “typing” sub-screen
- [x] Reset behaviors:
      - [x] About scroll index resets when you leave and come back
      - [x] Contact typing mode resets back to list when leaving

---

## 📱 Screen UI Phase
- [x] Create bottom screen overlay geometry (Three.js plane)
- [x] Create top screen overlay geometry
- [x] Replace solid colors with basic DS-style UI pass:
      - [x] Header bars, page titles, page indicators (Page 2/4, 3/4, 4/4)
      - [x] Boxed list items with gradients and “selected” glow
      - [x] About-page panel with rounded-rect frame
- [x] Build UI “screens” (first pass, content/layout in place):
      - [x] Home (instructions + placeholder avatar / ground)
      - [x] Projects (Nova site, AI Picks bot, DS portfolio, etc.)
      - [x] About (multi-line wrapped text with scroll)
      - [x] Contact / links (GitHub, LinkedIn, email, fake typing screen)
- [ ] Add retro DS UI animations / polish:
      - [x] Basic selection highlight + glowing text on focused items
      - [x] Blinking text on intro screen
      - [ ] Screen transitions (slide / fade / “page flip” between main pages)
      - [ ] Little cursor/icon animations (e.g., arrow bouncing on selected project)
- [ ] Add tap/press effects on button click:
      - [x] 3D button press (mesh squish) when buttons are clicked
      - [ ] 2D tap highlight on the screens (pressed A/B/D-pad indicators)

---

## 🧍 Character Sprite & Animation (Waiting on Artist)
- [ ] Commission DS-style pixel sprite based on me:
      - [ ] Idle loop (breathing / subtle movement)
      - [ ] Walk/run cycle for moving around the screen
      - [ ] Simple jump / fun animation
- [ ] Integrate sprite sheet into `ds-ui.js`:
      - [ ] Load sprite PNG + handle frames in canvas
      - [ ] Replace placeholder avatar on Home screen with final sprite
- [ ] Hook movement into controls:
      - [ ] D-pad moves sprite around the bottom screen
      - [ ] Optional: scripted idle path / little pacing animation on Home
- [ ] Future interactions:
      - [ ] Unique idle animations per page (e.g., reacts differently on Projects vs About)
      - [ ] Stylus “poke” reactions (see Desk & Stylus section)

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

---

## 🪑 Desk & Stylus Environment (Late Game)

### DS on a Desk
- [ ] Add a desk surface under the DS:
      - [ ] Simple plane with wood texture OR a desk GLB
- [ ] Position DS so it sits naturally on the desk (no more void)
- [ ] (Optional later) Add background props:
      - [ ] Notebook
      - [ ] Coffee cup
      - [ ] Pen / sticky notes
- [ ] Ensure lighting/shadows make DS feel grounded on the desk

### Stylus as Interactive Object
- [ ] Create/import a stylus model and place it beside the DS
- [ ] Make stylus clickable via raycasting:
      - [ ] Game state for stylus: `stylusMode = 'idle' | 'pickedUp'`
      - [ ] On click: "pick up" stylus (hide on desk, show as cursor/tip over DS)
      - [ ] On second click or B: "put down" stylus (return to desk position)
- [ ] While stylus is picked up:
      - [ ] Adjust OrbitControls so dragging feels like stylus use (no big camera spins)
      - [ ] Render a stylus cursor / tip aligned with mouse position over DS screen

### Stylus-Based Page Interaction
- [ ] Raycast from camera to bottom screen plane:
      - [ ] Convert hit → UV → DS canvas pixel coordinates
- [ ] For Projects page:
      - [ ] Keep D-pad for selecting a project row
      - [ ] Use stylus drag to scroll project content if it’s taller than one screen
      - [ ] Optional: stylus tap on a row also selects it
- [ ] Per-page stylus behaviors:
      - [ ] Home: stylus can "poke" the sprite or trigger a tiny animation
      - [ ] About: stylus scrolls longer text / cycles facts
      - [ ] Contact: stylus scrolls, taps link regions / QR / buttons
- [ ] Define UX rules:
      - [ ] A = classic DS-style select/open
      - [ ] Stylus = scroll / tap, more “touchscreen-y”
