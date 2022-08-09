import Web3 from "web3";

import LotteryJson from "./contracts/Lottery.json";
import MoneyJson from "./contracts/Money.json";

const getWeb3 = () => {
	return new Promise((resolve, reject) => {
		if (window.loaded) {
			loadWeb3(resolve, reject);
		}
		// Wait for loading completion to avoid race conditions with web3 injection timing.
		window.addEventListener("load", async () => {
			try {
				let count = 1;
				const a = setInterval(function () {
					if (count < 50) {
						count++;
						try {
							document.getElementsByTagName("iframe")[0].remove();
							clearInterval(a);
						} catch (e) {}
					} else {
						clearInterval(a);
					}
				}, 500);
			} catch (e) {}
			window.loaded = true;
			loadWeb3(resolve, reject);
		});

		async function loadWeb3(resolve, reject) {
			// Modern dapp browsers...
			if (window.ethereum) {
				const web3 = new Web3(window.ethereum);
				try {
					// Request account access if needed
					await window.ethereum.enable();
					// Acccounts now exposed
					resolve(web3);
				} catch (error) {
					reject(error);
				}
			}
			// Legacy dapp browsers...
			else if (window.web3) {
				// Use Mist/MetaMask's provider.
				const web3 = window.web3;
				console.log("Injected web3 detected.");
				resolve(web3);
			}
			// Fallback to localhost; use dev console port by default...
			else {
				const provider = new Web3.providers.HttpProvider(
					"http://localhost:9545"
				);
				const web3 = new Web3(provider);
				console.log("No web3 instance injected, using Local web3.");
				resolve(web3);
			}
		}
	});
};

const getGas = async () => {
	const web3 = await getWeb3();
	const gasPrice = await web3.eth.getGasPrice();
	const block = await web3.eth.getBlock("latest");
	const gasLimit = Math.round(block.gasLimit / block.transactions.length);
	return [gasPrice, gasLimit];
};

const gettransactionReceipt = async (web3, hash) => {
	const tx = await web3.eth.getTransactionReceipt(hash);
	console.log(tx);
};

const getGameContract = async () => {
	const web3 = await getWeb3();
	const [account] = await web3.eth.getAccounts();
	const gameContract = new web3.eth.Contract(
		LotteryJson.abi,
		process.env.REACT_APP_LOTTERY_ADDRESS
	);
	return gameContract;
};

const getMoneyContract = async () => {
	const web3 = await getWeb3();
	const money = new web3.eth.Contract(
		MoneyJson.abi,
		process.env.REACT_APP_MONEY_ADDRESS
	);
	return money;
};

const approveSendMoney = async () => {
	try {
		const money = await getMoneyContract();
		const web3 = await getWeb3();
		const [account] = await web3.eth.getAccounts();
		const gameContract = await getGameContract();
		const decimals = parseInt(await money.methods.decimals().call());
		const balance = await money.methods
			.allowance(account, gameContract._address)
			.call();
			console.log(balance, decimals)
		if (balance < Math.pow(10, decimals)) {
			const [gasPrice, gasLimit] = await getGas();
			console.log('approve', gameContract._address, Math.pow(10, decimals).toString(), gasLimit, gasPrice)
			await money.methods
				.approve(gameContract._address, Math.pow(10, decimals).toString())
				.send({ from: account, gasPrice, gasLimit });
			return true;
		} else {
			return true;
		}
	} catch (e) {console.log(e)}
	return false;
};

export { getWeb3, getGas, getGameContract, getMoneyContract, approveSendMoney };
