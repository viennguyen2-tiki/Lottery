import React, { useState } from "react";
import { GAME_STATUS } from "../constants";
import { approveSendMoney, getGameContract, getGas } from "../utils";

const Player = ({ owner, setLoading, setAlert, game, updateBalance }) => {
	const [betNumber, setBetNumber] = useState();
	const betGame = async () => {
		if (
			betNumber === undefined ||
			parseInt(betNumber) < 0 ||
			parseInt(betNumber) > 99
		) {
			setAlert({
				msg: `Bet number [${betNumber}] from 0 to 99`,
				type: "danger",
			});
			return;
		}
		try {
			setLoading("check approve money....");	
			const approve = await approveSendMoney();
			setLoading(".......Bet.....")
			if (approve) {
				const contract = await getGameContract();
				const [gasPrice, gasLimit] = await getGas();
				console.log(gasPrice, gasLimit);
				const tx = await contract.methods
					.bet(betNumber)
					.send({
						from: owner,
						gasPrice: gasPrice,
						gasLimit: gasLimit,
					});
				setAlert({
					msg: "bet.",
					link: `${process.env.REACT_APP_SCAN_URL}/address/${owner}`,
				});
			} else {
				
			}
		} catch (e) {
			setAlert({
				msg: "Error when try to bet",
				type: "danger",
				link: `${process.env.REACT_APP_SCAN_URL}/address/${owner}`,
			});
		}
		updateBalance();
		setLoading("");
	};
	return (
		<div className="game-area">
			<div className="game-info-title">
				<div>Control game</div>
			</div>
			<div className="body-padding">
				{game && game.status === GAME_STATUS.START ? (
					<>
						<div className="input-group mb-3">
							<span
								className="input-group-text"
								id="basic-addon1"
							>
								Bet Number
							</span>
							<input
								type="number"
								className="form-control"
								placeholder="Number"
								aria-label="Number"
								aria-describedby="basic-addon1"
								maxLength={2}
								max={99}
								min={0}
								onChange={(e) => setBetNumber(e.target.value)}
							/>
						</div>
						<button
							type="button"
							className="btn btn-primary"
							onClick={betGame}
						>
							Bet game
						</button>
					</>
				) : (
					<p>No game to bet</p>
				)}
			</div>
		</div>
	);
};

export default Player;
