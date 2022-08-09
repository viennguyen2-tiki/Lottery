const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { time, mine } = require("@nomicfoundation/hardhat-network-helpers");

const ERRORS = {
	onlyDealer: "only Dealer",
	onlyPlayer: "Dealer cannot be a player",
	openGame: "game hasn't started yet",
	enoughPlayers: "enough players",
	notEnoughMoney: "not enough money",
	betNumberRange: "bet number must be between from 0 to 99",
	readyGame: "game has started",
	readyBet: "you bet",
	noCurrency: "set currency of game before create game",
};

const GAME_STATUS = {
	START: 0,
	STOP: 1,
};

function formatUint(bigNum, moneyDecimals) {
	return ethers.utils
		.formatUnits(bigNum.toString(), moneyDecimals)
		.toString();
}

async function getBalanceOfAddressList(token, addressList) {
	const balances = [];
	for (let i = 0; i < addressList.length; i++) {
		balances.push(await token.balanceOf(addressList[i]));
	}
	return balances;
}

function calcutateRemainTimeTo(currentTime, tagretTime) {
	// console.log(4, currentTime, tagretTime)
	const MAX_TIME = 99;
	if (currentTime < tagretTime) {
		return tagretTime - currentTime - 1 /*new block*/;
	} else {
		return MAX_TIME - currentTime + tagretTime /*-1 */;
	}
}

