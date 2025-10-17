import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { EncryptedPredictionMarket, EncryptedPredictionMarket__factory } from "../types";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory(
    "EncryptedPredictionMarket",
  )) as EncryptedPredictionMarket__factory;
  const contract = (await factory.deploy()) as EncryptedPredictionMarket;
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("EncryptedPredictionMarket", function () {
  let signers: Signers;
  let contract: EncryptedPredictionMarket;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn("Skipping EncryptedPredictionMarket tests on non-mock network");
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  it("registers a user with encrypted balance", async function () {
    const tx = await contract.connect(signers.alice).register();
    await tx.wait();

    const balanceCipher = await contract.getEncryptedBalance(signers.alice.address);
    expect(balanceCipher).to.not.eq(ethers.ZeroHash);

    const clearBalance = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      balanceCipher,
      contractAddress,
      signers.alice,
    );

    expect(clearBalance).to.eq(100);

    const remainingBets = await contract.getRemainingBets(signers.alice.address);
    expect(remainingBets).to.eq(10);

    const isRegistered = await contract.isRegistered(signers.alice.address);
    expect(isRegistered).to.eq(true);
  });

  it("creates predictions with up to four options", async function () {
    await contract.connect(signers.alice).register();

    const createTx = await contract
      .connect(signers.alice)
      .createPrediction("Election", ["Alice", "Bob", "Charlie"]);
    await createTx.wait();

    const count = await contract.getPredictionCount();
    expect(count).to.eq(1);

    const prediction = await contract.getPrediction(0);
    expect(prediction[0]).to.eq("Election");
    expect(prediction[1]).to.deep.eq(["Alice", "Bob", "Charlie"]);
    expect(prediction[2]).to.eq(signers.alice.address);
  });

  it("stores encrypted bets and updates balances", async function () {
    await contract.connect(signers.alice).register();
    await contract.connect(signers.alice).createPrediction("Weather", ["Sun", "Rain"]);

    const encryptedChoice = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(1)
      .encrypt();

    const betTx = await contract
      .connect(signers.alice)
      .placeBet(0, encryptedChoice.handles[0], encryptedChoice.inputProof);
    await betTx.wait();

    const hasBet = await contract.hasUserBet(0, signers.alice.address);
    expect(hasBet).to.eq(true);

    const remainingBets = await contract.getRemainingBets(signers.alice.address);
    expect(remainingBets).to.eq(9);

    const updatedPrediction = await contract.getPrediction(0);
    expect(updatedPrediction[4]).to.eq(1);

    const balanceCipher = await contract.getEncryptedBalance(signers.alice.address);
    const clearBalance = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      balanceCipher,
      contractAddress,
      signers.alice,
    );
    expect(clearBalance).to.eq(90);

    const choiceCipher = await contract.getUserEncryptedChoice(0, signers.alice.address);
    const choiceClear = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      choiceCipher,
      contractAddress,
      signers.alice,
    );
    expect(choiceClear).to.eq(1);

    const amountCipher = await contract.getUserEncryptedBetAmount(0, signers.alice.address);
    const amountClear = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      amountCipher,
      contractAddress,
      signers.alice,
    );
    expect(amountClear).to.eq(10);
  });
});
