import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get circuit name from CLI argument
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(
    "❌ Please provide a circuit name: node circom-compile.js <circuitName>"
  );
  process.exit(1);
}
const circuitName = args[0];

function run(cmd) {
  console.log("▶️", cmd);
  execSync(cmd, { stdio: "inherit" });
}

function compileCircuit() {
  try {
    const buildDir = join(__dirname, "../build");
    const circomFile = join(__dirname, `../${circuitName}.circom`);

    // Make sure the build directory exists
    run(`mkdir -p "${buildDir}"`);

    // Compile the circuit
    run(`circom "${circomFile}" --r1cs --wasm --sym -o "${buildDir}"`);

    console.log(`✅ Circuit ${circuitName} compiled successfully!`);
    console.log(`📁 Output directory: ${buildDir}`);
  } catch (err) {
    console.error("❌ Circuit compilation failed:", err);
    process.exit(1);
  }
}

// Run the compiler
compileCircuit();