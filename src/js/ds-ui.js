// src/js/ds-ui.js
// All DS screen UI: state, drawing, and button behavior

import * as THREE from 'three';

// ----------------------
// DS SCREEN SETUP
// ----------------------

export const DS_SCREEN_WIDTH = 256;
export const DS_SCREEN_HEIGHT = 192;

function createScreenCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;

  return { canvas, ctx, texture };
}

export let bottomScreenCanvas, bottomScreenCtx, bottomScreenTexture;
export let topScreenCanvas, topScreenCtx, topScreenTexture;

// create both screens up front
({
  canvas: bottomScreenCanvas,
  ctx: bottomScreenCtx,
  texture: bottomScreenTexture,
} = createScreenCanvas(DS_SCREEN_WIDTH, DS_SCREEN_HEIGHT));

({
  canvas: topScreenCanvas,
  ctx: topScreenCtx,
  texture: topScreenTexture,
} = createScreenCanvas(DS_SCREEN_WIDTH, DS_SCREEN_HEIGHT));

// ----------------------
// UI STATE: MODES & PAGES
// ----------------------

// mode:
//  - 'intro'  = Press A to Start (screen 1)
//  - 'pages'  = Home / Projects / About / Contact (screens 2–5)
let mode = 'intro';

// Order of main pages in "pages" mode
const PAGES = ['home', 'projects', 'about', 'contact']; // 2,3,4,5
let currentPageIndex = 0; // 0 = home (sprite/instructions screen)

// ----------------------
// PROJECTS PAGE STATE
// ----------------------

const PROJECT_ITEMS = [
  {
    id: 'nova',
    label: 'Nova Detailing',
    subtitle: 'Custom detailing website',
  },
  {
    id: 'ai-picks',
    label: 'AI Picks Bot',
    subtitle: 'Discord bot + sports data',
  },
  {
    id: 'ds-portfolio',
    label: 'DS Portfolio',
    subtitle: 'This playable homepage',
  },
  {
    id: 'sloclap',
    label: 'Sloclap Landing',
    subtitle: 'Game studio landing page concept',
  },
  {
    id: 'library',
    label: 'Mini Library System',
    subtitle: 'C project with file storage',
  },
  {
    id: 'ems',
    label: 'Employee Management',
    subtitle: 'Console CRUD system in C',
  },
  {
    id: 'more',
    label: 'More Coming Soon',
    subtitle: 'Room for future projects',
  },
];

// Darker Mario-ish bar colors
const PROJECT_BOX_COLORS = [
  '#1f5f2a', // dark green
  '#18416f', // dark blue
  '#8b5a1e', // dark orange/brown
  '#36226d', // dark purple
  '#2f4f4f', // dark teal/grey
  '#5c3a5e', // plum
  '#3d3d3d', // dark grey
];

const PROJECT_VISIBLE_ROWS = 4;   // how many boxes visible at once
let projectItemIndex = 0;         // which project is selected
let projectViewportStart = 0;     // index of the first visible project

// ----------------------
// ABOUT PAGE STATE
// ----------------------

const ABOUT_TEXT_LINES = [
  "I'm Liam, a CS student and builder from Nova Scotia.",
  "I like making interactive web experiences, tools,",
  "and little toys like this DS portfolio.",
  "",
  "Right now I'm especially into:",
  "• Web dev (React / Astro / Three.js)",
  "• Data & sports analytics projects",
  "• Automation & bots (Discord, scripts, etc.)",
  "",
  "Outside of code I'm running Nova Detailing –",
  "a mobile detailing business – and learning how",
  "to make tech that actually supports real work.",
  "",
  "This page is just a small summary. The Projects",
  "page goes deeper into some of the things I'm",
  "building and experimenting with.",
];

const ABOUT_VISIBLE_LINES = 7; // how many lines fit in the panel
let aboutScrollIndex = 0;      // first visible line index
let ABOUT_WRAPPED_LINES = [];
let ABOUT_MAX_START = 0;

// ----------------------
// CONTACT PAGE STATE
// ----------------------

const CONTACT_ITEMS = [
  {
    id: 'github',
    label: 'GitHub',
    value: 'github.com/liamkeats',
    detail: 'Code, projects, and experiments.',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    value: 'linkedin.com/in/liam-keats',
    detail: 'Professional profile & updates.',
  },
  {
    id: 'email',
    label: 'Email',
    value: 'keatsliam@gmail.com',
    detail: 'Reach out directly via email.',
  },
  {
    id: 'message',
    label: 'Send a Message',
    value: 'Write a little pixel note',
    detail: 'Opens a fake DS-style typing screen.',
  },
];

