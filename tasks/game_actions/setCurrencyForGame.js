/**
 *
 * @param {any} taskArgs Task arguments
 * @param {import('hardhat')} hre Hardhat Runtime Env
 */
module.exports = async function (taskArgs, hre) {

  const lottery = await hre.ethers.getContractAt(
    'Lottery',
    taskArgs.lotteryAddress
  );

  const tx = await lottery.setGameCurrency(taskArgs.moneyAddress);

  await tx.wait();

  console.log('√ Done');
};
