#!/bin/bash
set -e

# Read scenes.json and cut video into segments as GIFs
if [ ! -f "scenes.json" ]; then
  echo "scenes.json not found"
  exit 1
fi

if [ ! -f "ui-test.mp4" ]; then
  echo "ui-test.mp4 not found"
  exit 1
fi

echo "Cutting video into GIF segments based on scenes.json..."

GIF_SCALE="1024"

# Parse scenes.json and cut video segments as GIFs
node -e "
const fs = require('fs');
const { spawn } = require('child_process');

const scenes = JSON.parse(fs.readFileSync('scenes.json', 'utf8'));

console.log('Creating GIF segments...');

// Sanitize scene name to prevent path traversal and command injection
function sanitizeName(name) {
  // Remove any characters that aren't alphanumeric, dash, or underscore
  return name.replace(/[^a-zA-Z0-9_-]/g, '-');
}

async function cutSegmentAsGif(scene, index) {
  const safeName = sanitizeName(scene.name);
  const segmentName = \`segment-\${String(index + 1).padStart(2, '0')}-\${safeName}\`;
  const paletteFile = \`\${segmentName}-palette.png\`;
  const outputFile = \`\${segmentName}.gif\`;
  const startTime = scene.start / 1000; // Convert ms to seconds
  const duration = scene.duration / 1000; // Convert ms to seconds
  
  console.log(\`Creating \${outputFile} (start: \${startTime}s, duration: \${duration}s)\`);
  
  // Step 1: Generate palette for this segment
  await new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-y',
      '-ss', startTime.toString(),
      '-t', duration.toString(),
      '-i', 'ui-test.mp4',
      '-vf', 'fps=10,scale=${process.env.GIF_SCALE || 1024}:-1:flags=lanczos,palettegen',
      paletteFile
    ]);
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        console.error(\`Failed to create palette for \${outputFile}\`);
        reject(new Error(\`ffmpeg palette generation exited with code \${code}\`));
      }
    });
  });
  
  // Step 2: Create GIF using the palette
  await new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-y',
      '-ss', startTime.toString(),
      '-t', duration.toString(),
      '-i', 'ui-test.mp4',
      '-i', paletteFile,
      '-filter_complex', 'fps=10,scale=${process.env.GIF_SCALE || 1024}:-1:flags=lanczos[x];[x][1:v]paletteuse',
      outputFile
    ]);
    
    ffmpeg.on('close', (code) => {
      // Clean up palette file
      try {
        fs.unlinkSync(paletteFile);
      } catch (e) {
        // Ignore cleanup errors
      }
      
      if (code === 0) {
        resolve();
      } else {
        console.error(\`Failed to create \${outputFile}\`);
        reject(new Error(\`ffmpeg GIF creation exited with code \${code}\`));
      }
    });
  });
}

(async () => {
  for (let i = 0; i < scenes.length; i++) {
    await cutSegmentAsGif(scenes[i], i);
  }
  console.log('All GIF segments created successfully');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
"

echo "Video segments created successfully"
