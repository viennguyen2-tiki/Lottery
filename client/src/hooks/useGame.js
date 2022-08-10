import { useEffect, useState } from "react";
import { getGameContract } from "../utils";

function useGame() {
	const [gameInfo, setGameInfo] = useState(undefined);
	const [load, setLoad] = useState(false);
	useEffect(() => {
		async function call() {
			const contract = await getGameContract();
			if (contract) {
				try {
					const nextGameId = parseInt(
						await contract.methods.nextGameId().call()
					);
					if (
						nextGameId > 0
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
						const playerAddress = [];
						for(let i = 0; i < parseInt(players); i++){
							const address = await contract.methods.playerOfGame(nextGameId - 1, i).call();
							playerAddress.push(address)
						}
						setGameInfo({
							...game,
							balance,
							players,
							playerAddress
						});
					}
				} catch (e) {
					console.log(e);
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
