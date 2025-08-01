#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to update version in package.json files
function updateVersion(newVersion) {
  const packageFiles = [
    'package.json',
    'frontend/package.json',
    'backend/package.json'
  ];

  packageFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      packageJson.version = newVersion;
      fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`✅ Updated ${filePath} to version ${newVersion}`);
    }
  });
}

// Function to create git tag
function createGitTag(version) {
  const { execSync } = require('child_process');
  try {
    execSync(`git tag -d v${version}`, { stdio: 'ignore' });
  } catch (error) {
    // Tag doesn't exist, that's fine
  }
  
  execSync(`git tag -a v${version} -m "AssetNest v${version} - Release"`);
  console.log(`✅ Created git tag v${version}`);
}

// Main function
function main() {
  const newVersion = process.argv[2];
  
  if (!newVersion) {
    console.error('❌ Please provide a version number');
    console.log('Usage: node scripts/update-version.js <version>');
    console.log('Example: node scripts/update-version.js 1.1.0');
    process.exit(1);
  }

  if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
    console.error('❌ Version must be in format x.y.z (e.g., 1.0.0)');
    process.exit(1);
  }

  console.log(`🔄 Updating AssetNest to version ${newVersion}...`);
  
  updateVersion(newVersion);
  createGitTag(newVersion);
  
  console.log(`\n🎉 Successfully updated to version ${newVersion}!`);
  console.log('Next steps:');
  console.log('1. Review the changes: git diff');
  console.log('2. Commit the changes: git add . && git commit -m "chore: bump version to ${newVersion}"');
  console.log('3. Push to GitHub: git push origin main && git push origin v${newVersion}');
}

if (require.main === module) {
  main();
} 