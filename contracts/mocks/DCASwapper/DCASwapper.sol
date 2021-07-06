// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.4;

import '../../DCASwapper/DCASwapper.sol';

contract DCASwapperMock is DCASwapper {
  constructor(
    address _governor,
    IDCAFactory _factory,
    ISwapRouter _router
  ) DCASwapper(_governor, _factory, _router) {}
}