/**
 *
 * @param {any} taskArgs Task arguments
 * @param {import('hardhat')} hre Hardhat Runtime Env
 */
module.exports = async function (taskArgs, hre) {
  const acounts = await hre.ethers.getSigners();
  const lottery = await hre.ethers.getContractAt(
    'Lottery',
    taskArgs.lotteryAddress
  );
  console.log(hre.ethers.BigNumber.from(taskArgs.number));
  const tx = await lottery.connect(acounts[taskArgs.account]).bet(hre.ethers.BigNumber.from(taskArgs.number));

  await tx.wait();

  console.log('√ Done');
};
