import React from 'react';


const RowInfo = ({ items }) => {
	return (
		<div key={items[0].value} className="row mb-3">
			{items.length === 1 ? (
				<>
					<label
						htmlFor={`inputEmail${items[0].name}`}
						className="col-sm-2 col-form-label"
					>
						{items[0].name}
					</label>
					<div className="col-sm-10">
						<input
							type="text"
							className="form-control"
							value={items[0].value || ""}
							id={`inputEmail${items[0].name}`}
							title={items[0].value}
							disabled
						/>
					</div>
				</>
			) : null}

			{items.length === 2
				? items.map((item) => (
						< >
							<label
								htmlFor={`inputEmail${item.name}`}
								className="col-sm-2 col-form-label"
								key={`label-${item.name}`}
							>
								{item.name}
							</label>
							<div className="col-sm-4" key={item.name}>
								<input
									type="text"
									className="form-control"
									value={item.value || ""}
									id={`inputEmail${item.name}`}
									title={`${item.value}`}
									disabled
								/>
							</div>
						</>
				  ))
				: null}
		</div>
	);
};

export default RowInfo;