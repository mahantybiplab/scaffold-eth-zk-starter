import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setup() {
  const buildDir = join(__dirname, "..", "build");

  // Get circuit name from CLI argument
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error(
      "❌ Please provide a circuit name: node trusted_setup.js <circuitName>"
    );
    process.exit(1);
  }
  const circuitName = args[0];

  console.log("🔧 Setting up trusted setup...");

  try {
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }

    // -------------------------------
    // 🔹 Phase 1: Powers of Tau
    // -------------------------------
    console.log("⚡ Phase 1: Powers of Tau ceremony");

    execSync(
      `snarkjs powersoftau new bn128 12 ${join(
        buildDir,
        "pot12_0000.ptau"
      )} -v`,
      { stdio: "inherit" }
    );
    execSync(
      `snarkjs powersoftau contribute ${join(
        buildDir,
        "pot12_0000.ptau"
      )} ${join(
        buildDir,
        "pot12_0001.ptau"
      )} --name="First contribution" -v -e="random entropy"`,
      { stdio: "inherit" }
    );
    execSync(
      `snarkjs powersoftau prepare phase2 ${join(
        buildDir,
        "pot12_0001.ptau"
      )} ${join(buildDir, "pot12_final.ptau")} -v`,
      { stdio: "inherit" }
    );

    // -------------------------------
    // 🔹 Phase 2: Circuit-specific
    // -------------------------------
    console.log("🔗 Phase 2: Circuit-specific setup");

    execSync(
      `snarkjs groth16 setup ${join(buildDir, `${circuitName}.r1cs`)} ${join(
        buildDir,
        "pot12_final.ptau"
      )} ${join(buildDir, `${circuitName}_0000.zkey`)}`,
      { stdio: "inherit" }
    );
    execSync(
      `snarkjs zkey contribute ${join(
        buildDir,
        `${circuitName}_0000.zkey`
      )} ${join(
        buildDir,
        `${circuitName}_0001.zkey`
      )} --name="Second contribution" -v -e="more random entropy"`,
      { stdio: "inherit" }
    );

    console.log("🔑 Exporting verification key...");
    execSync(
      `snarkjs zkey export verificationkey ${join(
        buildDir,
        `${circuitName}_0001.zkey`
      )} ${join(buildDir, "verification_key.json")}`,
      { stdio: "inherit" }
    );

    console.log("✅ Setup complete!");
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    process.exit(1);
  }
}

setup();