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
const { execSync } = require('child_process');

const scenes = JSON.parse(fs.readFileSync('scenes.json', 'utf8'));

console.log('Creating video segments...');

scenes.forEach((scene, index) => {
  const outputFile = \`segment-\${String(index + 1).padStart(2, '0')}-\${scene.name}.mp4\`;
  const startTime = scene.start / 1000; // Convert ms to seconds
  const duration = scene.duration / 1000; // Convert ms to seconds
  
  console.log(\`Creating \${outputFile} (start: \${startTime}s, duration: \${duration}s)\`);
  
  const cmd = \`ffmpeg -y -i ui-test.mp4 -ss \${startTime} -t \${duration} -c copy \${outputFile}\`;
  
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (error) {
    console.error(\`Failed to create \${outputFile}\`);
    process.exit(1);
  }
});

console.log('All segments created successfully');
"

echo "Video segments created successfully"
