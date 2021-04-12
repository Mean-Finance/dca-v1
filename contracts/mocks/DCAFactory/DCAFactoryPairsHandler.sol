// SPDX-License-Identifier: MIT

pragma solidity 0.7.0;

import '../../DCAFactory/DCAFactoryPairsHandler.sol';
import './DCAFactoryParameters.sol';

contract DCAFactoryPairsHandlerMock is DCAFactoryParametersMock, DCAFactoryPairsHandler {
  constructor(address _feeRecipient, IUniswapV2Router02 _uniswap) DCAFactoryParametersMock(_feeRecipient, _uniswap) {}

  function createPair(
    address _from,
    address _to,
    uint256 _swapInterval
  ) external override returns (address _pair) {
    _pair = _createPair(_from, _to, _swapInterval);
  }
}