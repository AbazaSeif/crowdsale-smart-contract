import ether from './helpers/ether'
import {advanceBlock} from './helpers/advanceToBlock'
import {increaseTimeTo, duration} from './helpers/increaseTime'
import latestTime from './helpers/latestTime'
import EVMThrow from './helpers/EVMThrow'

const BigNumber = web3.BigNumber

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

//const SirinCrowdsale = artifacts.require('SirinCrowdsale.sol')
const SirinCrowdsale = artifacts.require('../helpers/SirinCrowdsaleMock.sol')
const SirinSmartToken = artifacts.require('SirinSmartToken.sol')

contract('SirinCrowdsale', function ([_,investor, owner, wallet, walletFounder, walletOEM, walletBounties, walletReserve]) {

  const value = ether(1)

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock()
  })

  beforeEach(async function () {
    this.startTime = latestTime() + duration.weeks(1);
    this.endTime =   this.startTime + duration.weeks(1)
    this.afterEndTime = this.endTime + duration.seconds(1)

    this.crowdsale = await SirinCrowdsale.new(this.startTime,
      this.endTime,
      wallet,
      walletFounder,
      walletOEM,
      walletBounties,
      walletReserve,
      {from: owner})

    this.token = SirinSmartToken.at(await this.crowdsale.token())
  })

  describe('Rate Mechanism', function () {

    beforeEach(async function() {
      await increaseTimeTo(this.startTime)
    })

    it('Should be on day 1 - 1000 ', async function () {
      let rate = await this.crowdsale.getRateMock.call()
      assert.equal(rate, 1000);
    });

    it('Should be on day 2 - 950 ', async function () {
      await increaseTimeTo(this.startTime + duration.days(1));
      let rate = await this.crowdsale.getRateMock.call()
      assert.equal(rate, 950);
    });

    it('Should be on day 3 - 900 ', async function () {
      await increaseTimeTo(this.startTime + duration.days(2));
      let rate = await this.crowdsale.getRateMock.call()
      assert.equal(rate, 900);
    });

    it('Should be on day 4 - 855 ', async function () {
      await increaseTimeTo(this.startTime + duration.days(3));
      let rate = await this.crowdsale.getRateMock.call()
      assert.equal(rate, 855);
    });

    it('Should be on day 5 - 810 ', async function () {
      await increaseTimeTo(this.startTime + duration.days(4));
      let rate = await this.crowdsale.getRateMock.call()
      assert.equal(rate, 810);
    });

    it('Should be on day 6 - 770 ', async function () {
      await increaseTimeTo(this.startTime + duration.days(5));
      let rate = await this.crowdsale.getRateMock.call()
      assert.equal(rate, 770);
    });

    it('Should be on day 7 - 730 ', async function () {
      await increaseTimeTo(this.startTime + duration.days(6));
      let rate = await this.crowdsale.getRateMock.call()
      assert.equal(rate, 730);
    });

    it('Should be on day 8 - 690 ', async function () {
      await increaseTimeTo(this.startTime + duration.days(7));
      let rate = await this.crowdsale.getRateMock.call()
      assert.equal(rate, 690);
    });

    it('Should be on day 9 - 650 ', async function () {
      await increaseTimeTo(this.startTime + duration.days(8));
      let rate = await this.crowdsale.getRateMock.call()
      assert.equal(rate, 650);
    });

    it('Should be on day 10 - 615 ', async function () {
      await increaseTimeTo(this.startTime + duration.days(9));
      let rate = await this.crowdsale.getRateMock.call()
      assert.equal(rate, 615);
    });

    it('Should be on day 11 - 580 ', async function () {
      await increaseTimeTo(this.startTime + duration.days(10));
      let rate = await this.crowdsale.getRateMock.call()
      assert.equal(rate, 580);
    });

    it('Should be on day 12 - 550 ', async function () {
      await increaseTimeTo(this.startTime + duration.days(11));
      let rate = await this.crowdsale.getRateMock.call()
      assert.equal(rate, 550);
    });

    it('Should be on day 13 - 525 ', async function () {
      await increaseTimeTo(this.startTime + duration.days(12));
      let rate = await this.crowdsale.getRateMock.call()
      assert.equal(rate, 525);
    });

    it('Should be on day 14 - 500 ', async function () {
      await increaseTimeTo(this.startTime + duration.days(13));
      let rate = await this.crowdsale.getRateMock.call()
      assert.equal(rate, 500);
    });
  })

  describe('Finalize allocation', function () {

    beforeEach(async function() {
      await increaseTimeTo(this.startTime)
    })

    it('Allocate founder token amount as 10% of the total supply', async function () {

      await this.crowdsale.sendTransaction({value: value, from: investor})

      await increaseTimeTo(this.afterEndTime)
      await this.crowdsale.finalize({from: owner})

      const totalSupply = await this.token.totalSupply()
      const expectedFounderTokenAmount =  totalSupply.div(10);
      let walletFounderBalance = await this.token.balanceOf(walletFounder);

      walletFounderBalance.should.be.bignumber.equal(expectedFounderTokenAmount);

    })
  })
})