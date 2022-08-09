import React from "react";
import { GAME_STATUS } from "../constants";
import { getGameContract, getGas } from "../utils";

const Dealer = ({
	owner,
	setLoading,
	setAlert,
	game,
	updateBalance
}) => {
	const createNewGame = async () => {
		setLoading("Creating a new game....");
		try {
			const contract = await getGameContract();
			const [gasPrice, gasLimit] = await getGas();
			console.log(gasPrice, gasLimit)
			const tx = await contract.methods
				.createGame()
				.send({ from: owner, gasPrice: gasPrice, gasLimit: gasLimit });
			console.log(tx);
			setAlert({
				msg: "Created a game.",
				link: `${process.env.REACT_APP_SCAN_URL}${tx.trasactionHash}`,
			});
		} catch (e) {
			setAlert({
				msg: "Error when try to creating a new game",
				type: "danger",
				link: `${process.env.REACT_APP_SCAN_URL}/address/${owner}`,
			});
		}
		updateBalance();
		setLoading("");
	};

	const stopGame = async () => {
		setLoading("Stopping the game....");
		try {
			const contract = await getGameContract();
			const [gasPrice, gasLimit] = await getGas();
			const tx = await contract.methods
				.stopGame()
				.send({ from: owner, gasPrice: gasPrice, gasLimit: gasLimit });
			console.log(tx);
			setAlert({
				msg: "Stopped the game.",
				link: `${process.env.REACT_APP_SCAN_URL}${tx.trasactionHash}`,
			});
		} catch (e) {
			setAlert({
				msg: "Error when try to stop the game",
				type: "danger",
				link: `${process.env.REACT_APP_SCAN_URL}/address/${owner}`,
			});
		}
		setLoading("");
		updateBalance();
	};

	const isCreateNewGame = () => {
		return !game || game.status === GAME_STATUS.STOP;
	};

	return (
		<div className="game-area">
			<div className="game-info-title">
				<div>Control game</div>
			</div>
			<div className="body-padding dealer">
				{isCreateNewGame() && (
					<button
						type="button"
						className="btn btn-primary"
						onClick={createNewGame}
					>
						Create New Game
					</button>
				)}
				{!isCreateNewGame() && <button type="button" className="btn btn-danger" onClick={stopGame}>
					Stop Current Game
				</button> }
			</div>
		</div>
	);
};

export default Dealer;
