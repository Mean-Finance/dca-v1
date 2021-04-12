// SPDX-License-Identifier: MIT

pragma solidity 0.7.0;

import 'hardhat/console.sol';

import '../../DCAPair/DCAPairSwapHandler.sol';
import './DCAPairParameters.sol';

contract DCAPairSwapHandlerMock is DCAPairSwapHandler, DCAPairParametersMock {
  constructor(
    IERC20Decimals _token0,
    IERC20Decimals _token1,
    IUniswapV2Router02 _uniswap,
    IDCAFactory _factory,
    ISlidingOracle _oracle,
    uint256 _swapInterval
  ) DCAPairParametersMock(_token0, _token1, _uniswap) DCAPairSwapHandler(_factory, _oracle, _swapInterval) {
    /* */
  }

  // SwapHandler
  function setSwapInterval(uint256 _swapInterval) public override {
    _setSwapInterval(_swapInterval);
  }

  function setOracle(ISlidingOracle _oracle) public override {
    _setOracle(_oracle);
  }

  function registerSwap(
    address _token,
    uint256 _internalAmountUsedToSwap,
    uint256 _ratePerUnit,
    uint256 _swapToRegister
  ) public {
    _registerSwap(_token, _internalAmountUsedToSwap, _ratePerUnit, _swapToRegister);
  }

  function getAmountToSwap(address _tokenAddress, uint256 _swap) public view returns (uint256) {
    return _getAmountToSwap(_tokenAddress, _swap);
  }

  function addNewRatePerUnit(
    address _tokenAddress,
    uint256 _swap,
    uint256 _ratePerUnit
  ) public {
    _addNewRatePerUnit(_tokenAddress, _swap, _ratePerUnit);
  }

  function swap() public override {
    _swap();
  }

  // Mocks setters
  function setRatePerUnit(
    address _tokenAddress,
    uint256 _swap,
    uint256 _rate,
    uint256 _rateMultiplier
  ) public {
    accumRatesPerUnit[_tokenAddress][_swap] = [_rate, _rateMultiplier];
  }

  function setSwapAmountAccumulator(address _tokenAddress, uint256 _swapAmountAccumulator) public {
    swapAmountAccumulator[_tokenAddress] = _swapAmountAccumulator;
  }

  function setLastSwapPerformed(uint256 _lastSwapPerformend) public {
    lastSwapPerformed = _lastSwapPerformend;
  }

  function setPerformedSwaps(uint256 _performedSwaps) public {
    performedSwaps = _performedSwaps;
  }
}