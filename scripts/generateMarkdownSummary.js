#!/usr/bin/env node
const fs = require('fs');

// Get base URL and test status from command line arguments
const baseUrl = process.argv[2];
const testStatus = process.argv[3] || 'success'; // Default to success if not provided

if (!baseUrl) {
  console.error('Usage: node generateMarkdownSummary.js <base-url> [test-status]');
  process.exit(1);
}

// Read scenes.json if it exists
let scenes = [];
try {
  if (fs.existsSync('scenes.json')) {
    scenes = JSON.parse(fs.readFileSync('scenes.json', 'utf8'));
  }
} catch (error) {
  console.error('Warning: Could not read scenes.json - video segments will not be available:', error.message);
}

// Sanitize scene name to prevent path traversal
function sanitizeName(name) {
  // Remove any characters that aren't alphanumeric, dash, or underscore
  return name.replace(/[^a-zA-Z0-9_-]/g, '-');
}

// Generate markdown with status indication
const statusIcon = testStatus === 'success' ? '✅' : '⚠️';
const statusText = testStatus === 'success' ? 'Generated Successfully' : 'Generated (Test Failed)';

let markdown = `## ${statusIcon} Demo Video ${statusText}\n\n`;

if (testStatus !== 'success') {
  markdown += `> ⚠️ **Note**: The demo test encountered errors but videos were still uploaded for debugging. Check the logs for details.\n\n`;
}

markdown += `### Full Video\n\n`;
markdown += `[📥 Download Full Video (MP4)](${baseUrl}/ui-test.mp4) | [GIF](${baseUrl}/ui-test.gif)\n\n`;
markdown += `---\n\n`;

if (scenes.length > 0) {
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
} else {
  markdown += `*Scene information not available - check if video processing completed*\n\n`;
}

markdown += `_Videos will expire in 90 days._`;

console.log(markdown);
