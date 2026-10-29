import sharp from 'sharp';

async function generateCleanCards() {
  const refPath = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79/.user_uploaded/media_1792827265238_9ddb2e33.png';

  // 1. Extract Left Card (525 x 376)
  const leftCardRaw = await sharp(refPath)
    .extract({ left: 65, top: 72, width: 525, height: 376 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data: leftData, info: leftInfo } = leftCardRaw;
  const w = leftInfo.width;
  const h = leftInfo.height;

  // Let's create a clean Left Card canvas where the text area (x: 15..355, y: 15..365)
  // is filled with the deep blue gradient from the card background,
  // BUT the border (x < 15, y < 15, y > 365) and the Mascot (x >= 355) remain 100% intact!
  // Wait, let's see what the background color gradient is:
  // At top (y=20, x=30): ~ rgb(4, 9, 40)
  // At middle (y=180, x=30): ~ rgb(3, 14, 52)
  // At bottom (y=360, x=30): ~ rgb(3, 10, 42)
  // And subtle glow near edges.
  
  // Also, extract the 3 feature cards individually with high quality:
  // Card 1: 5 Questions (x: 23, y: 204, w: 148, h: 108)
  await sharp(refPath)
    .extract({ left: 65 + 23, top: 72 + 204, width: 148, height: 108 })
    .toFile('src/assets/games/quiz/ref_card_5_questions.png');

  // Card 2: Time Limit (x: 182, y: 204, w: 158, h: 108)
  await sharp(refPath)
    .extract({ left: 65 + 182, top: 72 + 204, width: 158, height: 108 })
    .toFile('src/assets/games/quiz/ref_card_time_limit.png');

  // Card 3: 2 Rewards (x: 350, y: 204, w: 158, h: 108)
  await sharp(refPath)
    .extract({ left: 65 + 350, top: 72 + 204, width: 158, height: 108 })
    .toFile('src/assets/games/quiz/ref_card_2_rewards.png');

  // Extract the Start Quiz button (x: 130, y: 322, w: 265, h: 42)
  await sharp(refPath)
    .extract({ left: 65 + 130, top: 72 + 322, width: 265, height: 42 })
    .toFile('src/assets/games/quiz/ref_btn_start_quiz.png');

  // Extract the Mascot Boy area (x: 340, y: 0, w: 185, h: 376)
  await sharp(refPath)
    .extract({ left: 65 + 340, top: 72, width: 185, height: 376 })
    .toFile('src/assets/games/quiz/ref_mascot_area.png');

  // Extract the Quivio badge (x: 20, y: 18, w: 50, h: 50)
  await sharp(refPath)
    .extract({ left: 65 + 20, top: 72 + 18, width: 50, height: 50 })
    .toFile('src/assets/games/quiz/ref_quivio_badge.png');

  // 2. Extract Right Card (355 x 376)
  await sharp(refPath)
    .extract({ left: 600, top: 72, width: 355, height: 376 })
    .toFile('src/assets/games/quiz/ref_right_card_full.png');

  // Also extract clean right card header compartment (x: 0, y: 0, w: 355, h: 54)
  await sharp(refPath)
    .extract({ left: 600, top: 72, width: 355, height: 54 })
    .toFile('src/assets/games/quiz/ref_right_card_header.png');

  // 3. Extract the Bottom Card (890 x 76)
  await sharp(refPath)
    .extract({ left: 65, top: 462, width: 890, height: 76 })
    .toFile('src/assets/games/quiz/ref_bottom_card_exact.png');

  console.log('All exact reference assets extracted successfully!');
}

generateCleanCards();
