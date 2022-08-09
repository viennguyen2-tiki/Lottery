import React from "react";
import { GAME_STATUS } from "../constants";
import RowInfo from "./Row";

const GameStatus = ({ game }) => {
	return (
		<div className="game-area">
			<div className="game-info-title">
				<div>Latest Game status</div>
			</div>
			{game === undefined ? (
				<div className="body-padding">No games</div>
			) : (
				<div className="body-padding">
					<RowInfo
						items={[
							{ name: "Order", value: game.id },
							{ name: "Balane", value: game.balance },
						]}
					/>
					<RowInfo
						items={[
							{ name: "Players", value: game.players },
							{
								name: "Status",
								value:
									game.status === GAME_STATUS.START
										? "Started"
										: "Ended",
							},
						]}
					/>
					<RowInfo
						items={[
							{
								name: "Begin",
								value: new Date(
									parseInt(game.startTime) * 1000
								).toLocaleDateString(),
							},
							{
								name: "End",
								value:
									game.status === GAME_STATUS.STOP &&
									new Date(
										parseInt(game.endTime) * 1000
									).toLocaleDateString(),
							},
						]}
					/>
				</div>
			)}
		</div>
	);
};

export default GameStatus;
