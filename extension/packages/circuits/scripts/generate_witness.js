import fs from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Get circuit name from CLI argument
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(
    "❌ Please provide a circuit name: node generate-witness.js <circuitName>"
  );
  process.exit(1);
}
const circuitName = args[0];


const buildDir = join(__dirname, "../build");
const wasmDir = join(buildDir, `${circuitName}_js`);
const wasmFile = join(wasmDir, `${circuitName}.wasm`);
const wcCjs = join(wasmDir, "witness_calculator.cjs");
const oldFile = join(wasmDir, "witness_calculator.js");

if (fs.existsSync(oldFile)) {
  fs.renameSync(oldFile, wcCjs);
  console.log("✅ Renamed witness_calculator.js → witness_calculator.cjs");
}


async function generateWitness() {
  
  const input = JSON.parse(fs.readFileSync("input.json", "utf8"));
  const buffer = fs.readFileSync(wasmFile);

  const wc = require(wcCjs);

  // witness calculator instance
  const witnessCalculator = await wc(buffer);

  // generate witness binary
  const wtns = await witnessCalculator.calculateWTNSBin(input, false);
  fs.writeFileSync(join(buildDir, "witness.wtns"), Buffer.from(wtns));

  console.log("✅ Witness generated: witness.wtns");
}

generateWitness().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});