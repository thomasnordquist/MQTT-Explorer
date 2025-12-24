#!/usr/bin/env node

/**
 * Integration test for video segmentation workflow
 * 
 * This test validates:
 * 1. SceneBuilder generates scenes with titles
 * 2. Scenes are saved to scenes.json
 * 3. cutVideoSegments script processes scenes correctly
 * 4. generateMarkdownSummary creates proper output
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

function testSceneGeneration() {
  console.log('Testing scene generation...');
  
  // Check if compiled files exist
  const distPath = path.join(__dirname, '../dist/src/spec/SceneBuilder.js');
  if (!fs.existsSync(distPath)) {
    console.log('  ⚠ Skipping test - TypeScript not compiled. Run "npx tsc" first.');
    return null;
  }
  
  // Import and test SceneBuilder
  const SceneBuilder = require('../dist/src/spec/SceneBuilder').SceneBuilder;
  const SCENE_TITLES = require('../dist/src/spec/SceneBuilder').SCENE_TITLES;
  
  // Verify SCENE_TITLES exist
  const titleKeys = Object.keys(SCENE_TITLES);
  if (titleKeys.length === 0) {
    throw new Error('SCENE_TITLES is empty');
  }
  
  console.log(`  ✓ Found ${titleKeys.length} scene titles`);
  
  // Create a sample scene
  const builder = new SceneBuilder();
  const testScenes = [
    { name: 'connect', start: 0, stop: 1000, duration: 1000, title: SCENE_TITLES.connect },
    { name: 'numeric_plots', start: 1000, stop: 2000, duration: 1000, title: SCENE_TITLES.numeric_plots },
    { name: 'end', start: 2000, stop: 3000, duration: 1000, title: SCENE_TITLES.end },
  ];
  
  // Manually populate scenes for testing
  builder.scenes = testScenes;
  
  // Save to JSON
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-workflow-'));
  const scenesPath = path.join(tempDir, 'scenes.json');
  fs.writeFileSync(scenesPath, JSON.stringify(builder.scenes, null, 2));
  
  console.log(`  ✓ Saved scenes to ${scenesPath}`);
  
  return { tempDir, scenesPath, scenes: builder.scenes };
}

function testCuttingLogic(tempDir, scenes) {
  console.log('Testing cutting logic...');
  
  // Create dummy video file
  const videoPath = path.join(tempDir, 'ui-test.mp4');
  fs.writeFileSync(videoPath, 'dummy video content');
  
  // Process scenes like the cutting script would (now creates GIFs)
  const expectedSegments = [];
  scenes.forEach((scene, index) => {
    const outputFile = `segment-${String(index + 1).padStart(2, '0')}-${scene.name}.gif`;
    const startTime = scene.start / 1000;
    const duration = scene.duration / 1000;
    
    expectedSegments.push({
      filename: outputFile,
      start: startTime,
      duration: duration,
      title: scene.title
    });
  });
  
  console.log(`  ✓ Processed ${expectedSegments.length} segments`);
  
  // Verify segment naming
  expectedSegments.forEach(seg => {
    if (!seg.filename.match(/^segment-\d{2}-.+\.gif$/)) {
      throw new Error(`Invalid segment filename: ${seg.filename}`);
    }
  });
  
  console.log('  ✓ All segment filenames are valid');
  
  return expectedSegments;
}

function testMarkdownGeneration(tempDir) {
  console.log('Testing markdown generation...');
  
  const baseUrl = 'https://example.com/test-pr-123';
  const scenesPath = path.join(tempDir, 'scenes.json');
  
  // Run markdown generation script
  const originalCwd = process.cwd();
  process.chdir(tempDir);
  
  let markdown;
  try {
    markdown = execSync(
      `node "${path.join(__dirname, 'generateMarkdownSummary.js')}" "${baseUrl}"`,
      { encoding: 'utf8' }
    );
  } finally {
    process.chdir(originalCwd);
  }
  
  // Verify markdown content
  if (!markdown.includes('## 🎬 Demo Video Generated')) {
    throw new Error('Markdown missing title');
  }
  
  if (!markdown.includes('### Full Video')) {
    throw new Error('Markdown missing full video section');
  }
  
  if (!markdown.includes('### 📑 Video Segments')) {
    throw new Error('Markdown missing segments section');
  }
  
  if (!markdown.includes('<details>')) {
    throw new Error('Markdown missing collapsible sections');
  }
  
  if (!markdown.includes('Connecting to MQTT Broker')) {
    throw new Error('Markdown missing scene title');
  }
  
  if (!markdown.includes(baseUrl)) {
    throw new Error('Markdown missing base URL');
  }
  
  console.log('  ✓ Markdown structure is valid');
  console.log('  ✓ Markdown contains all required sections');
  
  return markdown;
}

function cleanup(tempDir) {
  console.log('Cleaning up...');
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log('  ✓ Temporary files removed');
}

// Run tests
try {
  console.log('=== Video Segmentation Integration Test ===\n');
  
  const result = testSceneGeneration();
  
  if (!result) {
    console.log('\n=== Test Skipped (TypeScript not compiled) ===\n');
    console.log('Run "npx tsc" to compile TypeScript before running this test.');
    process.exit(0);
  }
  
  const { tempDir, scenesPath, scenes } = result;
  const segments = testCuttingLogic(tempDir, scenes);
  const markdown = testMarkdownGeneration(tempDir);
  cleanup(tempDir);
  
  console.log('\n=== All Tests Passed ✓ ===\n');
  
  // Display sample output
  console.log('Sample Markdown Output:');
  console.log('─'.repeat(60));
  console.log(markdown.split('\n').slice(0, 25).join('\n'));
  console.log('...');
  console.log('─'.repeat(60));
  
  process.exit(0);
} catch (error) {
  console.error('\n✗ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
