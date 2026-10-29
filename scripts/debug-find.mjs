import fs from 'fs';
import readline from 'readline';

async function findStep() {
  const fileStream = fs.createReadStream('C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79/.system_generated/logs/transcript.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  for await (const line of rl) {
    if (line.includes('"step_index":34831')) {
      const obj = JSON.parse(line);
      console.log('Step 34831 Content:', obj.content);
      console.log('Step 34831 Media:', obj.media);
      break;
    }
  }
}
findStep();
