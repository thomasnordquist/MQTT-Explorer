#!/usr/bin/env node
const fs = require('fs');

// Read scenes-mobile.json
const scenes = JSON.parse(fs.readFileSync('scenes-mobile.json', 'utf8'));

// Get base URL from command line arguments
const baseUrl = process.argv[2];

if (!baseUrl) {
  console.error('Usage: node generateMarkdownSummaryMobile.js <base-url>');
  process.exit(1);
}

// Sanitize scene name to prevent path traversal
function sanitizeName(name) {
  // Remove any characters that aren't alphanumeric, dash, or underscore
  return name.replace(/[^a-zA-Z0-9_-]/g, '-');
}

// Generate markdown
let markdown = '## 📱 Mobile Demo Video Generated\n\n';
markdown += `### Full Mobile Video (Pixel 6 - 412x915)\n\n`;
markdown += `[📥 Download Mobile Video (MP4)](${baseUrl}/ui-test-mobile.mp4) | [GIF](${baseUrl}/ui-test-mobile.gif)\n\n`;
markdown += `---\n\n`;
markdown += `### 📑 Mobile Video Segments\n\n`;
markdown += `<details>\n`;
markdown += `<summary>Click to expand mobile segments</summary>\n\n`;

scenes.forEach((scene, index) => {
  const safeName = sanitizeName(scene.name);
  const segmentFile = `segment-mobile-${String(index + 1).padStart(2, '0')}-${safeName}.gif`;
  const title = scene.title || scene.name;
  const duration = (scene.duration / 1000).toFixed(1);
  
  markdown += `<details>\n`;
  markdown += `<summary><strong>${index + 1}. ${title}</strong> (${duration}s)</summary>\n\n`;
  markdown += `![${title}](${baseUrl}/${segmentFile})\n\n`;
  markdown += `</details>\n\n`;
});

markdown += `</details>\n\n`;
markdown += `_Mobile videos recorded at 412x915 (Pixel 6 viewport). Videos will expire in 90 days._`;

console.log(markdown);
