// Reference the example args file: https://github.com/scaffold-eth/create-eth-extensions/blob/example/extension/packages/foundry/script/Deploy.s.sol.args.mjs
// Reference the template file that will use this file: https://github.com/scaffold-eth/create-eth/blob/main/templates/solidity-frameworks/foundry/packages/foundry/script/Deploy.s.sol.template.mjs

// Default args:
export const preContent = `import { DeployYourContract } from "./DeployYourContract.s.sol";`;
export const deploymentsLogic = `
    DeployYourContract deployYourContract = new DeployYourContract();
    deployYourContract.run();
  `;
