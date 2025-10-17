import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedPredictionMarket = await deploy("EncryptedPredictionMarket", {
    from: deployer,
    log: true,
  });

  console.log(`EncryptedPredictionMarket contract: `, deployedPredictionMarket.address);
};
export default func;
func.id = "deploy_encrypted_prediction_market"; // id required to prevent reexecution
func.tags = ["EncryptedPredictionMarket"];
