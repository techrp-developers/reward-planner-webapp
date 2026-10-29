import sharp from 'sharp';

async function cleanArenaBg() {
  const srcPath = 'src/assets/games/quiz/quivio_game_bg.png';
  const { data, info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const out = Buffer.from(data);

  const getIdx = (x, y) => (y * width + x) * channels;
  const getRGB = (x, y) => {
    const idx = (y * width + x) * channels;
    return [data[idx], data[idx+1], data[idx+2]];
  };

  const setRGB = (x, y, r, g, b) => {
    const idx = (y * width + x) * channels;
    out[idx] = Math.max(0, Math.min(255, Math.round(r)));
    out[idx+1] = Math.max(0, Math.min(255, Math.round(g)));
    out[idx+2] = Math.max(0, Math.min(255, Math.round(b)));
    if (channels === 4) out[idx+3] = 255;
  };

  // 1. Clean '7 / 10' text area (x: 470..550, y: 172..200)
  // Fill with space gradient interpolated from top (y=170) and bottom (y=202)
  for (let y = 172; y <= 200; y++) {
    const vFactor = (y - 172) / (200 - 172);
    for (let x = 470; x <= 550; x++) {
      const topRGB = getRGB(x, 170);
      const botRGB = getRGB(x, 202);
      const r = topRGB[0] * (1 - vFactor) + botRGB[0] * vFactor;
      const g = topRGB[1] * (1 - vFactor) + botRGB[1] * vFactor;
      const b = topRGB[2] * (1 - vFactor) + botRGB[2] * vFactor;
      setRGB(x, y, r, g, b);
    }
  }

  // 2. Clean Question text area (x: 292..740, y: 248..360)
  // Fill unconditionally with smooth vertical gradient from y=240 to y=362
  for (let y = 248; y <= 360; y++) {
    const vF = (y - 248) / (360 - 248);
    for (let x = 292; x <= 740; x++) {
      const topRGB = getRGB(x, 240);
      const botRGB = getRGB(x, 362);
      const newR = topRGB[0] * (1 - vF) + botRGB[0] * vF;
      const newG = topRGB[1] * (1 - vF) + botRGB[1] * vF;
      const newB = topRGB[2] * (1 - vF) + botRGB[2] * vF;
      setRGB(x, y, newR, newG, newB);
    }
  }

  // Helper to clean pill interior while strictly preserving the glowing neon borders
  // Each pill has width ~215, height ~58.
  // Pill borders are at outer ~16px. Interior is inner box.
  const cleanPillInterior = (xMin, xMax, yMin, yMax) => {
    // Sample pill background from clean side strips inside the pill
    for (let y = yMin; y <= yMax; y++) {
      const vF = (y - yMin) / (yMax - yMin);
      // Sample left inside strip at xMin - 6 and right inside strip at xMax + 6
      const leftCol = getRGB(xMin - 6, y);
      const rightCol = getRGB(xMax + 6, y);

      for (let x = xMin; x <= xMax; x++) {
        const hF = (x - xMin) / (xMax - xMin);
        const r = leftCol[0] * (1 - hF) + rightCol[0] * hF;
        const g = leftCol[1] * (1 - hF) + rightCol[1] * hF;
        const b = leftCol[2] * (1 - hF) + rightCol[2] * hF;
        setRGB(x, y, r, g, b);
      }
    }
  };

  // Pill 1 (Earth): inner x: 375..520, inner y: 386..426
  cleanPillInterior(375, 520, 386, 426);

  // Pill 2 (Mars): inner x: 605..750, inner y: 386..426
  cleanPillInterior(605, 750, 386, 426);

  // Pill 3 (Jupiter): inner x: 375..520, inner y: 460..500
  cleanPillInterior(375, 520, 460, 500);

  // Pill 4 (Venus): inner x: 605..750, inner y: 460..500
  cleanPillInterior(605, 750, 460, 500);

  // Also clean the interior of the progress bar track so React can fill it cleanly
  // Progress bar is from x: 395..625, y: 211..222
  for (let y = 211; y <= 222; y++) {
    for (let x = 395; x <= 625; x++) {
      // Empty dark purple track color
      setRGB(x, y, 22, 16, 68);
    }
  }

  // Save clean arena canvas
  await sharp(out, { raw: { width, height, channels } })
    .toFile('src/assets/games/quiz/quivio_arena_clean_canvas.png');

  console.log('Successfully generated seamless quivio_arena_clean_canvas.png');
}

cleanArenaBg().catch(console.error);

