import { useState } from "react";
import { groth16 } from "snarkjs";

export function useMultiplierProof() {
  const [proof, setProof] = useState<any>(null);

  const [publicSignals, setPublicSignals] = useState<string[] | null>(null);

  async function generateProof(a: string, b: string) {
    try {
      const { proof: generatedProof, publicSignals: generatedSignals } = await groth16.fullProve(
        { a, b },

        "/circuits/multiplier2_js/multiplier2.wasm",

        "/circuits/multiplier2_js/multiplier2_0001.zkey",
      );

      setProof(generatedProof);

      setPublicSignals(generatedSignals);

      return { proof: generatedProof, publicSignals: generatedSignals };
    } catch (err) {
      console.error("Error generating proof:", err);

      return null;
    }
  }

  return { proof, publicSignals, generateProof };
}
