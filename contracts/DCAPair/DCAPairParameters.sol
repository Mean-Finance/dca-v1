// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.4;

import 'hardhat/console.sol';

import '../utils/Math.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

import '../interfaces/IDCAGlobalParameters.sol';
import '../interfaces/IERC20Detailed.sol';
import '../interfaces/IDCAPair.sol';

abstract contract DCAPairParameters is IDCAPairParameters {
  uint24 public constant override FEE_PRECISION = 10000; // TODO: Take from global parameters in initiation

  // Internal constants
  uint256 internal _magnitudeA;
  uint256 internal _magnitudeB;

  // Basic setup
  IDCAGlobalParameters public override globalParameters;
  IERC20Detailed public override tokenA;
  IERC20Detailed public override tokenB;

  // Tracking
  mapping(address => mapping(uint32 => int256)) public override swapAmountDelta;
  mapping(uint256 => DCA) public override userPositions;
  uint32 public override performedSwaps; // Note: If we had swaps every minute, for 100 years, uint32 would still cover it
  mapping(address => mapping(uint32 => uint256[2])) internal _accumRatesPerUnit;
  mapping(address => uint256) internal _balances;

  constructor(
    IDCAGlobalParameters _globalParameters,
    IERC20Detailed _tokenA,
    IERC20Detailed _tokenB
  ) {
    require(address(_globalParameters) != address(0), 'DCAPair: zero address');
    require(address(_tokenA) != address(0), 'DCAPair: zero address');
    require(address(_tokenB) != address(0), 'DCAPair: zero address');
    globalParameters = _globalParameters;
    tokenA = _tokenA;
    tokenB = _tokenB;
    _magnitudeA = 10**_tokenA.decimals();
    _magnitudeB = 10**_tokenB.decimals();
  }

  function _getSwapFeeFromAmount(uint256 _amount) internal view returns (uint256) {
    uint32 _protocolFee = globalParameters.swapFee();
    return _getFeeFromAmount(_protocolFee, _amount);
  }

  function _getFeeFromAmount(uint32 _feeAmount, uint256 _amount) internal pure returns (uint256) {
    (bool _ok, uint256 _fee) = Math.tryMul(_amount, _feeAmount);
    if (_ok) {
      _fee = _fee / FEE_PRECISION / 100;
    } else {
      _fee = (_feeAmount < FEE_PRECISION) ? ((_amount / FEE_PRECISION) * _feeAmount) / 100 : (_amount / FEE_PRECISION / 100) * _feeAmount;
    }
    return _fee;
  }
}
