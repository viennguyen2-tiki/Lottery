import { useEffect, useState } from "react";
import { getGameContract } from "../utils";

function useGame() {
	const [gameInfo, setGameInfo] = useState(undefined);
	const [load, setLoad] = useState(false);
	useEffect(() => {
		let interval;
		async function call() {
			const contract = await getGameContract();
			if (contract) {
				try {
					const nextGameId = parseInt(
						await contract.methods.nextGameId().call()
					);
					if (
						nextGameId > 0 &&
						(!gameInfo || parseInt(gameInfo.id) !== nextGameId - 1)
					) {
						const game = await contract.methods
							.games(nextGameId - 1)
							.call();
						const balance = await contract.methods
							.balanceOf()
							.call();
						const players = await contract.methods
							.numberOfPlayerInGame(game.id)
							.call();
						setGameInfo({
							...game,
							balance,
							players,
						});
					}
					clearInterval(interval);
				} catch (e) {
					console.log(e);
					clearInterval(interval);
				}
			}
		}
		call();
	}, [load]);

	const loadGameStatus = () => {
		setLoad(!load);
	};	
	return { gameInfo, loadGameStatus };
}

export { useGame };