describe("Lottery", function () {
	let owner, player1, player2, player3, playerNoHaveMoney;
	let initBalanceOfPlayer;
	let moneyDecimals = 18;
	const betNumberOfPlayer1 = 0;
	const betNumberOfPlayer2 = 10;
	const betNumberOfPlayer3 = 99;

	before(async function () {
		[owner, player1, player2, player3, playerNoHaveMoney] =
			await ethers.getSigners();

		this.walletAddress = owner.address;

		// Deploy money tokens
		const MoneyToken = await ethers.getContractFactory("Money");
		this.moneyToken = await MoneyToken.deploy("Money", "MON");

		// create two Bridge instances
		const Lottery = await ethers.getContractFactory("Lottery");
		this.lotteryContract = await Lottery.deploy();

		// Mint some mock token into wallet address

		initBalanceOfPlayer = ethers.utils.parseUnits(String(100), 18);

		// player tranfer money to game address
		await this.moneyToken
			.connect(owner)
			.approve(this.lotteryContract.address, initBalanceOfPlayer);
		await this.moneyToken
			.connect(player1)
			.approve(this.lotteryContract.address, initBalanceOfPlayer);
		await this.moneyToken
			.connect(player2)
			.approve(this.lotteryContract.address, initBalanceOfPlayer);
		await this.moneyToken
			.connect(player3)
			.approve(this.lotteryContract.address, initBalanceOfPlayer);
		//
		await this.moneyToken.mint(player1.address, initBalanceOfPlayer);
		await this.moneyToken.mint(player2.address, initBalanceOfPlayer);
		await this.moneyToken.mint(player3.address, initBalanceOfPlayer);
	});

	it("should NOT create a new game if not set currency", async function () {
		await expect(
			this.lotteryContract.connect(owner).createGame()
		).to.be.revertedWith(ERRORS.noCurrency);
	});

	it("should NOT set currency if not Dealer", async function () {
		await expect(
			this.lotteryContract
				.connect(player1)
				.setGameCurrency(this.moneyToken.address)
		).to.be.revertedWith(ERRORS.onlyDealer);
	});

	it("should set currency if signer is Dealer", async function () {
		await this.lotteryContract
			.connect(owner)
			.setGameCurrency(this.moneyToken.address);
		let moneyName = await this.lotteryContract.getCurrencyName();
		expect(moneyName).to.be.eq(await this.moneyToken.symbol());
		// other player can get currency of game
		moneyName = await this.lotteryContract
			.connect(player3)
			.getCurrencyName();
		expect(moneyName).to.be.eq(await this.moneyToken.symbol());
	});

	it("should NOT create a new game if not Delear", async function () {
		await expect(
			this.lotteryContract.connect(player1).createGame()
		).to.be.revertedWith(ERRORS.onlyDealer);
	});

	it("[no game before] should NOT bet if game has not started", async function () {
		await expect(
			this.lotteryContract.connect(player1).bet(10)
		).to.be.revertedWith(ERRORS.openGame);
	});

	it("should create a new game if signer is Delear", async function () {
		await this.lotteryContract.connect(owner).createGame();
		const game = await this.lotteryContract.games(0);
		const nextGameId = await this.lotteryContract.nextGameId();
		expect(nextGameId).to.equal(1);
		expect(game.status).to.equal(GAME_STATUS.START);
	});

	it("should NOT create another new game if the current game is not stop before", async function () {
		await expect(
			this.lotteryContract.connect(owner).createGame()
		).to.be.revertedWith(ERRORS.readyGame);
	});

	it("should NOT bet if player is Dealer", async function () {
		await expect(
			this.lotteryContract.connect(owner).bet(10)
		).to.be.revertedWith(ERRORS.onlyPlayer);
	});

	it("should NOT bet if player does not have money", async function () {
		await expect(
			this.lotteryContract.connect(playerNoHaveMoney).bet(10)
		).to.be.revertedWith(ERRORS.notEnoughMoney);
	});

	it("should NOT bet if bet number is not in range 0 - 99", async function () {
		await expect(
			this.lotteryContract.connect(player1).bet(100)
		).to.be.revertedWith(ERRORS.betNumberRange);
	});

	it("should bet", async function () {
		// player 1
		let initBalanceOfPlayer = await this.moneyToken.balanceOf(
			player1.getAddress()
		);
		await this.lotteryContract.connect(player1).bet(betNumberOfPlayer1);
		let finalBalanceOfPlayer = await this.moneyToken.balanceOf(
			player1.getAddress()
		);
		let finalBalanceOfGame = ethers.utils
			.formatUnits(
				await this.moneyToken.balanceOf(this.lotteryContract.address),
				moneyDecimals
			)
			.toString();
		let remainBalanceOfPlayer = ethers.utils
			.formatUnits(
				initBalanceOfPlayer.sub(finalBalanceOfPlayer).toString(),
				moneyDecimals
			)
			.toString();

		expect(remainBalanceOfPlayer).to.be.eq("1.0");
		expect(finalBalanceOfGame).to.be.eq("1.0");
		// player 2
		initBalanceOfPlayer = await this.moneyToken.balanceOf(
			player2.getAddress()
		);
		await this.lotteryContract.connect(player2).bet(betNumberOfPlayer2);
		finalBalanceOfPlayer = await this.moneyToken.balanceOf(
			player2.getAddress()
		);
		finalBalanceOfGame = ethers.utils
			.formatUnits(
				await this.moneyToken.balanceOf(this.lotteryContract.address),
				moneyDecimals
			)
			.toString();
		remainBalanceOfPlayer = ethers.utils
			.formatUnits(
				initBalanceOfPlayer.sub(finalBalanceOfPlayer).toString(),
				moneyDecimals
			)
			.toString();

		expect(remainBalanceOfPlayer).to.be.eq("1.0");
		expect(finalBalanceOfGame).to.be.eq("2.0");
		// 2 player
		expect(await this.lotteryContract.numberOfPlayerInGame(0)).to.be.equal(2);
		const [player1Address, player1BetNumber] = await this.lotteryContract.playerOfGame(0, 0);
		expect(player1Address).to.be.equal(await player1.getAddress());
		expect(player1BetNumber).to.be.equal(betNumberOfPlayer1);
	});

	it("should NOT stop a game if not dealer", async function () {
		await expect(
			this.lotteryContract.connect(player1).stopGame()
		).to.be.revertedWith(ERRORS.onlyDealer);
	});

	it("should win game for player2", async function () {
		let currentTime = await this.lotteryContract.currentTime();
		const passedTime = calcutateRemainTimeTo(
			currentTime.toString().slice(-2),
			betNumberOfPlayer2
		);
		// console.log(3, passedTime, currentTime);
		mine(passedTime, { interval: 1 });
		// await deplay(10);
		// currentTime = await this.lotteryContract.currentTime();
		// console.log(2, currentTime)
		const [initBalanceOfPlayer2, initBalanceOfOwner, initBalanceOfGame] =
			await getBalanceOfAddressList(this.moneyToken, [
				player2.getAddress(),
				owner.getAddress(),
				this.lotteryContract.address,
			]);
		await this.lotteryContract.connect(owner).stopGame();
		const [finalBalanceOfPlayer2, finalBalanceOfOwner, finalBalanceOfGame] =
			await getBalanceOfAddressList(this.moneyToken, [
				player2.getAddress(),
				owner.getAddress(),
				this.lotteryContract.address,
			]);
		// console.log(
		// 	initBalanceOfPlayer2,
		// 	finalBalanceOfPlayer2,
		// 	initBalanceOfOwner,
		// 	finalBalanceOfOwner,
		// 	initBalanceOfGame,
		// 	finalBalanceOfGame
		// );
		expect(
			formatUint(
				finalBalanceOfPlayer2.sub(initBalanceOfPlayer2),
				moneyDecimals
			)
		).to.be.eq("1.8");
		expect(
			formatUint(
				finalBalanceOfOwner.sub(initBalanceOfOwner),
				moneyDecimals
			)
		).to.be.eq("0.2");
		expect(formatUint(initBalanceOfGame, moneyDecimals)).to.be.eq("2.0");
		expect(formatUint(finalBalanceOfGame, moneyDecimals)).to.be.eq("0.0");

		// check game status
		const game = await this.lotteryContract.games(0);
		expect(game.winNumber).to.be.eq(betNumberOfPlayer2);
		expect(game.status).to.be.eq(GAME_STATUS.STOP);
	});

	it("[after ended game]should NOT bet if game has not started", async function () {
		await expect(
			this.lotteryContract.connect(player1).bet(10)
		).to.be.revertedWith(ERRORS.openGame);
	});

	it("should NO players win game", async function () {
		await this.lotteryContract.connect(owner).createGame();
		await this.lotteryContract.connect(player1).bet(99);
		await this.lotteryContract.connect(player2).bet(9);
		const [initBalanceOfOwner] = await getBalanceOfAddressList(
			this.moneyToken,
			[owner.getAddress()]
		);
		// set winNumber is 0
		let currentTime = await this.lotteryContract.currentTime();
		const passedTime = calcutateRemainTimeTo(
			currentTime.toString().slice(-2),
			0
		);
		mine(passedTime, { interval: 1 });

		await this.lotteryContract.stopGame();
		const [finalBalanceOfOwner] = await getBalanceOfAddressList(
			this.moneyToken,
			[owner.getAddress()]
		);
		expect(
			formatUint(
				finalBalanceOfOwner.sub(initBalanceOfOwner),
				moneyDecimals
			)
		).to.be.eq("2.0");
		const game = await this.lotteryContract.games(1);
		expect(game.winNumber).to.be.equal(0);
	});

	it("should win game for player2 and player3", async function () {
		await this.lotteryContract.connect(owner).createGame();
		const [
			initBalanceOfOwner,
			initBalanceOfPlayer1,
			initBalanceOfPlayer2,
			initBalanceOfPlayer3,
		] = await getBalanceOfAddressList(this.moneyToken, [
			owner.getAddress(),
			player1.address,
			player2.address,
			player3.address,
		]);
		// console.log(
		// 	formatUint(initBalanceOfOwner, moneyDecimals),
		// 	formatUint(initBalanceOfPlayer1, moneyDecimals),
		// 	formatUint(initBalanceOfPlayer2, moneyDecimals),
		// 	formatUint(initBalanceOfPlayer3, moneyDecimals)
		// );
		await this.lotteryContract.connect(player1).bet(99);
		await this.lotteryContract.connect(player2).bet(betNumberOfPlayer2);
		await this.lotteryContract.connect(player3).bet(betNumberOfPlayer2);

		let currentTime = await this.lotteryContract.currentTime();
		const passedTime = calcutateRemainTimeTo(
			currentTime.toString().slice(-2),
			betNumberOfPlayer2
		);
		mine(passedTime, { interval: 1 });

		await this.lotteryContract.connect(owner).stopGame();

		const [
			finalBalanceOfOwner,
			finalBalanceOfPlayer1,
			finalBalanceOfPlayer2,
			finalBalanceOfPlayer3,
		] = await getBalanceOfAddressList(this.moneyToken, [
			owner.getAddress(),
			player1.address,
			player2.address,
			player3.address,
		]);
		// console.log(
		// 	formatUint(finalBalanceOfOwner, moneyDecimals),
		// 	formatUint(finalBalanceOfPlayer1, moneyDecimals),
		// 	formatUint(finalBalanceOfPlayer2, moneyDecimals),
		// 	formatUint(finalBalanceOfPlayer3, moneyDecimals)
		// );
		// player1 lose game
		expect(
			formatUint(
				initBalanceOfPlayer1.sub(finalBalanceOfPlayer1),
				moneyDecimals
			)
		).to.be.equal("1.0");
		// share = 3 - 0.3 = 2.7/2= 1.35 - 1/von/ = 0.35
		expect(
			formatUint(
				finalBalanceOfPlayer2.sub(initBalanceOfPlayer2),
				moneyDecimals
			)
		).to.be.equal("0.35");

		expect(
			formatUint(
				finalBalanceOfPlayer3.sub(initBalanceOfPlayer3),
				moneyDecimals
			)
		).to.be.equal("0.35");
		// owner get fee from 3 players
		expect(
			formatUint(
				finalBalanceOfOwner.sub(initBalanceOfOwner),
				moneyDecimals
			)
		).to.be.eq("0.3");

		const game = await this.lotteryContract.games(2);
		console.log(game)
		expect(game.winNumber).to.be.equal(betNumberOfPlayer2);
		const winners = await this.lotteryContract.winnersOfGame(2);
		expect(winners.length).to.be.equal(2);
	});
});
