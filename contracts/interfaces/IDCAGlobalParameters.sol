// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.4;

import './IDCATokenDescriptor.sol';

interface IDCAGlobalParameters {
  event FeeRecipientSet(address _feeRecipient);
  event NFTDescriptorSet(IDCATokenDescriptor _descriptor);
  event SwapFeeSet(uint32 _feeSet);
  event LoanFeeSet(uint32 _feeSet);
  event SwapIntervalsAllowed(uint32[] _swapIntervals, string[] _descriptions);
  event SwapIntervalsForbidden(uint32[] _swapIntervals);

  /* Public getters */
  function feeRecipient() external view returns (address);

  function swapFee() external view returns (uint32);

  function loanFee() external view returns (uint32);

  function nftDescriptor() external view returns (IDCATokenDescriptor);

  // solhint-disable-next-line func-name-mixedcase
  function FEE_PRECISION() external view returns (uint24);

  // solhint-disable-next-line func-name-mixedcase
  function MAX_FEE() external view returns (uint32);

  function allowedSwapIntervals() external view returns (uint32[] memory __allowedSwapIntervals);

  function intervalDescription(uint32 _swapInterval) external view returns (string memory);

  function isSwapIntervalAllowed(uint32 _swapInterval) external view returns (bool);

  /* Public setters */
  function setFeeRecipient(address _feeRecipient) external;

  function setSwapFee(uint32 _fee) external;

  function setLoanFee(uint32 _fee) external;

  function setNFTDescriptor(IDCATokenDescriptor _descriptor) external;

  function addSwapIntervalsToAllowedList(uint32[] calldata _swapIntervals, string[] calldata _descriptions) external;

  function removeSwapIntervalsFromAllowedList(uint32[] calldata _swapIntervals) external;
}
