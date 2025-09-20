
I assume you have already installed  [rust](https://www.rust-lang.org/tools/install) and [circom](https://docs.circom.io/getting-started/installation/) , ai will be very handy in it if you are facing problem in installing.

## What is Zero-Knowledge Proof?

Imagine you know a **secret password** but you don’t want to tell anyone.  
Instead, you want to **prove that you know it**.

Zero-Knowledge Proofs (ZKPs) allow you to prove knowledge of something (like a password, a solution to a puzzle, or a computation) **without revealing the secret itself**.

ZKPs shine in problems where _verification is easy_ but _finding the solution is hard_.
One of such problem is to  prove a transaction is valid (you have enough balance and no double-spend) without revealing sender, receiver, or amount — this is how **Zcash enables private payments** on a public blockchain.

Btw, what are the characteristics of ZKPs ?

## Properties of ZKPs

### 1. **Completeness** ✅

If the statement is true and the prover follows the protocol honestly, the verifier will be convinced.  
👉 Example: If you really know the password, you can always convince the verifier.

### 2. **Soundness** 🔒

If the statement is false, no cheating prover can trick the verifier into accepting (except with negligible probability).  
👉 Example: If you don’t know the password, you can’t fake your way through the proof.

### 3. **Zero-Knowledge** 🤫

The proof reveals nothing beyond the fact that the statement is true.  
👉 Example: You prove you know the password without actually showing the password.

⚡ In short: **ZKPs convince (completeness), can’t be cheated (soundness), and don’t leak secrets (zero-knowledge).**

## Write ZKPs without  overwhelmed by it's underlying mathematics

At their core, ZKPs are proofs about **mathematical statements** — they rely on algebra (polynomials, modular arithmetic, elliptic curves) to create constraints that can be checked efficiently. Writing ZKPs in math ensures **rigor, security, and verifiability**, since computers can’t “trust” plain words, only precise mathematical rules.

Since not everyone is fond of mathematics, writing ZKPs directly in math can be complex. This is where Circom comes to the rescue — it allows you to design circuits (constraints) in a simple, programming-like way, enabling you to build and prove custom ZKPs (such as password checks or private transactions) without hand-crafting all the cryptography.

Circom helps us **design these proofs** as circuits.

##  Writing circuits

From the above statements you may have understood that A **Zero-Knowledge Proof (ZKP)** is a cryptographic protocol where a _prover_ convinces a _verifier_ that a certain **computation** has been carried out correctly on some private input, without revealing that input itself.

### Circuits

- A **circuit** in Circom is like a **blueprint of a computation**.
- It defines **what needs to be computed** step by step (like adding, multiplying, hashing, etc.).
- Example: a circuit could describe “take two numbers, multiply them, and compare with a third number.”

### Witness

A **witness** is the collection of all **secret (private) inputs** and **intermediate values** that satisfy the circuit’s constraints.

The **witness** includes **all values** that flow through the circuit:

1. **Private inputs** (known only to the prover).
2. **Public inputs** (shared with the verifier).
3. **Intermediate signals** (values computed inside the circuit).
### Constraints

- **Constraints** are the **rules** that must always hold true inside the circuit.
- They ensure the prover can’t cheat by plugging in random values.
- Example: if the circuit says `a * b = c`, then the constraint forces the witness values of `a`, `b`, and `c` to actually satisfy that equation.


In our `multiplier2.circom` :
```circom
pragma circom 2.0.0;

/*This circuit template checks that c is the multiplication of a and b.*/  

template Multiplier2 () {  

   // Declaration of signals.  
   signal input a;  
   signal input b;  
   signal output c;  

   // Constraints.  
   c <== a * b;  
}

component main = Multiplier2();
```

- `pragma circom 2.0.0;`- defines the version of Circom being used
- `template Multiplier()` - templates are the equivalent to objects in most programming languages, a common form of abstraction
- `signal input a;` - our first input, `a`; inputs are private by default
- `signal input b;` - our second input, `b`; also private by default
- `signal output c;` - our output, `c`; outputs are always public
- `c <== a * b;` - this does two things: assigns the signal `c` a value _and_ constrains `c` to be equal to the product of `a` and `b`
- `component main = Multiplier2()` - instantiates our main component

 A constraint in Circom can only use operations involving constants, addition or multiplication. It enforces that both sides of the equation must be equal.

## Some useful commands 

You have to run all of these commands from the `root directory`.

```bash
// to compile the circuit
yarn circom-compile <circuitName> //  <circuitName> is multiplier2

// to generate the witness
yarn generate-witness <circuitName>

// to run the trusted setup
yarn trusted-setup <circuitName>

// to generate proof 
yarn generate-proof <circuitName>

// to verify proof
yarn verify-proof

// to generate solidity smart contract verifier
yarn generate-sol-verifier <circuitName>

// This command runs the full zk workflow from compilation to Solidity verifier in one go.
yarn zk-pipeline <circuitName>

// to remove the build file
yarn circom-clean

```


**Each of the commands above abstracts the full underlying commands shown in the sections below.**
## Compiling the circuit

Now is time to compile the circuit to get a system of arithmetic equations representing it. As a result of the compilation we will also obtain programs to compute the witness. We can compile the circuit with the following command:

```bash
circom multiplier2.circom --r1cs --wasm --sym 
```

With these options we generate three types of files:

- `--r1cs`: it generates the file `multiplier2.r1cs` that contains the `R1CS constraint system` (In this system, a constraint  can only use operations involving constants, addition or multiplication.) of the circuit in binary format.

- `--wasm`: it generates the directory `multiplier2_js` that contains the `Wasm` code (multiplier2.wasm) and other files needed to generate the `witness` .

- `--sym` : it generates the file `multiplier2.sym` , a symbols file required for debugging or for printing the constraint system in an annotated mode.

We can use the option `-o` to specify the directory where these files are created.

You will get an error if the file name is  `Multiplier2.circom` .
## Computing our witness

Before creating the proof, we need to calculate all the `signals` (A **signal** is a variable that carries a value inside the circuit.) of the circuit that match all the constraints of the circuit. For that, we will use the `Wasm` module generated by`circom` that helps to do this job.

In our case, we want to prove that we are able to factor the number 33. So, we assign `a = 3` and `b = 11`.

Note that we could assign the number 1 to one of the inputs and the number 33 to the other. So, our proof does not really show that we are able to factor the number 33.

**Challenge: Can you create a constraint for inputs a and b such that neither a nor b can be 1 or 33? Do it after completing the guide.**

We need to create a file named `input.json` containing the inputs written in the standard json format.

We use strings instead of numbers because JavaScript does not work accurately with integers larger than 253.

```text
{"a": "3", "b": "11"}
```

Now, we calculate the witness and generate a binary file `witness.wtns` containing it in a format accepted by `snarkjs`.

After calling the `circom` compiler with the flag `--wasm` and the circuit `multiplier2.circom` we can find a `multiplier2_js` folder that contains the `Wasm` code in multiplier2.wasm and all the needed `JavaScript` files.

### Computing the witness with WebAssembly


```bash
node ./multiplier2_js/generate_witness.js ./multiplier2_js/multiplier2.wasm input.json witness.wtns
```


## Proving circuits

After compiling the circuit and running the witness calculator with an appropriate input, we will have a file with extension .wtns that contains all the computed signals and, a file with extension .r1cs that contains the constraints describing the circuit. Both files will be used to create our proof.

Now, we will use the `snarkjs` tool to generate and validate a proof for our input. In particular, using the multiplier2, **we will prove that we are able to provide the two factors of the number 33**. That is, we will show that we know two integers `a` and `b` such that when we multiply them, it results in the number 33.

### Some useful terms

#### 🔹 zk-SNARK

- Stands for **Zero-Knowledge Succinct Non-Interactive Argument of Knowledge**.
- A ZK proof system that is:
    
    - **Succinct** → proofs are very small and quick to verify.
    - **Non-interactive** → prover and verifier don’t need back-and-forth communication, just one proof.
    - **Zero-Knowledge** → reveals nothing except validity.
    - **Argument of Knowledge** → ensures the prover really knows the secret.

👉 Used in systems like **Zcash** for private payments.

#### 🔹 Groth16

- A specific **zk-SNARK proving algorithm**, created in 2016.
    
- Known for being **highly efficient**:
    
    - Proofs are only about **200–300 bytes**.
    - Verification takes only a few milliseconds.

- Limitation → requires a **trusted setup**.


#### 🔹 Trusted Setup

Some zk-SNARK protocols, like Groth16, need a special preparation step before they can be used. This step is called the _trusted setup_. In it, cryptographic keys are generated: a proving key for the prover and a verification key for the verifier. These keys make the protocol efficient and secure. The reason it’s called _trusted_ is that during setup, temporary secret randomness is created, and it must be destroyed afterwards — otherwise, someone could generate fake proofs. That’s why we need a trusted setup.


We are going to use the Groth16  zk-SNARK protocol. To use this protocol, you will need to generate a trusted setup . **Groth16 requires a per circuit trusted setup**. In more detail, the trusted setup consists of 2 parts:

- The powers of tau, which is independent of the circuit, it's a one time setup.
- The phase 2, which depends on the circuit i.e. on changing the circuit we need to do it again.

### Powers of Tau

First, we start a new "powers of tau" ceremony:

```text
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
```

Then, we contribute to the ceremony:

```text
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v
```

Now, we have the contributions to the powers of tau in the file _pot12_0001.ptau_ and we can proceed with the Phase 2.

### Phase 2

The **phase 2** is **circuit-specific**. Execute the following command to start the generation of this phase:

```text
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
```

Next, we generate a `.zkey` file that will contain the proving and verification keys together with all phase 2 contributions. Execute the following command to start a new zkey:

```text
snarkjs groth16 setup multiplier2.r1cs pot12_final.ptau multiplier2_0000.zkey
```

Contribute to the phase 2 of the ceremony:

```text
snarkjs zkey contribute multiplier2_0000.zkey multiplier2_0001.zkey --name="1st Contributor Name" -v
```

Export the verification key:

```text
snarkjs zkey export verificationkey multiplier2_0001.zkey verification_key.json
```

## Generating a Proof

Once the witness is computed and the trusted setup is already executed, we can **generate a zk-proof** associated to the circuit and the witness:

```text
snarkjs groth16 prove multiplier2_0001.zkey witness.wtns proof.json public.json
```

This command generates a Groth16 proof and outputs two files:

- `proof.json`: it contains the proof.
- `public.json`: it contains the values of the public inputs and outputs.


## Verifying a Proof

To **verify the proof**, execute the following command:

```text
snarkjs groth16 verify verification_key.json public.json proof.json
```

The command uses the files `verification_key.json` we exported earlier,`proof.json` and `public.json` to check if the proof is valid. If the proof is valid, the command outputs an `OK`.

A valid proof not only proves that we know a set of signals that satisfy the circuit, but also that the public inputs and outputs that we use match the ones described in the `public.json` file.

## Verifying from a Smart Contract

👉 It is also possible to generate a **Solidity verifier** that allows **verifying proofs on Ethereum blockchain**.

First, we need to generate the Solidity code using the command:

```text
snarkjs zkey export solidityverifier multiplier2_0001.zkey verifier.sol
```

This command takes validation key `multiplier2_0001.zkey` and outputs Solidity code in a file named `verifier.sol`.  


The `Verifier` has a `view` function called `verifyProof` that returns `TRUE` if and only if the proof and the inputs are valid. To facilitate the call, you can use `snarkJS` to generate the parameters of the call by typing:

```text
snarkjs generatecall
```

The above command will produce something like this:
```bash
["0x2693554aeaa92915a78a06122a3f4783d1061d79cd04a13c84da854abdbeeb76", "0x04795913303a26dfe8f061ceb1043835e60148e244b7a66edccf31df90a112f5"],[["0x25ab17d36c3c229cdc5720706fd3f4f13ad49584db81d650d62683094f659e19", "0x27e163ec5c14433855e095351b5555a228e41db738fe1528ce6de0dd50801c03"],["0x031c594380f8e1616bf2941ef4c79be8689c49f5b5d6b7c52da460bb5825c9a2", "0x08885c116c8d0159fdaaefb8a0edfbce0d44d8cdbbd7907088e36754dad1319c"]],["0x121aba29364591f627a4d3a8a5f401451c35c6944fa54d61145a1f2eab0fc210", "0x093d77ab31633dfc47cf6f496136de1edd3185433ded102089d9fd050b0e7334"],["0x0000000000000000000000000000000000000000000000000000000000000021"]
```

After deploying the contract , take the address of the contract and verify  if the proof and the inputs are valid using `foundry cast` . 

The command to do so will be like this:
```bash
cast call <CONTRACT_ADDRESS> \
--rpc-url http://127.0.0.1:8545 \
"verifyProof(uint[2],uint[2][2],uint[2],uint[1])(bool)" \
"[0x2693554aeaa92915a78a06122a3f4783d1061d79cd04a13c84da854abdbeeb76,0x04795913303a26dfe8f061ceb1043835e60148e244b7a66edccf31df90a112f5]" \
"[[0x25ab17d36c3c229cdc5720706fd3f4f13ad49584db81d650d62683094f659e19,0x27e163ec5c14433855e095351b5555a228e41db738fe1528ce6de0dd50801c03],[0x031c594380f8e1616bf2941ef4c79be8689c49f5b5d6b7c52da460bb5825c9a2,0x08885c116c8d0159fdaaefb8a0edfbce0d44d8cdbbd7907088e36754dad1319c]]" \
"[0x121aba29364591f627a4d3a8a5f401451c35c6944fa54d61145a1f2eab0fc210,0x093d77ab31633dfc47cf6f496136de1edd3185433ded102089d9fd050b0e7334]" \
"[0x0000000000000000000000000000000000000000000000000000000000000021]"
```

If everything works fine, this method should return `TRUE`. You can try to change just a single bit of the parameters, and you will see that the result is verifiable `FALSE`.


## Conclusion

At a high level, you now understand how to use Circom to create circuits for zero-knowledge proofs (ZKPs).  If you want to deep dive ZKPs then I have some resources for you. It will be a  long journey so don't hurry to finish all the resources, take your time, be curios , know how you learn best and then double down on that method of learning, ask questions , join communities . Hurrying only cause delay , it's coming from my own experience, so plz listen . 

### Learn Math Prerequisites

1. Learn some basics linear algebra 
2. In parallel, learn maths  from [Extropy Essential Maths](https://academy.extropy.io/pages/courses/zkmaths-landing.html) and [Math foundations section rareskill zkBook](https://rareskills.io/zk-book)
### Build core understanding of zkPs
1. [Rareskill Zkbook](https://rareskills.io/zk-book)

After completing Rareskill ZkBook you can choose your own path. 
Live a free life  ✨


