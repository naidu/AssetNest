# Scripts

This directory contains utility scripts for the AssetNest project.

## update-version.js

Automatically updates version numbers across all package.json files and creates git tags.

### Usage

```bash
# Update to a new version
npm run version 1.1.0

# Or run directly
node scripts/update-version.js 1.1.0
```

### What it does

1. Updates version in all package.json files (root, frontend, backend)
2. Creates a new git tag for the version
3. Provides next steps for committing and pushing

### Example

```bash
$ npm run version 1.1.0

🔄 Updating AssetNest to version 1.1.0...
✅ Updated package.json to version 1.1.0
✅ Updated frontend/package.json to version 1.1.0
✅ Updated backend/package.json to version 1.1.0
✅ Created git tag v1.1.0

🎉 Successfully updated to version 1.1.0!
Next steps:
1. Review the changes: git diff
2. Commit the changes: git add . && git commit -m "chore: bump version to 1.1.0"
3. Push to GitHub: git push origin main && git push origin v1.1.0
```

### Version Format

Versions must follow semantic versioning: `x.y.z`
- `x` - Major version (breaking changes)
- `y` - Minor version (new features, backward compatible)
- `z` - Patch version (bug fixes)

Examples: `1.0.0`, `1.1.0`, `2.0.0` 