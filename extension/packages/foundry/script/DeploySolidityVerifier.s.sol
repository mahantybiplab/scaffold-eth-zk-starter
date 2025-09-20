// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";

import "../contracts/solidityVerifier.sol";

contract DeploySolidityVerifier is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        new Groth16Verifier();
    }
}
