const fs = require('fs');
const path = require('path');

// Read the current app.json
const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Increment version code
const currentVersionCode = appJson.expo.android.versionCode;
appJson.expo.android.versionCode = currentVersionCode + 1;

// Increment version (optional - you can modify this logic)
const currentVersion = appJson.expo.version;
const versionParts = currentVersion.split('.');
versionParts[2] = (parseInt(versionParts[2]) + 1).toString();
appJson.expo.version = versionParts.join('.');

// Write back to app.json
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

console.log(`Updated version to ${appJson.expo.version} (versionCode: ${appJson.expo.android.versionCode})`); 