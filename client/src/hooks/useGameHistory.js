import { useEffect, useState } from "react";

import { getGameContract } from "../utils";

function useGameHistory() {
	const [games, setGames] = useState([]);
	const [load, setLoad] = useState(false);
	useEffect(() => {
			async function call() {
				const contract = await getGameContract();
				if (contract) {
					try {
						const nextGameId = parseInt(
							await contract.methods.nextGameId().call()
						);
						if (nextGameId > 0) {
							const games = [];
							for (let i = 0; i < nextGameId; i++) {
								const game = await contract.methods
									.games(i)
									.call();
								const players = await contract.methods
									.numberOfPlayerInGame(i)
									.call();
								const winners = await contract.methods
									.winnersOfGame(i)
									.call();
								games.push({
									...game,
									balance: players,
									winners,
									players
								});
							}
							setGames(games.reverse());
						}
					} catch (e) {
						console.log(e);
					}
				}
			}
			call();
	}, [load]);

	const loadHistory = () => {
		setLoad(!load);
	};

	return { games, loadHistory };
}

export { useGameHistory };
