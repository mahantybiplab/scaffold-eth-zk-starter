import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get circuit name from CLI argument
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(
    "❌ Please provide a circuit name: node generate_proof.js <circuitName>"
  );
  process.exit(1);
}
const circuitName = args[0];

const buildDir = join(__dirname, "../build");
const zkeyFile = join(buildDir, `${circuitName}_0001.zkey`);
const witnessFile = join(buildDir, "witness.wtns");
const proofFile = join(buildDir, "proof.json");
const publicFile = join(buildDir, "public.json");

function run(cmd) {
  console.log("▶️", cmd);
  execSync(cmd, { stdio: "inherit" });
}

run(
  `snarkjs groth16 prove "${zkeyFile}" "${witnessFile}" "${proofFile}" "${publicFile}"`
);

console.log("✅ Proof generated:", proofFile, publicFile);
