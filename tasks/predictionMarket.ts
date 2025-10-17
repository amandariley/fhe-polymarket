import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:market-address", "Prints the EncryptedPredictionMarket address").setAction(
  async function (_taskArguments: TaskArguments, hre) {
    const { deployments } = hre;

    const deployment = await deployments.get("EncryptedPredictionMarket");

    console.log(`EncryptedPredictionMarket address is ${deployment.address}`);
  },
);

task("task:register", "Registers the caller and mints encrypted points")
  .addOptionalParam("address", "Optionally specify the contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const deployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("EncryptedPredictionMarket");

    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("EncryptedPredictionMarket", deployment.address);

    const tx = await contract.connect(signer).register();
    console.log(`Waiting for register tx: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Register status: ${receipt?.status}`);
  });

task("task:create-prediction", "Creates a new prediction")
  .addParam("title", "Prediction title")
  .addParam("options", "Comma separated list of options (1-4 entries)")
  .addOptionalParam("address", "Optionally specify the contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const rawOptions = String(taskArguments.options)
      .split(",")
      .map((entry: string) => entry.trim())
      .filter((entry: string) => entry.length > 0);

    if (rawOptions.length === 0 || rawOptions.length > 4) {
      throw new Error("You must provide between 1 and 4 options");
    }

    const deployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("EncryptedPredictionMarket");

    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("EncryptedPredictionMarket", deployment.address);

    const tx = await contract.connect(signer).createPrediction(taskArguments.title, rawOptions);
    console.log(`Waiting for createPrediction tx: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`createPrediction status: ${receipt?.status}`);
  });

task("task:place-bet", "Places an encrypted bet on a prediction")
  .addParam("prediction", "Prediction identifier")
  .addParam("choice", "Option index to bet on (numeric)")
  .addOptionalParam("address", "Optionally specify the contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const predictionId = parseInt(taskArguments.prediction, 10);
    if (!Number.isInteger(predictionId) || predictionId < 0) {
      throw new Error("--prediction must be a positive integer");
    }

    const choiceValue = parseInt(taskArguments.choice, 10);
    if (!Number.isInteger(choiceValue) || choiceValue < 0) {
      throw new Error("--choice must be a non-negative integer");
    }

    await fhevm.initializeCLIApi();

    const deployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("EncryptedPredictionMarket");

    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("EncryptedPredictionMarket", deployment.address);

    const encryptedInput = await fhevm
      .createEncryptedInput(deployment.address, signer.address)
      .add32(choiceValue)
      .encrypt();

    const tx = await contract
      .connect(signer)
      .placeBet(predictionId, encryptedInput.handles[0], encryptedInput.inputProof);

    console.log(`Waiting for placeBet tx: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`placeBet status: ${receipt?.status}`);
  });

task("task:decrypt-balance", "Decrypts the encrypted balance of a user")
  .addOptionalParam("target", "Address to inspect. Defaults to first signer")
  .addOptionalParam("address", "Optionally specify the contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const deployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("EncryptedPredictionMarket");

    const [signer] = await ethers.getSigners();
    const target = taskArguments.target ? await ethers.getAddress(taskArguments.target) : signer.address;

    const contract = await ethers.getContractAt("EncryptedPredictionMarket", deployment.address);
    const encryptedBalance = await contract.getEncryptedBalance(target);

    if (encryptedBalance === ethers.ZeroHash) {
      console.log("Encrypted balance: 0x0");
      console.log("Clear balance   : 0");
      return;
    }

    const clearBalance = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedBalance,
      deployment.address,
      signer,
    );

    console.log(`Encrypted balance: ${encryptedBalance}`);
    console.log(`Clear balance   : ${clearBalance}`);
  });
