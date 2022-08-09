import React from "react";

const Alert = ({ alert, setAlert }) => {
	return (
		<>
			{alert.msg && (
				<div
					className={`alert alert-${alert.type || 'success'}`}
					role="alert"
					style={{ position: "relative" }}
				>
					{alert.msg}{" "}
					{alert.link ? (
						<a href={alert.link} className="alert-link" target={'_blank'}>
							Link
						</a>
					) : null}
					<span
						style={{
							position: "absolute",
							height: "10px",
							width: "10px",
							top: "-2px",
							right: "11px",
							fontSize: "21px",
							cursor: "pointer",
						}}
						onClick={() => setAlert({ msg: "" })}
					>
						✖️
					</span>
				</div>
			)}
		</>
	);
};

export default Alert;
