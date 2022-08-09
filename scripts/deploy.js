// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require("fs/promises");
const path = require("path");

async function main() {
	const envFilepath = path.resolve(__dirname, "..", ".env");
	try {
		if (fs.existsSync(envFilepath)) {
			fs.unlink(envFilepath);
		}
	} catch (e) {}
	const { ethers } = hre;
	const Money = await ethers.getContractFactory("Money");
	const money = await Money.deploy("Money", "MON");
	const Lottery = await ethers.getContractFactory("Lottery");
	const lottery = await Lottery.deploy();

	const [owner, player1, player2, player3] = await ethers.getSigners();

	const amount = ethers.utils.parseUnits(String(100), 18);
	// from player to game address
	// await money.connect(owner).approve(lottery.address, amount);
	// await money.connect(player1).approve(lottery.address, amount);
	// await money.connect(player2).approve(lottery.address, amount);
	// await money.connect(player3).approve(lottery.address, amount);

	await money.mint(player1.address, amount);

	await money.mint(player2.address, amount);

	await money.mint(player3.address, amount);

	console.log(`
    MONEY address: ${money.address}
    Lottery address: ${lottery.address}
  `);

	await fs.writeFile(
		envFilepath,
		`MONEY_ADDRESS=${money.address}
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