let contactItemIndex = 0;          // which contact option is selected
let contactSubmode = 'list';       // 'list' | 'typing'

// ----------------------
// HELPERS
// ----------------------

function drawRoundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawPixelAvatar(ctx, x, y, scale) {
  // Tiny 5x7 "Liam" sprite
  const sprite = [
    ' 11 ',
    '1111',
    ' 11 ',
    ' 11 ',
    '1  1',
    '1  1',
    '11 11',
  ];

  ctx.fillStyle = '#f4e0b8';

  for (let row = 0; row < sprite.length; row++) {
    const line = sprite[row];
    for (let col = 0; col < line.length; col++) {
      if (line[col] !== ' ') {
        ctx.fillRect(
          x + col * scale,
          y + row * scale,
          scale,
          scale
        );
      }
    }
  }
}

function lightenColor(hex, amount) {
  const col = parseInt(hex.slice(1), 16);
  let r = (col >> 16) & 0xff;
  let g = (col >> 8) & 0xff;
  let b = col & 0xff;

  r = Math.min(255, Math.floor(r + 255 * amount));
  g = Math.min(255, Math.floor(g + 255 * amount));
  b = Math.min(255, Math.floor(b + 255 * amount));

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function darkenColor(hex, amount) {
  const col = parseInt(hex.slice(1), 16);
  let r = (col >> 16) & 0xff;
  let g = (col >> 8) & 0xff;
  let b = col & 0xff;

  r = Math.max(0, Math.floor(r * (1 - amount)));
  g = Math.max(0, Math.floor(g * (1 - amount)));
  b = Math.max(0, Math.floor(b * (1 - amount)));

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function computeAboutWrappedLines() {
  if (!bottomScreenCtx || !bottomScreenCanvas) return;

  const ctx = bottomScreenCtx;

  const panelX = 10;
  const panelW = bottomScreenCanvas.width - panelX * 2;
  const maxTextWidth = panelW - 16; // padding inside the panel

  ctx.font = '10px monospace';
  const lines = [];

  ABOUT_TEXT_LINES.forEach((line) => {
    if (line.trim() === '') {
      lines.push('');
      return;
    }

    const words = line.split(' ');
    let current = '';

    words.forEach((word) => {
      const test = current ? current + ' ' + word : word;
      if (ctx.measureText(test).width > maxTextWidth) {
        if (current) lines.push(current);
        current = word;
      } else {
        current = test;
      }
    });

    if (current) lines.push(current);
  });

  ABOUT_WRAPPED_LINES = lines;
  ABOUT_MAX_START = Math.max(0, ABOUT_WRAPPED_LINES.length - ABOUT_VISIBLE_LINES);

  if (aboutScrollIndex > ABOUT_MAX_START) {
    aboutScrollIndex = ABOUT_MAX_START;
  }
}

// ----------------------
// INTRO SCREEN
// ----------------------

function drawIntroScreen(time = 0) {
  if (!bottomScreenCtx || !bottomScreenCanvas || !topScreenCtx || !topScreenCanvas) return;

  const ctxT = topScreenCtx;
  const ctxB = bottomScreenCtx;

  ctxT.imageSmoothingEnabled = false;
  ctxB.imageSmoothingEnabled = false;

  // Top screen: title
  ctxT.fillStyle = '#050816';
  ctxT.fillRect(0, 0, topScreenCanvas.width, topScreenCanvas.height);

  ctxT.textAlign = 'center';
  ctxT.textBaseline = 'top';

  ctxT.fillStyle = '#ffffff';
  ctxT.font = '16px monospace';
  ctxT.fillText('Liam Keats', topScreenCanvas.width / 2, 24);

  ctxT.font = '12px monospace';
  ctxT.fillStyle = '#a0d0ff';
  ctxT.fillText('DS Portfolio', topScreenCanvas.width / 2, 48);

  ctxT.font = '10px monospace';
  ctxT.fillStyle = '#8088c0';
  ctxT.fillText('A little playable homepage', topScreenCanvas.width / 2, 70);

  // Bottom screen: blinking "Press A"
  ctxB.fillStyle = '#000810';
  ctxB.fillRect(0, 0, bottomScreenCanvas.width, bottomScreenCanvas.height);

  const blinkOn = Math.floor(time / 500) % 2 === 0;

  ctxB.textAlign = 'center';
  ctxB.textBaseline = 'middle';

  if (blinkOn) {
    ctxB.fillStyle = '#ffffff';
    ctxB.font = '14px monospace';
    ctxB.fillText(
      'Press A to Start',
      bottomScreenCanvas.width / 2,
      bottomScreenCanvas.height / 2
    );
  }

  ctxB.font = '10px monospace';
  ctxB.fillStyle = '#606880';
  ctxB.fillText(
    'Use D-Pad + A / B to explore',
    bottomScreenCanvas.width / 2,
    bottomScreenCanvas.height - 16
  );

  ctxT.textAlign = 'left';
  ctxB.textAlign = 'left';

  bottomScreenTexture.needsUpdate = true;
  topScreenTexture.needsUpdate = true;
}

// ----------------------
// LIAM SPRITE (HOME PAGE)
// ----------------------
//
// Codes:
//   ' ' = transparent
//   C   = cap
//   H   = hair
//   S   = skin
//   E   = eyes / eye line
//   M   = moustache
//   B   = dark jacket/shirt

const LIAM_PALETTE = {
  'C': '#202530',  // dark cap
  'H': '#d29a5a',  // ginger/blond hair
  'S': '#f4d0b8',  // skin
  'E': '#202020',  // eye line
  'M': '#c06a3a',  // moustache
  'B': '#1a1a1a',  // dark jacket/shirt
  ' ': null,
};

// 9×12-ish front-facing sprite with cap + moustache
const LIAM_SPRITE_IDLE = [
  '  CCCCC  ', // cap brim
  ' CCCCCCC ', // cap top
  ' CHHHHHC ', // hair under cap
  ' HSSSSSH ', // face + cheeks
  ' HSE ESH ', // eyes
  ' HSSMSSH ', // moustache row
  '  SSSS   ', // chin
  '  BBBB   ', // upper torso
  ' BBBBBB  ', // jacket
  ' BBBBBB  ',
  '  BB BB  ', // legs
  '  BB BB  ',
];

const LIAM_SPRITE_BLINK = [
  '  CCCCC  ',
  ' CCCCCCC ',
  ' CHHHHHC ',
  ' HSSSSSH ',
  ' HEE EEH ', // eyes closed line
  ' HSSMSSH ',
  '  SSSS   ',
  '  BBBB   ',
  ' BBBBBB  ',
  ' BBBBBB  ',
  '  BB BB  ',
  '  BB BB  ',
];

function drawLiamSprite(ctx, x, y, scale, frame) {
  for (let row = 0; row < frame.length; row++) {
    const line = frame[row];
    for (let col = 0; col < line.length; col++) {
      const ch = line[col];
      const color = LIAM_PALETTE[ch];
      if (!color) continue;

      ctx.fillStyle = color;
      ctx.fillRect(
        x + col * scale,
        y + row * scale,
        scale,
        scale
      );
    }
  }
}


// ----------------------
// HOME PAGE
// ----------------------
function drawHomePage(time = 0) {
  if (!bottomScreenCtx || !bottomScreenCanvas || !topScreenCtx || !topScreenCanvas) return;

  const ctxT = topScreenCtx;
  const ctxB = bottomScreenCtx;

  ctxT.imageSmoothingEnabled = false;
  ctxB.imageSmoothingEnabled = false;

  // Top: instructions
  ctxT.fillStyle = '#000810';
  ctxT.fillRect(0, 0, topScreenCanvas.width, topScreenCanvas.height);

  ctxT.fillStyle = '#ffffff';
  ctxT.font = '14px monospace';
  ctxT.textBaseline = 'top';
  ctxT.fillText('Home', 12, 12);

  ctxT.font = '10px monospace';
  ctxT.fillStyle = '#c0c8ff';
  ctxT.fillText('• This is the main screen.', 12, 32);
  ctxT.fillText('• D-Pad ←/→ to browse pages.', 12, 44);
  ctxT.fillText('• Home → Projects → About → Contact → Home', 12, 56);

  // Bottom: simple ground + animated Liam sprite
  ctxB.fillStyle = '#050516';
  ctxB.fillRect(0, 0, bottomScreenCanvas.width, bottomScreenCanvas.height);

  ctxB.fillStyle = '#101830';
  const groundHeight = 40;
  ctxB.fillRect(
    0,
    bottomScreenCanvas.height - groundHeight,
    bottomScreenCanvas.width,
    groundHeight
  );

  // --- Animation timing ---
  const bob = Math.sin(time * 0.003) * 2;      // gentle up/down
  const blinkPhase = time % 4000;              // 4s cycle
  const isBlink = blinkPhase < 120;            // blink for ~120ms

  const spriteFrame = isBlink ? LIAM_SPRITE_BLINK : LIAM_SPRITE_IDLE;

  const scale = 3; // pixel size
  const spriteWidth = spriteFrame[0].length * scale;
  const spriteHeight = spriteFrame.length * scale;

  const avatarX = (bottomScreenCanvas.width - spriteWidth) / 2;
  const baseY = bottomScreenCanvas.height - groundHeight - spriteHeight - 4;
  const avatarY = baseY + bob;

  drawLiamSprite(ctxB, avatarX, avatarY, scale, spriteFrame);

  ctxB.textAlign = 'center';
  ctxB.textBaseline = 'bottom';
  ctxB.fillStyle = '#a0d0ff';
  ctxB.font = '10px monospace';
  ctxB.fillText('Liam.exe', bottomScreenCanvas.width / 2, avatarY - 6);

  ctxB.textAlign = 'left';

  bottomScreenTexture.needsUpdate = true;
  topScreenTexture.needsUpdate = true;
}


// ----------------------
// PROJECTS PAGE
// ----------------------

function drawProjectsPage() {
  if (!bottomScreenCtx || !bottomScreenCanvas || !topScreenCtx || !topScreenCanvas) return;

  const ctxT = topScreenCtx;
  const ctxB = bottomScreenCtx;

  ctxT.imageSmoothingEnabled = false;
  ctxB.imageSmoothingEnabled = false;

  const selected = PROJECT_ITEMS[projectItemIndex];

  // Top screen
  ctxT.fillStyle = '#000810';
  ctxT.fillRect(0, 0, topScreenCanvas.width, topScreenCanvas.height);

  ctxT.fillStyle = '#ffffff';
  ctxT.font = '14px monospace';
  ctxT.textBaseline = 'top';
  ctxT.fillText('Projects', 12, 12);

  ctxT.font = '11px monospace';
  ctxT.fillStyle = '#a0d0ff';
  ctxT.fillText(selected.label, 12, 32);

  ctxT.font = '10px monospace';
  ctxT.fillStyle = '#c0c8ff';
  ctxT.fillText(selected.subtitle, 12, 46);

  ctxT.fillText('↑/↓: select project, A: view (later)', 12, 68);
  ctxT.fillText('←/→: switch to Home / About / Contact', 12, 80);

  // Bottom screen
  ctxB.fillStyle = '#050816';
  ctxB.fillRect(0, 0, bottomScreenCanvas.width, bottomScreenCanvas.height);

  ctxB.fillStyle = '#192447';
  ctxB.fillRect(0, 0, bottomScreenCanvas.width, 24);

  ctxB.fillStyle = '#f5f7ff';
  ctxB.font = '11px monospace';
  ctxB.textBaseline = 'middle';
  ctxB.fillText('Select a Project', 10, 12);

  ctxB.textAlign = 'right';
  ctxB.fillText('Page 2 / 4', bottomScreenCanvas.width - 10, 12);
  ctxB.textAlign = 'left';

  const boxX = 18;
  const boxW = bottomScreenCanvas.width - boxX * 2;
  const boxH = 26;
  const firstY = 36;
  const gapY = 4;
  const radius = 6;

  const visibleStart = projectViewportStart;
  const visibleEnd = Math.min(
    PROJECT_ITEMS.length,
    visibleStart + PROJECT_VISIBLE_ROWS
  );

  let row = 0;
  for (let idx = visibleStart; idx < visibleEnd; idx++, row++) {
    const item = PROJECT_ITEMS[idx];
    const y = firstY + row * (boxH + gapY);
    const isSelected = idx === projectItemIndex;
    const baseColor = PROJECT_BOX_COLORS[idx % PROJECT_BOX_COLORS.length];

    const shadowOffset = 2;
    ctxB.fillStyle = 'rgba(0,0,0,0.5)';
    drawRoundedRect(ctxB, boxX, y + shadowOffset, boxW, boxH, radius);
    ctxB.fill();

    const grad = ctxB.createLinearGradient(0, y, 0, y + boxH);
    if (isSelected) {
      grad.addColorStop(0, lightenColor(baseColor, 0.15));
      grad.addColorStop(1, darkenColor(baseColor, 0.15));
    } else {
      grad.addColorStop(0, lightenColor(baseColor, 0.05));
      grad.addColorStop(1, darkenColor(baseColor, 0.25));
    }

    ctxB.fillStyle = grad;
    drawRoundedRect(ctxB, boxX, y, boxW, boxH, radius);
    ctxB.fill();

    ctxB.strokeStyle = isSelected ? '#ffffff' : '#101521';
    ctxB.lineWidth = isSelected ? 2 : 1;
    drawRoundedRect(ctxB, boxX + 0.5, y + 0.5, boxW - 1, boxH - 1, radius);
    ctxB.stroke();

    const textX = boxX + 14;
    const textY = y + boxH / 2 + 1;

    ctxB.font = '11px monospace';
    ctxB.textBaseline = 'middle';

    if (isSelected) {
      ctxB.save();
      ctxB.shadowColor = '#e6ffb0';
      ctxB.shadowBlur = 10;
      ctxB.fillStyle = '#ffffff';
      ctxB.fillText(item.label, textX, textY);
      ctxB.restore();
    } else {
      ctxB.fillStyle = '#f0f0f0';
      ctxB.fillText(item.label, textX, textY);
    }
  }

  // Scroll arrows
  ctxB.font = '10px monospace';
  ctxB.fillStyle = '#7080a0';
  ctxB.textBaseline = 'middle';

  if (projectViewportStart > 0) {
    ctxB.fillText('▲', bottomScreenCanvas.width - 14, firstY - 10);
  }
  if (visibleEnd < PROJECT_ITEMS.length) {
    const lastY = firstY + (Math.min(PROJECT_VISIBLE_ROWS, visibleEnd - visibleStart) - 1) * (boxH + gapY);
    ctxB.fillText('▼', bottomScreenCanvas.width - 14, lastY + boxH + 10);
  }

  ctxB.fillStyle = '#8890b0';
  ctxB.font = '9px monospace';
  ctxB.textBaseline = 'bottom';
  ctxB.fillText('↑/↓: choose   A: select   B: Home', 10, bottomScreenCanvas.height - 4);

  bottomScreenTexture.needsUpdate = true;
  topScreenTexture.needsUpdate = true;
}

// ----------------------
// ABOUT PAGE
// ----------------------

function drawAboutPage() {
  if (!bottomScreenCtx || !bottomScreenCanvas || !topScreenCtx || !topScreenCanvas) return;

  const ctxT = topScreenCtx;
  const ctxB = bottomScreenCtx;

  ctxT.imageSmoothingEnabled = false;
  ctxB.imageSmoothingEnabled = false;

  computeAboutWrappedLines();

  ctxT.fillStyle = '#000810';
  ctxT.fillRect(0, 0, topScreenCanvas.width, topScreenCanvas.height);

  ctxT.fillStyle = '#ffffff';
  ctxT.font = '14px monospace';
  ctxT.textBaseline = 'top';
  ctxT.fillText('About', 12, 12);

  ctxT.font = '10px monospace';
  ctxT.fillStyle = '#c0c8ff';
  ctxT.fillText('Scroll to read more about who I am,', 12, 32);
  ctxT.fillText('what I build, and what I\'m into.', 12, 44);
  ctxT.fillText('↑/↓: scroll   B: Home   ←/→: change page', 12, 72);

  ctxB.fillStyle = '#050816';
  ctxB.fillRect(0, 0, bottomScreenCanvas.width, bottomScreenCanvas.height);

  ctxB.fillStyle = '#192447';
  ctxB.fillRect(0, 0, bottomScreenCanvas.width, 24);

  ctxB.fillStyle = '#f5f7ff';
  ctxB.font = '11px monospace';
  ctxB.textBaseline = 'middle';
  ctxB.fillText('About Liam', 10, 12);

  ctxB.textAlign = 'right';
  ctxB.fillText('Page 3 / 4', bottomScreenCanvas.width - 10, 12);
  ctxB.textAlign = 'left';

  const panelX = 10;
  const panelY = 30;
  const panelW = bottomScreenCanvas.width - panelX * 2;
  const panelH = bottomScreenCanvas.height - panelY - 18;
  const radius = 6;

  ctxB.fillStyle = '#0b1020';
  drawRoundedRect(ctxB, panelX, panelY, panelW, panelH, radius);
  ctxB.fill();

  ctxB.strokeStyle = '#101521';
  ctxB.lineWidth = 2;
  drawRoundedRect(ctxB, panelX + 0.5, panelY + 0.5, panelW - 1, panelH - 1, radius);
  ctxB.stroke();

  const lineHeight = 14;
  const textX = panelX + 8;
  let textY = panelY + 10;

  const startLine = aboutScrollIndex;
  const endLine = Math.min(
    ABOUT_WRAPPED_LINES.length,
    startLine + ABOUT_VISIBLE_LINES
  );

  ctxB.font = '10px monospace';
  ctxB.fillStyle = '#dbe3ff';
  ctxB.textBaseline = 'top';

  for (let i = startLine; i < endLine; i++) {
    ctxB.fillText(ABOUT_WRAPPED_LINES[i], textX, textY);
    textY += lineHeight;
  }

  ctxB.font = '10px monospace';
  ctxB.fillStyle = '#8890b0';
  ctxB.textBaseline = 'middle';

  if (startLine > 0) {
    ctxB.fillText('▲', bottomScreenCanvas.width - 16, panelY + 8);
  }
  if (endLine < ABOUT_WRAPPED_LINES.length) {
    ctxB.fillText('▼', bottomScreenCanvas.width - 16, panelY + panelH - 10);
  }

  ctxB.fillStyle = '#8890b0';
  ctxB.font = '9px monospace';
  ctxB.textBaseline = 'bottom';
  ctxB.fillText('↑/↓: scroll   B: Home', panelX + 2, bottomScreenCanvas.height - 4);

  bottomScreenTexture.needsUpdate = true;
  topScreenTexture.needsUpdate = true;
}

// ----------------------
// CONTACT PAGE
// ----------------------

function drawContactPage() {
  if (!bottomScreenCtx || !bottomScreenCanvas || !topScreenCtx || !topScreenCanvas) return;

  const ctxT = topScreenCtx;
  const ctxB = bottomScreenCtx;

  ctxT.imageSmoothingEnabled = false;
  ctxB.imageSmoothingEnabled = false;

  const selected = CONTACT_ITEMS[contactItemIndex];

  ctxT.fillStyle = '#000810';
  ctxT.fillRect(0, 0, topScreenCanvas.width, topScreenCanvas.height);

  ctxT.fillStyle = '#ffffff';
  ctxT.font = '14px monospace';
  ctxT.textBaseline = 'top';
  ctxT.fillText('Contact', 12, 12);

  ctxT.font = '11px monospace';
  ctxT.fillStyle = '#a0d0ff';
  ctxT.fillText(selected.label, 12, 32);

  ctxT.font = '10px monospace';
  ctxT.fillStyle = '#c0c8ff';
  ctxT.fillText(selected.value, 12, 46);
  ctxT.fillText(selected.detail, 12, 60);

  if (contactSubmode === 'typing') {
    ctxT.fillText('Typing mode: B = back to list', 12, 78);
  } else {
    ctxT.fillText('A: open / copy (later), B: Home', 12, 78);
  }

  ctxB.fillStyle = '#050816';
  ctxB.fillRect(0, 0, bottomScreenCanvas.width, bottomScreenCanvas.height);

  ctxB.fillStyle = '#192447';
  ctxB.fillRect(0, 0, bottomScreenCanvas.width, 24);

  ctxB.fillStyle = '#f5f7ff';
  ctxB.font = '11px monospace';
  ctxB.textBaseline = 'middle';
  ctxB.fillText('Contact / Links', 10, 12);

  ctxB.textAlign = 'right';
  ctxB.fillText('Page 4 / 4', bottomScreenCanvas.width - 10, 12);
  ctxB.textAlign = 'left';

  if (contactSubmode === 'typing') {
    const panelX = 10;
    const panelY = 30;
    const panelW = bottomScreenCanvas.width - panelX * 2;
    const panelH = bottomScreenCanvas.height - panelY - 18;
    const radius = 6;

    ctxB.fillStyle = '#0b1020';
    drawRoundedRect(ctxB, panelX, panelY, panelW, panelH, radius);
    ctxB.fill();

    ctxB.strokeStyle = '#101521';
    ctxB.lineWidth = 2;
    drawRoundedRect(ctxB, panelX + 0.5, panelY + 0.5, panelW - 1, panelH - 1, radius);
    ctxB.stroke();

    ctxB.font = '10px monospace';
    ctxB.fillStyle = '#dbe3ff';
    ctxB.textBaseline = 'top';
    ctxB.fillText('To: Liam (via DS console)', panelX + 8, panelY + 8);

    const bodyX = panelX + 8;
    const bodyY = panelY + 26;
    const lineH = 14;

    const messageLines = [
      "Hi Liam, I found your DS portfolio",
      "and wanted to reach out.",
      "",
      ">> This is a fake typing screen",
      "   for now, but it shows how",
      "   a message could look.",
    ];

    messageLines.forEach((line, i) => {
      ctxB.fillText(line, bodyX, bodyY + i * lineH);
    });

    ctxB.fillStyle = '#8890b0';
    ctxB.font = '9px monospace';
    ctxB.textBaseline = 'bottom';
    ctxB.fillText('B: back to contact list', panelX + 2, bottomScreenCanvas.height - 4);
  } else {
    const boxX = 18;
    const boxW = bottomScreenCanvas.width - boxX * 2;
    const boxH = 26;
    const firstY = 36;
    const gapY = 4;
    const radius = 6;

    for (let i = 0; i < CONTACT_ITEMS.length; i++) {
      const item = CONTACT_ITEMS[i];
      const y = firstY + i * (boxH + gapY);
      const isSelected = i === contactItemIndex;

      const baseColor = PROJECT_BOX_COLORS[i % PROJECT_BOX_COLORS.length];

      const shadowOffset = 2;
      ctxB.fillStyle = 'rgba(0,0,0,0.5)';
      drawRoundedRect(ctxB, boxX, y + shadowOffset, boxW, boxH, radius);
      ctxB.fill();

      const grad = ctxB.createLinearGradient(0, y, 0, y + boxH);
      if (isSelected) {
        grad.addColorStop(0, lightenColor(baseColor, 0.15));
        grad.addColorStop(1, darkenColor(baseColor, 0.15));
      } else {
        grad.addColorStop(0, lightenColor(baseColor, 0.05));
        grad.addColorStop(1, darkenColor(baseColor, 0.25));
      }

      ctxB.fillStyle = grad;
      drawRoundedRect(ctxB, boxX, y, boxW, boxH, radius);
      ctxB.fill();

      ctxB.strokeStyle = isSelected ? '#ffffff' : '#101521';
      ctxB.lineWidth = isSelected ? 2 : 1;
      drawRoundedRect(ctxB, boxX + 0.5, y + 0.5, boxW - 1, boxH - 1, radius);
      ctxB.stroke();

      const textX = boxX + 14;
      const textY = y + boxH / 2 + 1;

      ctxB.font = '11px monospace';
      ctxB.textBaseline = 'middle';

      if (isSelected) {
        ctxB.save();
        ctxB.shadowColor = '#e6ffb0';
        ctxB.shadowBlur = 10;
        ctxB.fillStyle = '#ffffff';
        ctxB.fillText(item.label, textX, textY);
        ctxB.restore();
      } else {
        ctxB.fillStyle = '#f0f0f0';
        ctxB.fillText(item.label, textX, textY);
      }
    }

    ctxB.fillStyle = '#8890b0';
    ctxB.font = '9px monospace';
    ctxB.textBaseline = 'bottom';
    ctxB.fillText('↑/↓: choose   A: open / type   B: Home', 10, bottomScreenCanvas.height - 4);
  }

  bottomScreenTexture.needsUpdate = true;
  topScreenTexture.needsUpdate = true;
}

// ----------------------
// PAGE DISPATCH
// ----------------------

function drawCurrentPage(time = 0) {
  const page = PAGES[currentPageIndex];

  if (page === 'home') {
    drawHomePage(time);
  } else if (page === 'projects') {
    drawProjectsPage();
  } else if (page === 'about') {
    drawAboutPage();
  } else if (page === 'contact') {
    drawContactPage();
  }
}

// ----------------------
// PUBLIC API
// ----------------------

// Called by main.js right after DS model is ready
export function setMode(newMode) {
  if (mode === newMode) return;
  mode = newMode;

  if (mode === 'intro') {
    drawIntroScreen(0);
  } else if (mode === 'pages') {
    drawCurrentPage();
  }
}

// Called by main.js when a DS button is pressed
export function handleUiButton(id) {
  if (mode === 'intro') {
    if (id === 'A' || id === 'START') {
      currentPageIndex = 0;
      setMode('pages');
    }
    return;
  }

  if (mode === 'pages') {
    const currentPage = PAGES[currentPageIndex];

    switch (id) {
      case 'D_RIGHT': {
        currentPageIndex = (currentPageIndex + 1) % PAGES.length;
        const newPage = PAGES[currentPageIndex];

        if (newPage === 'about') {
          aboutScrollIndex = 0;
          computeAboutWrappedLines();
        }
        if (newPage === 'contact') {
          contactSubmode = 'list';
        }

        drawCurrentPage();
        break;
      }

      case 'D_LEFT': {
        currentPageIndex =
          (currentPageIndex - 1 + PAGES.length) % PAGES.length;
        const newPage = PAGES[currentPageIndex];

        if (newPage === 'about') {
          aboutScrollIndex = 0;
          computeAboutWrappedLines();
        }
        if (newPage === 'contact') {
          contactSubmode = 'list';
        }

        drawCurrentPage();
        break;
      }

      case 'D_UP': {
        if (currentPage === 'projects') {
          if (projectItemIndex > 0) {
            projectItemIndex--;
            if (projectItemIndex < projectViewportStart) {
              projectViewportStart = projectItemIndex;
            }
            drawProjectsPage();
          }
        } else if (currentPage === 'about') {
          if (aboutScrollIndex > 0) {
            aboutScrollIndex--;
            drawAboutPage();
          }
        } else if (currentPage === 'contact' && contactSubmode === 'list') {
          if (contactItemIndex > 0) {
            contactItemIndex--;
            drawContactPage();
          }
        }
        break;
      }

      case 'D_DOWN': {
        if (currentPage === 'projects') {
          if (projectItemIndex < PROJECT_ITEMS.length - 1) {
            projectItemIndex++;
            const lastVisibleIndex = projectViewportStart + PROJECT_VISIBLE_ROWS - 1;
            if (projectItemIndex > lastVisibleIndex) {
              projectViewportStart =
                projectItemIndex - (PROJECT_VISIBLE_ROWS - 1);
            }
            drawProjectsPage();
          }
        } else if (currentPage === 'about') {
          computeAboutWrappedLines();
          if (aboutScrollIndex < ABOUT_MAX_START) {
            aboutScrollIndex++;
            drawAboutPage();
          }
        } else if (currentPage === 'contact' && contactSubmode === 'list') {
          if (contactItemIndex < CONTACT_ITEMS.length - 1) {
            contactItemIndex++;
            drawContactPage();
          }
        }
        break;
      }

      case 'A': {
        if (currentPage === 'projects') {
          const selected = PROJECT_ITEMS[projectItemIndex];
          console.log(`🅰 Selected project: ${selected.id} (${selected.label})`);
          // later: window.location to a full project page
        } else if (currentPage === 'contact') {
          const selected = CONTACT_ITEMS[contactItemIndex];
          if (selected.id === 'message') {
            contactSubmode = 'typing';
            drawContactPage();
          } else {
            console.log(`🔗 Contact via ${selected.id}: ${selected.value}`);
          }
        }
        break;
      }

      case 'B': {
        if (currentPage === 'contact' && contactSubmode === 'typing') {
          contactSubmode = 'list';
          drawContactPage();
        } else {
          currentPageIndex = 0;
          aboutScrollIndex = 0;
          contactSubmode = 'list';
          drawCurrentPage();
        }
        break;
      }

      default:
        console.log('🎮 Button pressed in pages mode:', id, 'on', currentPage);
    }
  }
}

// Called every frame by main.js
export function renderScreens(timestamp = 0) {
  if (mode === 'intro') {
    drawIntroScreen(timestamp);
  } else if (mode === 'pages') {
    drawCurrentPage(timestamp);
  }
}
