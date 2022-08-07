const { task, types } = require("hardhat/config");

task(
	"set-currency",
	"set currency for game",
	require("./game_actions/setCurrencyForGame")
)
	.addParam("moneyAddress", "Currency of game", process.env.MONEY_ADDRESS)
	.addParam("lotteryAddress", "Game address", process.env.LOTTERY_ADDRESS);

task(
	"create-game",
	"set currency for game",
	require("./game_actions/createGame")
).addParam("lotteryAddress", "Game address", process.env.LOTTERY_ADDRESS);

task("bet", "set currency for game", require("./game_actions/bet"))
	.addParam("lotteryAddress", "Game address", process.env.LOTTERY_ADDRESS)
	.addParam("number", "bet number", 0, types.int)
	.addParam("account", "account join to bet", 1, types.int);

task("stop-game", "stop game", require("./game_actions/stopGame"))
	.addParam("moneyAddress", "Currency of game", process.env.MONEY_ADDRESS)
	.addParam("lotteryAddress", "Game address", process.env.LOTTERY_ADDRESS);
