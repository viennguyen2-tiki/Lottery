import React from "react";
import Web3 from "web3";
import { utils } from "ethers";
import RowInfo from "./Row";

const UserInfo = ({ address, money, eth }) => {
	return (
		<div className="game-info" key={address}>
			<div className="game-info-title" key={`${address}1`}>
				<div>User info</div>
			</div>
			<div className="body-padding" key={`${address}2`}>
				<form key={`${address}3`}>
					<RowInfo key={`${address}4`} items={[{ name: "Address", value: address }]} />
					<RowInfo key={`${address}5`}
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
