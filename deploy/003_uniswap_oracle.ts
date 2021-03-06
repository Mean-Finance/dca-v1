import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

enum FEE_TIER {
  LOW = 500,
  MEDIUM = 3000,
  HIGH = 10000,
}

const deployFunction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer, governor } = await hre.getNamedAccounts();

  const UNISWAP_V3_FACTORY_ADDRESS = '0x1F98431c8aD98523631AE4a59f267346ea31F984';

  await hre.deployments.deploy('UniswapOracle', {
    contract: 'contracts/UniswapV3Oracle/UniswapV3Oracle.sol:UniswapV3Oracle',
    from: deployer,
    args: [governor, UNISWAP_V3_FACTORY_ADDRESS],
    log: true,
  });

  await hre.deployments.execute('UniswapOracle', { from: governor, gasLimit: 200000 }, 'addFeeTier', FEE_TIER.LOW);

  await hre.deployments.execute('UniswapOracle', { from: governor, gasLimit: 200000 }, 'addFeeTier', FEE_TIER.MEDIUM);

  await hre.deployments.execute('UniswapOracle', { from: governor, gasLimit: 200000 }, 'addFeeTier', FEE_TIER.HIGH);
};

deployFunction.tags = ['UniswapOracle'];
deployFunction.dependencies = ['TokenDescriptor'];
export default deployFunction;
