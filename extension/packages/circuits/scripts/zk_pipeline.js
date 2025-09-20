import fs from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

function run(cmd) {
  console.log("▶️", cmd);
  execSync(cmd, { stdio: "inherit" });
}

// Get circuit name from CLI argument
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("❌ Please provide a circuit name: node zk-pipeline.mjs <circuitName>");
  process.exit(1);
}
const circuitName = args[0];

const buildDir = join(__dirname, "../build");
const wasmDir = join(buildDir, `${circuitName}_js`);
const wasmFile = join(wasmDir, `${circuitName}.wasm`);
const wcCjs = join(wasmDir, "witness_calculator.cjs");
const inputFile = join(__dirname, "../input.json");
const witnessFile = join(buildDir, "witness.wtns");
const zkeyFile = join(buildDir, `${circuitName}_0001.zkey`);
const proofFile = join(buildDir, "proof.json");
const publicFile = join(buildDir, "public.json");
const vkeyFile = join(buildDir, "verification_key.json");
const verifierFile = join(buildDir, "../../foundry/contracts/solidityVerifier.sol");

async function main() {
  try {
    // 1️⃣ Compile circuit
    run(`yarn circom-compile ${circuitName}`);

    // 2️⃣ Trusted setup
    run(`yarn trusted-setup ${circuitName}`);

    // 3️⃣ Rename witness_calculator.js to .cjs if needed
    
    const oldWc = join(wasmDir, "witness_calculator.js");
    if (fs.existsSync(oldWc)) {
      fs.renameSync(oldWc, wcCjs);
      console.log("✅ Renamed witness_calculator.js → witness_calculator.cjs");
    }

    // 4️⃣ Generate witness
    console.log("🔧 Generating witness...");
    const wc = require(wcCjs);
    const buffer = fs.readFileSync(wasmFile);
    const input = JSON.parse(fs.readFileSync(inputFile, "utf8"));
    const witnessCalculator = await wc(buffer);
    const wtns = await witnessCalculator.calculateWTNSBin(input, false);
    fs.writeFileSync(witnessFile, Buffer.from(wtns));
    console.log(`✅ Witness generated: ${witnessFile}`);

    // 5️⃣ Generate proof
    run(`snarkjs groth16 prove "${zkeyFile}" "${witnessFile}" "${proofFile}" "${publicFile}"`);

    // 6️⃣ Verify proof
    run(`snarkjs groth16 verify "${vkeyFile}" "${publicFile}" "${proofFile}"`);

    // 7️⃣ Export Solidity verifier
    run(`snarkjs zkey export solidityverifier "${zkeyFile}" "${verifierFile}"`);

    console.log("🎉 ZK pipeline completed successfully!");
    console.log(`📄 Solidity verifier: ${verifierFile}`);

  } catch (err) {
    console.error("❌ ZK pipeline failed:", err);
    process.exit(1);
  }
}

main();