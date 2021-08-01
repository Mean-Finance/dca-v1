// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.6;

import '@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol';

interface IDCAPairSwapCallee {
  // solhint-disable-next-line func-name-mixedcase
  function DCAPairSwapCall(
    address _sender,
    IERC20Metadata _tokenA,
    IERC20Metadata _tokenB,
    uint256 _amountBorrowedTokenA,
    uint256 _amountBorrowedTokenB,
    bool _isRewardTokenA,
    uint256 _rewardAmount,
    uint256 _amountToProvide,
    bytes calldata _data
  ) external;
}
