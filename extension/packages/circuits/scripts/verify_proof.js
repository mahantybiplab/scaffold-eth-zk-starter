import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buildDir = join(__dirname, "../build");
const verification_key_json = join(buildDir, "verification_key.json");
const proofFile = join(buildDir, "proof.json");
const publicFile = join(buildDir, "public.json");

function run(cmd) {
  console.log("▶️", cmd);
  execSync(cmd, { stdio: "inherit" });
}

run(`snarkjs groth16 verify "${verification_key_json}" "${publicFile}" "${proofFile}" `);

console.log("✅ Proof Verified");