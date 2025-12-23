#!/bin/bash
set -e

# Read scenes.json and cut video into segments
if [ ! -f "scenes.json" ]; then
  echo "scenes.json not found"
  exit 1
fi

if [ ! -f "ui-test.mp4" ]; then
  echo "ui-test.mp4 not found"
  exit 1
fi

echo "Cutting video into segments based on scenes.json..."

# Parse scenes.json and cut video segments
node -e "
const fs = require('fs');
const { spawn } = require('child_process');

const scenes = JSON.parse(fs.readFileSync('scenes.json', 'utf8'));

console.log('Creating video segments...');

// Sanitize scene name to prevent path traversal and command injection
function sanitizeName(name) {
  // Remove any characters that aren't alphanumeric, dash, or underscore
  return name.replace(/[^a-zA-Z0-9_-]/g, '-');
}

async function cutSegment(scene, index) {
  const safeName = sanitizeName(scene.name);
  const outputFile = \`segment-\${String(index + 1).padStart(2, '0')}-\${safeName}.mp4\`;
  const startTime = scene.start / 1000; // Convert ms to seconds
  const duration = scene.duration / 1000; // Convert ms to seconds
  
  console.log(\`Creating \${outputFile} (start: \${startTime}s, duration: \${duration}s)\`);
  
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-y',
      '-i', 'ui-test.mp4',
      '-ss', startTime.toString(),
      '-t', duration.toString(),
      '-c', 'copy',
      outputFile
    ]);
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        console.error(\`Failed to create \${outputFile}\`);
        reject(new Error(\`ffmpeg exited with code \${code}\`));
      }
    });
  });
}

(async () => {
  for (let i = 0; i < scenes.length; i++) {
    await cutSegment(scenes[i], i);
  }
  console.log('All segments created successfully');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
"

echo "Video segments created successfully"
