// scripts/export_verifier.mjs
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Exports a Solidity verifier contract from a zkey file.
 * @param {string} zkeyPath - Path to the .zkey file
 * @param {string} outputPath - Path where the Solidity contract will be saved
 */
function exportSolidityVerifier(zkeyPath, outputPath) {
  try {
    console.log(`▶️ Exporting Solidity verifier from ${zkeyPath} → ${outputPath}`);
    execSync(`snarkjs zkey export solidityverifier "${zkeyPath}" "${outputPath}"`, { stdio: "inherit" });
    console.log("✅ Solidity verifier generated successfully!");
  } catch (err) {
    console.error("❌ Failed to export Solidity verifier:", err);
    process.exit(1);
  }
}

// Example usage

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
const zkeyFile = join(buildDir, `${circuitName}_0001.zkey`);
const verifierFile = join(buildDir, "../../foundry/contracts/solidityVerifier.sol");

exportSolidityVerifier(zkeyFile, verifierFile);