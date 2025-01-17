import React from 'react';
import ColorStop from '../ColorStop/index';
import { STOPS_HOLDER_PROP_TYPES } from '../propTypes';

const getStopsHolderStyle = (width, disabled) => ({
	width,
	height: 17,
	position: 'relative',
	cursor: disabled ? 'default' : 'crosshair'
});

const ColorStopsHolder = ({ width, stops, disabled = false, onAddColor, onClick, ...rest }) => {

	const handleColorAdd = (e) => {
		e.preventDefault();

		if (e.button) return;

		const offset = e.clientX - e.target.getBoundingClientRect().left;
		onAddColor({ offset });
		onClick();
	};

	return (
		<div className="csh" style={getStopsHolderStyle(width, disabled)} onMouseDown={handleColorAdd}>
			{stops.map(stop =>
				<ColorStop key={stop.id} stop={stop} onClick={onClick} {...rest} />
			)}
		</div>
	);
};

ColorStopsHolder.propTypes = STOPS_HOLDER_PROP_TYPES;

export default ColorStopsHolder;
