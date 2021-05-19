import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract, ContractFactory, Signer } from 'ethers';
import { ethers } from 'hardhat';
import { constants, behaviours, bn } from '../../utils';
import { given, then, when } from '../../utils/bdd';

describe('DCAFactoryParameters', function () {
  let owner: SignerWithAddress, feeRecipient: Signer;
  let DCAFactoryParametersContract: ContractFactory;
  let DCAFactoryParameters: Contract;

  before('Setup accounts and contracts', async () => {
    [owner, feeRecipient] = await ethers.getSigners();
    DCAFactoryParametersContract = await ethers.getContractFactory(
      'contracts/mocks/DCAFactory/DCAFactoryParameters.sol:DCAFactoryParametersMock'
    );
  });

  beforeEach('Deploy and configure', async () => {
    DCAFactoryParameters = await DCAFactoryParametersContract.deploy(owner.address, await feeRecipient.getAddress());
  });

  describe('constructor', () => {
    when('feeRecipient is zero address', () => {
      then('tx is reverted with reason error', async () => {
        await behaviours.deployShouldRevertWithZeroAddress({
          contract: DCAFactoryParametersContract,
          args: [owner.address, constants.ZERO_ADDRESS],
        });
      });
    });
    when('all arguments are valid', () => {
      then('initializes correctly and emits events', async () => {
        await behaviours.deployShouldSetVariablesAndEmitEvents({
          contract: DCAFactoryParametersContract,
          args: [owner.address, await feeRecipient.getAddress()],
          settersGettersVariablesAndEvents: [
            {
              getterFunc: 'feeRecipient',
              variable: await feeRecipient.getAddress(),
              eventEmitted: 'FeeRecipientSet',
            },
          ],
        });
      });
    });
  });

  describe('setFeeRecipient', () => {
    when('address is zero', () => {
      then('tx is reverted with reason', async () => {
        await behaviours.txShouldRevertWithZeroAddress({
          contract: DCAFactoryParameters,
          func: 'setFeeRecipient',
          args: [constants.ZERO_ADDRESS],
        });
      });
    });
    when('address is not zero', () => {
      then('sets feeRecipient and emits event with correct arguments', async () => {
        await behaviours.txShouldSetVariableAndEmitEvent({
          contract: DCAFactoryParameters,
          getterFunc: 'feeRecipient',
          setterFunc: 'setFeeRecipient',
          variable: constants.NOT_ZERO_ADDRESS,
          eventEmitted: 'FeeRecipientSet',
        });
      });
    });

    behaviours.shouldBeExecutableOnlyByGovernor({
      contract: () => DCAFactoryParameters,
      funcAndSignature: 'setFeeRecipient(address)',
      params: [constants.NOT_ZERO_ADDRESS],
      governor: () => owner,
    });
  });

  describe('setFee', () => {
    when('sets fee bigger than MAX_FEE', () => {
      then('tx is reverted with reason', async () => {
        await behaviours.txShouldRevertWithMessage({
          contract: DCAFactoryParameters,
          func: 'setFee',
          args: [(await DCAFactoryParameters.MAX_FEE()) + 1],
          message: 'DCAFactory: fee too high',
        });
      });
    });
    when('sets fee equal to MAX_FEE', () => {
      then('sets fee and emits event', async () => {
        await behaviours.txShouldSetVariableAndEmitEvent({
          contract: DCAFactoryParameters,
          getterFunc: 'fee',
          setterFunc: 'setFee',
          variable: await DCAFactoryParameters.MAX_FEE(),
          eventEmitted: 'FeeSet',
        });
      });
    });
    when('sets fee lower to MAX_FEE', () => {
      then('sets fee and emits event', async () => {
        await behaviours.txShouldSetVariableAndEmitEvent({
          contract: DCAFactoryParameters,
          getterFunc: 'fee',
          setterFunc: 'setFee',
          variable: (await DCAFactoryParameters.MAX_FEE()) - 1,
          eventEmitted: 'FeeSet',
        });
      });
    });
    behaviours.shouldBeExecutableOnlyByGovernor({
      contract: () => DCAFactoryParameters,
      funcAndSignature: 'setFee(uint32)',
      params: [1],
      governor: () => owner,
    });
  });

  describe('addSwapIntervalsToAllowedList', () => {
    when('one of the intervals is zero', () => {
      then('tx is reverted with reason', async () => {
        await behaviours.txShouldRevertWithMessage({
          contract: DCAFactoryParameters,
          func: 'addSwapIntervalsToAllowedList',
          args: [[0, 1]],
          message: 'DCAFactory: zero interval',
        });
        await behaviours.txShouldRevertWithMessage({
          contract: DCAFactoryParameters,
          func: 'addSwapIntervalsToAllowedList',
          args: [[1, 0]],
          message: 'DCAFactory: zero interval',
        });
      });
    });
    when('one of the intervals was already allowed', () => {
      beforeEach(async () => {
        await DCAFactoryParameters.addSwapIntervalsToAllowedList([10, 11]);
      });
      then('tx is reverted with reason', async () => {
        await behaviours.txShouldRevertWithMessage({
          contract: DCAFactoryParameters,
          func: 'addSwapIntervalsToAllowedList',
          args: [[1, 10]],
          message: 'DCAFactory: allowed swap interval',
        });
        await behaviours.txShouldRevertWithMessage({
          contract: DCAFactoryParameters,
          func: 'addSwapIntervalsToAllowedList',
          args: [[1, 11]],
          message: 'DCAFactory: allowed swap interval',
        });
        await behaviours.txShouldRevertWithMessage({
          contract: DCAFactoryParameters,
          func: 'addSwapIntervalsToAllowedList',
          args: [[10, 1]],
          message: 'DCAFactory: allowed swap interval',
        });
        await behaviours.txShouldRevertWithMessage({
          contract: DCAFactoryParameters,
          func: 'addSwapIntervalsToAllowedList',
          args: [[11, 1]],
          message: 'DCAFactory: allowed swap interval',
        });
      });
    });
    when('swap intervals are not zero and were not previously allowed', () => {
      then('adds swap intervals to allowed list and emits event', async () => {
        expect(await DCAFactoryParameters.isSwapIntervalAllowed(1)).to.be.false;
        expect(await DCAFactoryParameters.isSwapIntervalAllowed(100)).to.be.false;
        const intervalsToBeAdded = [1, 100];
        await expect(DCAFactoryParameters.addSwapIntervalsToAllowedList(intervalsToBeAdded))
          .to.emit(DCAFactoryParameters, 'SwapIntervalsAllowed')
          .withArgs(intervalsToBeAdded);
        expect(await DCAFactoryParameters.isSwapIntervalAllowed(1)).to.be.true;
        expect(await DCAFactoryParameters.isSwapIntervalAllowed(100)).to.be.true;
      });
    });
    behaviours.shouldBeExecutableOnlyByGovernor({
      contract: () => DCAFactoryParameters,
      funcAndSignature: 'addSwapIntervalsToAllowedList(uint32[])',
      params: [[1]],
      governor: () => owner,
    });
  });
  describe('removeSwapIntervalsFromAllowedList', () => {
    beforeEach(async () => {
      await DCAFactoryParameters.addSwapIntervalsToAllowedList([1]);
    });
    when('swap interval was not previously allowed', () => {
      then('tx is reverted with reason', async () => {
        await behaviours.txShouldRevertWithMessage({
          contract: DCAFactoryParameters,
          func: 'removeSwapIntervalsFromAllowedList',
          args: [[1, 2]],
          message: 'DCAFactory: swap interval not allowed',
        });
        await behaviours.txShouldRevertWithMessage({
          contract: DCAFactoryParameters,
          func: 'removeSwapIntervalsFromAllowedList',
          args: [[2, 3]],
          message: 'DCAFactory: swap interval not allowed',
        });
      });
    });
    when('swap interval was previously allowed', () => {
      then('removes swap interval and emits event', async () => {
        expect(await DCAFactoryParameters.isSwapIntervalAllowed(1)).to.be.true;
        await expect(DCAFactoryParameters.removeSwapIntervalsFromAllowedList([1]))
          .to.emit(DCAFactoryParameters, 'SwapIntervalsForbidden')
          .withArgs([1]);
        expect(await DCAFactoryParameters.isSwapIntervalAllowed(1)).to.be.false;
      });
    });
    behaviours.shouldBeExecutableOnlyByGovernor({
      contract: () => DCAFactoryParameters,
      funcAndSignature: 'removeSwapIntervalsFromAllowedList(uint32[])',
      params: [[1]],
      governor: () => owner,
    });
  });

  describe('allowedSwapIntervals', () => {
    when('no swap interval is allowed', () => {
      then('returns empty array', async () => {
        expect(await DCAFactoryParameters.allowedSwapIntervals()).to.be.empty;
      });
    });
    when('there are swap intervals allowed', () => {
      const allowedIntervals = [1, 100, 200];
      given(async () => {
        await DCAFactoryParameters.addSwapIntervalsToAllowedList(allowedIntervals);
      });
      then('array returns correct intervals', async () => {
        bn.expectArraysToBeEqual(await DCAFactoryParameters.allowedSwapIntervals(), allowedIntervals);
      });
    });
  });

  describe('isSwapIntervalAllowed', () => {
    when('querying for a swap interval not allowed', () => {
      then('returns false', async () => {
        expect(await DCAFactoryParameters.isSwapIntervalAllowed(1240)).to.be.false;
      });
    });
    when('querying for an allowed swap interval', () => {
      const allowedInterval = 639;
      given(async () => {
        await DCAFactoryParameters.addSwapIntervalsToAllowedList([allowedInterval]);
      });
      then('returns true', async () => {
        expect(await DCAFactoryParameters.isSwapIntervalAllowed(allowedInterval)).to.be.true;
      });
    });
  });
});
