// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require("fs/promises");
const path = require("path");
const usdcAbi = require('./usdc_abi.json');

async function main() {
	const envFilepath = path.resolve(__dirname, "..", ".env_testnet");
	try{
		fs.unlink(envFilepath);
	}catch(e){}
	const MONEY_ADDRESS = "0x07865c6e87b9f70255377e024ace6630c1eaa37f";//USDC
	const { ethers } = hre;
	const Lottery = await ethers.getContractFactory("Lottery");
	const lottery = await Lottery.deploy();

	await lottery.setGameCurrency("0x07865c6e87b9f70255377e024ace6630c1eaa37f");

	// const [owner] = await ethers.getSigners();

// 	const money = new ethers.Contract(MONEY_ADDRESS, usdcAbi, owner);

// 	const amount = ethers.utils.parseUnits(String(100), 18);
//   // from player to game address
// 	await money.connect(owner).approve(lottery.address, amount);

	await fs.writeFile(
		envFilepath,
		`MONEY_ADDRESS=${MONEY_ADDRESS}
LOTTERY_ADDRESS=${lottery.address}
`
	);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
