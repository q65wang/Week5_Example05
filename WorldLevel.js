class WorldLevel {
  constructor(levelJson) {
    this.name = levelJson.name ?? "Level";

    this.theme = Object.assign(
      {
        bg: "#F0F0F0",
        platform: "#C8C8C8",
        blob: "#1478FF",
        goodBlock: "#6EE56E",
      },
      levelJson.theme ?? {},
    );

    // Physics knobs
    this.gravity = levelJson.gravity ?? 0.65;
    this.jumpV = levelJson.jumpV ?? -11.0;

    // Camera knob (data-driven view state)
    this.camLerp = levelJson.camera?.lerp ?? 0.12;

    // World size + death line
    this.w = levelJson.world?.w ?? 2400;
    this.h = levelJson.world?.h ?? 360;
    this.deathY = levelJson.world?.deathY ?? this.h + 200;

    this.goodBlocks = levelJson.goodBlocks ?? [];
    this.badBlocks = levelJson.badBlocks ?? [];
    this.endBlock = levelJson.endBlock ?? null;

    // Start
    this.start = Object.assign({ x: 80, y: 220, r: 26 }, levelJson.start ?? {});

    // Platforms
    this.platforms = (levelJson.platforms ?? []).map(
      (p) => new Platform(p.x, p.y, p.w, p.h),
    );
  }

  drawWorld() {
    background(this.theme.bg);
    push();
    rectMode(CORNER); // critical: undo any global rectMode(CENTER) [web:230]
    noStroke();
    fill(this.theme.platform);

    for (const p of this.platforms) rect(p.x, p.y, p.w, p.h); // x,y = top-left [web:234]

    fill("green");
    for (const b of this.goodBlocks) rect(b.x, b.y, b.w, b.h);

    fill("red");
    for (const b of this.badBlocks) rect(b.x, b.y, b.w, b.h);

    if (this.endBlock) {
      fill("grey");
      noStroke();
      rect(this.endBlock.x, this.endBlock.y, this.endBlock.w, this.endBlock.h);
    }
  }
}
