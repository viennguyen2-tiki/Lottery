import React from "react";
import Web3 from "web3";
import { utils } from "ethers";
import RowInfo from "./Row";

const UserInfo = ({ address, money, eth }) => {
	return (
		<div className="game-info">
			<div className="game-info-title">
				<div>User info</div>
			</div>
			<div className="body-padding">
				<form>
					<RowInfo key={1} items={[{ name: "Address", value: address }]} />
					<RowInfo key={2}
						items={[
							{
								name: "Money",
								value: `${utils.formatUnits(
									money.balance || "0",
									parseInt(money.decimals)
								)} (${money.symbol})`,
							},
							{
								name: "ETH",
								value: Web3.utils.fromWei(
									Web3.utils.toBN(eth || 0),
									"ether"
								),
							},
						]}
					/>
				</form>
			</div>
		</div>
	);
};

export default React.memo(UserInfo);
