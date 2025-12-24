#!/usr/bin/env node
const fs = require('fs');

// Read scenes.json
const scenes = JSON.parse(fs.readFileSync('scenes.json', 'utf8'));

// Get base URL from command line arguments
const baseUrl = process.argv[2];

if (!baseUrl) {
  console.error('Usage: node generateMarkdownSummary.js <base-url>');
  process.exit(1);
}

// Sanitize scene name to prevent path traversal
function sanitizeName(name) {
  // Remove any characters that aren't alphanumeric, dash, or underscore
  return name.replace(/[^a-zA-Z0-9_-]/g, '-');
}

// Generate markdown
let markdown = '## 🎬 Demo Video Generated\n\n';
markdown += `### Full Video\n\n`;
markdown += `[📥 Download Full Video (MP4)](${baseUrl}/ui-test.mp4) | [GIF](${baseUrl}/ui-test.gif)\n\n`;
markdown += `---\n\n`;
markdown += `### 📑 Video Segments\n\n`;
markdown += `<details>\n`;
markdown += `<summary>Click to expand segments</summary>\n\n`;

scenes.forEach((scene, index) => {
  const safeName = sanitizeName(scene.name);
  const segmentFile = `segment-${String(index + 1).padStart(2, '0')}-${safeName}.gif`;
  const title = scene.title || scene.name;
  const duration = (scene.duration / 1000).toFixed(1);
  
  markdown += `<details>\n`;
  markdown += `<summary><strong>${index + 1}. ${title}</strong> (${duration}s)</summary>\n\n`;
  markdown += `![${title}](${baseUrl}/${segmentFile})\n\n`;
  markdown += `</details>\n\n`;
});

markdown += `</details>\n\n`;
markdown += `_Videos will expire in 90 days._`;

console.log(markdown);
