import React from "react";
import { GAME_STATUS } from "../constants";

const GameHistory = ({ items }) => {
	return (
		<div className="game-area">
			<div className="game-info-title">
				<div>Game history</div>
			</div>
			<div style={{ padding: "0px 10px" }}>
				<table className="table">
					<thead>
						<tr>
							<th scope="col">#</th>
							<th scope="col">Players</th>
							<th scope="col">Winner</th>
							<th scope="col">Balance</th>
							<th scope="col">Win Number</th>
							<th scope="col">Status</th>
						</tr>
					</thead>
					<tbody>
                        {items.map(item => (<tr key={item.id}>
							<td>{item.id}</td>
							<td>{item.players}</td>
							<td>{item.winners.length}</td>
							<td>{item.balance}</td>
							<td>{item.winNumber}</td>
							<td>{item.status === GAME_STATUS.START ? "Started" : "Ended"}</td>
						</tr>))}
						
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default GameHistory;
