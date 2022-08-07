/**
 *
 * @param {any} taskArgs Task arguments
 * @param {import('hardhat')} hre Hardhat Runtime Env
 */
module.exports = async function (taskArgs, hre) {
	const [owner, player1, player2, player3] = await hre.ethers.getSigners();

	const lottery = await hre.ethers.getContractAt(
		"Lottery",
		taskArgs.lotteryAddress
	);

	const money = await hre.ethers.getContractAt(
		"Money",
		taskArgs.moneyAddress
	);
	const tx = await lottery.connect(owner).stopGame();
    await tx.wait();
    // console.log(await lottery.games(0));
	const player1Balance = await money.balanceOf(await player1.getAddress());
	const player2Balance = await money.balanceOf(await player2.getAddress());
	const player3Balance = await money.balanceOf(await player3.getAddress());
	const ownerBalance = await money.balanceOf(await owner.getAddress());
	const lotteryBalance = await money.balanceOf(lottery.address);

	console.log(`√ Done
                owner: ${hre.ethers.utils.formatUnits(
					ownerBalance,
					await money.decimals()
				)}
                player1: ${hre.ethers.utils.formatUnits(
					player1Balance,
					await money.decimals()
				)}
                player2: ${hre.ethers.utils.formatUnits(
					player2Balance,
					await money.decimals()
				)}
                player3: ${hre.ethers.utils.formatUnits(
					player3Balance,
					await money.decimals()
				)}
                lottery: ${hre.ethers.utils.formatUnits(
					lotteryBalance,
					await money.decimals()
				)}
  `);
};
