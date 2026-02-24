/*
Week 5 — Example 5: Side-Scroller Platformer with JSON Levels + Modular Camera

Course: GBDA302 | Instructors: Dr. Karen Cochrane & David Han
Date: Feb. 12, 2026

Move: WASD/Arrows | Jump: Space

Learning goals:
- Build a side-scrolling platformer using modular game systems
- Load complete level definitions from external JSON (LevelLoader + levels.json)
- Separate responsibilities across classes (Player, Platform, Camera, World)
- Implement gravity, jumping, and collision with platforms
- Use a dedicated Camera2D class for smooth horizontal tracking
- Support multiple levels and easy tuning through data files
- Explore scalable project architecture for larger games
*/

const VIEW_W = 800;
const VIEW_H = 480;

let allLevelsData;
let levelIndex = 0;

let level;
let player;
let cam;

// Color to draw the blob and result text shown on HUD
let blobColor;
letresultText = "";

function preload() {
  allLevelsData = loadJSON("levels.json"); // levels.json beside index.html [web:122]
}

function setup() {
  createCanvas(VIEW_W, VIEW_H);
  textFont("sans-serif");
  textSize(14);

  cam = new Camera2D(width, height);
  loadLevel(levelIndex);
}

function loadLevel(i) {
  level = LevelLoader.fromLevelsJson(allLevelsData, i);

  player = new BlobPlayer();
  player.spawnFromLevel(level);

  cam.x = player.x - width / 2;
  cam.y = 0;
  cam.clampToWorld(level.w, level.h);

  // Compute level finish X as the rightmost platform edge
  finishX = 0;
  for (const p of level.platforms) finishX = max(finishX, p.x + p.w);

  blobColor = level.theme.blob;
  resultText = "";
}

function playerBox() {
  return {
    x: player.x - player.r,
    y: player.y - player.r,
    w: player.r * 2,
    h: player.r * 2,
  };
}

function draw() {
  // --- game state ---
  player.update(level);

  // Fall death → respawn
  if (player.y - player.r > level.deathY) {
    loadLevel(levelIndex);
    return;
  }

  // --- view state (data-driven smoothing) ---
  cam.followSideScrollerX(player.x, level.camLerp);
  cam.y = 0;
  cam.clampToWorld(level.w, level.h);

  // --- draw ---
  cam.begin();
  level.drawWorld();
  player.draw(blobColor);

  // Display player result near the blob
  fill(0);
  noStroke();
  text(
    "Result: " + (resultText || "—"),
    player.x - 40,
    player.y - player.r - 30,
  );

  cam.end();

  // HUD and instructions
  fill(0);
  noStroke();
  text("A/D or ←/→ move • Space/W/↑ jump • Fall = respawn", 10, 60);

  // instruction text
  text("Game Rule: Blob in GREEN → SUCCESS | Blob in RED → FAILED", 10, 18);
  text("The result appears when the blob enters the end block.", 10, 35);

  const box = playerBox();

  // touch good → set blob color to green
  for (const b of level.goodBlocks) {
    if (BlobPlayer.overlap(box, b)) blobColor = "green";
  }

  // touch bad → set blob color to red
  for (const b of level.badBlocks) {
    if (BlobPlayer.overlap(box, b)) blobColor = "red";
  }

  // If player touches the end block, show win/lose based on blob color
  if (
    !resultText &&
    level.endBlock &&
    BlobPlayer.overlap(box, level.endBlock)
  ) {
    resultText = blobColor === "green" ? "Win" : "Lose";
  }
}

function keyPressed() {
  if (key === " " || key === "W" || key === "w" || keyCode === UP_ARROW) {
    player.tryJump();
  }
  if (key === "r" || key === "R") loadLevel(levelIndex);
}
