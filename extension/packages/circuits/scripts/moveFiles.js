import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Recreate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source files
const wasmFile = path.join(
  __dirname,
  "../build/multiplier2_js/multiplier2.wasm"
);
const zkeyFile = path.join(__dirname, "../build/multiplier2_0001.zkey");

// Destination folder
const destDir = path.join(__dirname, "../../nextjs/public/circuits/multiplier2_js");

// Ensure destination folder exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Move files function
function moveFile(src, destFolder) {
  const fileName = path.basename(src);
  const dest = path.join(destFolder, fileName);

  fs.rename(src, dest, (err) => {
    if (err) throw err;
    console.log(`Moved ${fileName} to ${destFolder}`);
  });
}

// Move both files
moveFile(wasmFile, destDir);
moveFile(zkeyFile, destDir);
