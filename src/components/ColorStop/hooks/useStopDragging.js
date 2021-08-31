import { useState } from 'react';
import useDragging from '../../hooks/useDragging';

/**
 * Limits a client drag movement within given min / max
 * @param {Number} offset - The current clientX
 * @param {Number} min - Min boundary
 * @param {Number} max - Max boundary
 * @returns {Number}
 */
const limitPos = (offset, min, max) => Math.max(Math.min(offset, max), min);

const useStopDragging = ({ limits, stop, initialPos, onPosChange, onDragStart, onDragEnd}) => {
	const [posStart, setPosStart] = useState(initialPos);

	const handleDrag = ({ clientX }) => {
		const { id, offset } = stop;
		const { min, max } = limits;

		// Limit movements
		const dragOffset = offset - posStart;
		const limitedPos = limitPos(dragOffset + clientX, min, max);

		onPosChange({ id, offset: limitedPos });
	};

	const [drag] = useDragging({
		onDragStart: ({ clientX }) => {
			setPosStart(clientX);

			onDragStart(stop.id);
		},
		onDrag: handleDrag,
		onDragEnd: () => onDragEnd(stop.id)
	});

	return [
		drag,
	];
};

export default useStopDragging;