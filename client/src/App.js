import React, { useEffect, useState } from "react";
import Dealer from "./components/Dealer";
import UserInfo from "./components/UserInfo";
import Player from "./components/Player";
import { getMoneyContract, getWeb3 } from "./utils.js";
import GameStatus from "./components/GameStatus";
import GameHistory from "./components/GameHistory";
import Alert from "./components/Alert";
import { useGame } from "./hooks/useGame";
import { useGameHistory } from "./hooks/useGameHistory";

function App() {
	const [web3, setWeb3] = useState(undefined);
	const [account, setAccount] = useState(undefined);
	const [ethBalance, setEthBalance] = useState(undefined);
	const [moneyInfo, setMoneyInfo] = useState({
		decimals: 18,
		balance: 0,
		symbol: "",
	});
	const [networkId, setNetworkId] = useState(undefined);
	const [admin, setAdmin] = useState(false);
	const [loading, setLoading] = useState("");
	const [alert, setAlert] = useState({ msg: "", type: "success" });
	const { gameInfo, loadGameStatus } = useGame();
	const { games, loadHistory } = useGameHistory();
	const [ loop, setLoop ] = useState(1);

	useEffect(() => {
		const init = async () => {
			try {
				const web3 = await getWeb3();
				const [account] = await web3.eth.getAccounts();
				const networkId = await web3.eth.net.getId();
				//load contract
				const money = await getMoneyContract();
				// load game info
				const moneyDecimals = await money.methods.decimals().call();
				const moneySymbol = await money.methods.symbol().call();
				setMoneyInfo({
					decimals: moneyDecimals,
					symbol: moneySymbol,
					contract: money,
				});
				setNetworkId(networkId);
				setWeb3(web3);
				setAccount(account);
				setAdmin(isDealer(account));
			} catch (e) {
				setLoading("Please setup metamask");
			}
		};
		init();
		if (window.ethereum) {
			window.ethereum.on("accountsChanged", (_) => {
				window.location.reload();
			});
		}
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			if (isReady()) {
				updateBalance();
			}
			setLoop(interval);
		}, 1000)
		return () => {
			clearInterval(interval);
		}
	}, [loop]);

	async function updateBalance() {
		const balance = await web3.eth.getBalance(account);
		setEthBalance(balance);
		const moneyBalance = await moneyInfo.contract.methods
			.balanceOf(account)
			.call();
		setMoneyInfo({ ...moneyInfo, balance: moneyBalance });
		loadGameStatus();
		loadHistory();
	}

	const isDealer = (account) => {
		return (
			account.toLowerCase() === process.env.REACT_APP_DEALER.toLowerCase()
		);
	};
	const isReady = () => {
		return web3 && moneyInfo.contract && !loading && account;
	};

	if (!isReady()) {
		return <div>{loading || "Loading game...."}</div>;
	}
	if (networkId !== parseInt(process.env.REACT_APP_NETWORK_ID)) {
		return <div>Please change to Goerli Network</div>;
	}

	return (
		<div className="container">
			<div className="game-title">Lottery Game</div>
			<Alert alert={alert} setAlert={setAlert}/>
			<UserInfo address={account} eth={ethBalance} money={moneyInfo} />
			<GameStatus game={gameInfo} />
			{admin ? (
				<Dealer
					owner={account}
					setLoading={setLoading}
					setAlert={setAlert}
					game={gameInfo}
				/>
			) : (
				<Player
					setLoading={setLoading}
					setAlert={setAlert}
					game={gameInfo}
					owner={account}
				/>
			)}
			<GameHistory items={games} />
		</div>
	);
}

export default App;
