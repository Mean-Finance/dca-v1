// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.4;

import '../DCAPair/DCAPair.sol';
import '../interfaces/IERC20Detailed.sol';
import '../interfaces/IDCAFactory.sol';
import '../interfaces/IDCAGlobalParameters.sol';

abstract contract DCAFactoryPairsHandler is IDCAFactoryPairsHandler {
  mapping(address => mapping(address => mapping(uint32 => address))) public override pairByTokensAndSwapInterval;
  mapping(address => mapping(address => address[])) public override pairsByTokens;
  address[] public override allPairs;
  IDCAGlobalParameters public override globalParameters;

  constructor(IDCAGlobalParameters _globalParameters) {
    require(address(_globalParameters) != address(0), 'DCAFactory: zero address');
    globalParameters = _globalParameters;
  }

  function _sortTokens(address _tokenA, address _tokenB) internal pure returns (address _token0, address _token1) {
    (_token0, _token1) = _tokenA < _tokenB ? (_tokenA, _tokenB) : (_tokenB, _tokenA);
  }

  function getPairByTokensAndSwapInterval(
    address _tokenA,
    address _tokenB,
    uint32 _swapInterval
  ) external view override returns (address _pair) {
    (address _token0, address _token1) = _sortTokens(_tokenA, _tokenB);
    _pair = pairByTokensAndSwapInterval[_token0][_token1][_swapInterval];
  }

  function getPairsByTokens(address _tokenA, address _tokenB) external view override returns (address[] memory) {
    (address _token0, address _token1) = _sortTokens(_tokenA, _tokenB);
    return pairsByTokens[_token0][_token1];
  }

  function createPair(
    address _tokenA,
    address _tokenB,
    uint32 _swapInterval
  ) public override returns (address _pair) {
    require(globalParameters.isSwapIntervalAllowed(_swapInterval), 'DCAFactory: interval not allowed');
    require(_tokenA != address(0) && _tokenB != address(0), 'DCAFactory: zero address');
    require(_tokenA != _tokenB, 'DCAFactory: identical addresses');
    (address _token0, address _token1) = _sortTokens(_tokenA, _tokenB);
    require(pairByTokensAndSwapInterval[_token0][_token1][_swapInterval] == address(0), 'DCAFactory: pair exists');
    _pair = address(new DCAPair(globalParameters, ISlidingOracle(address(0xe)), IERC20Detailed(_token0), IERC20Detailed(_token1)));
    pairByTokensAndSwapInterval[_token0][_token1][_swapInterval] = _pair;
    pairsByTokens[_token0][_token1].push(_pair);
    allPairs.push(_pair);
    emit PairCreated(_token0, _token1, _swapInterval, _pair);
  }
}
