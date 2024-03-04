import React from 'react';
import { noop } from '../../lib';
import { STOP_PROP_TYPES } from '../propTypes';
import useStopDragging from './hooks/useStopDragging';
import './index.css';

const ColorStop = ({ stop, limits, onPosChange, onDragStart = noop, onDragEnd = noop, onClick}) => {
	const [drag] = useStopDragging({
		stop,
		limits,
		onPosChange,
		onDragStart,
		onDragEnd
	});

	const { offset, color, isActive } = stop;

	return (
		<div onClick={onClick} className={isActive ? 'cs active' : 'cs'} style={{ left: offset }} onMouseDown={drag} onTouchStart={drag} >
			<div className="arrow"></div>
			<div className="content" style={{ backgroundColor: color }} />
		</div>
	);
};

ColorStop.propTypes = STOP_PROP_TYPES;

export default ColorStop;
