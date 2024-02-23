import React, { useState, useMemo, useEffect } from 'react';
import classNames from 'classnames';
import ColorStopsHolder from '../ColorStopsHolder/index';
import Palette from '../Palette/index';
import ColorPicker from '../ColorPicker/index';
import { GRADIENT_PICKER_PROP_TYPES } from '../propTypes/index';
import { sortPalette } from '../../lib/index';
import {
	HALF_STOP_WIDTH,
	DEFAULT_HEIGHT,
	DEFAULT_WIDTH,
	DEFAULT_STOP_REMOVAL_DROP,
	DEFAULT_MAX_STOPS,
	DEFAULT_MIN_STOPS
} from './constants';
import './index.css';

const nextColorId = (palette) => Math.max(...palette.map(({ id }) => id)) + 1;

const mapIdToPalette = (palette) => palette.map((color, index) => ({
	...color,
	id: color.id || index + 1
}));

const mapPaletteToStops = ({ palette, activeId, width }) => palette.map((color) => ({
	...color,
	id: color.id,
	offset: width * color.offset - HALF_STOP_WIDTH,
	isActive: color.id === activeId
}));

const getPaletteColor = (palette, id) => {
	const color = palette.find(color => color.id === id);
	return { ...color, offset: Number(color.offset) };
};

const GradientPicker = ({
	palette,
	paletteHeight = DEFAULT_HEIGHT,
	width = DEFAULT_WIDTH,
	stopRemovalDrop = DEFAULT_STOP_REMOVAL_DROP,
	minStops = DEFAULT_MIN_STOPS,
	maxStops = DEFAULT_MAX_STOPS,
	children,
	flatStyle = false,
	onPaletteChange,
	deleteIcon
}) => {
	palette = mapIdToPalette(palette);

	const [defaultActiveColor] = palette;
	// const [activeColorId, setActiveColorId] = useState(defaultActiveColor.id);
	const [activeColorId, setActiveColorId] = useState(null);
	const [showColorPicker, setShowColorPicker] = useState(false);

	const limits = useMemo(() => {
		const min = -HALF_STOP_WIDTH;
		const max = width - HALF_STOP_WIDTH;

		return { min, max, drop: stopRemovalDrop };
	}, [width]);

	const handleColorAdd = ({ offset }) => {
		if (palette.length >= maxStops) return;

		const { color } = getPaletteColor(palette, activeColorId || defaultActiveColor.id);
		const entry = { id: nextColorId(palette), offset: offset / width, color };

		const updatedPalette = [...palette, entry];

		setActiveColorId(entry.id);
		handlePaletteChange(updatedPalette);
	};

	const handleColorDelete = (id) => {
		if (palette.length <= minStops) return;

		const updatedPalette = palette.filter(c => c.id !== id);
		const activeId = updatedPalette.reduce((a, x) => x.offset < a.offset ? x : a, {id: null}).id;

		setActiveColorId(activeId); //id === activeColorId && 
		handlePaletteChange(updatedPalette);
	};

	const onStopDragStart = (id) => {
		setActiveColorId(id === activeColorId ? null: id);
	};

	const handleColorSelect = (color, opacity = 1) => {
		palette = palette.map(c =>
			activeColorId === c.id ? { ...c, color, opacity } : c
		);

		handlePaletteChange(palette);
	};

	const handlePaletteChange = (palette) => {
		const sortedPalette = sortPalette(palette)
			.map(({ offset, ...rest }) => ({ offset: Number(offset).toFixed(3), ...rest }));

		onPaletteChange(sortedPalette);
	};

	const handleStopPosChange = ({ id, offset }) => {
		const updatedPalette = palette.map(c =>
			id === c.id ? { ...c, offset: (offset + HALF_STOP_WIDTH) / width } : c
		);

		handlePaletteChange(updatedPalette);
	};

	const colorPicker = () => {
		const { color, opacity } = getPaletteColor(palette, activeColorId);

		const props = {
			color,
			opacity,
			...(flatStyle && {
				width,
				className: 'gp-flat',
			}),
			onSelect: handleColorSelect
		};

		if (!children) {
			return <ColorPicker {...props} />;
		}

		const child = React.Children.only(children);
		return React.cloneElement(child, props);
	};

	const paletteWidth = width - HALF_STOP_WIDTH;
	const stopsHolderDisabled = palette.length >= maxStops;
	const stops = mapPaletteToStops({
		palette,
		width: paletteWidth,
		activeId: activeColorId
	});

	useEffect(() => {
		const handleClickOutside = (event) => {
			const picker = document.querySelector('.picker');
			const csh = document.querySelector('.csh');
			const cs = document.querySelector('.cs');
			const deleteBtn = document.querySelector('.delete');

			const target = event.target;
			if (picker && !picker.contains(target) && !csh.contains(target)) {
				!cs.contains(target) && setShowColorPicker(false);
				!deleteBtn.contains(target) && setActiveColorId(null);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleGradientPickerClick = () => {
		setShowColorPicker(true);
	};

	return (
		<div className="gp">
			<div className='palette-content'>
				<Palette width={paletteWidth} height={paletteHeight} palette={palette}/>
				<span className={classNames('delete', {
					'disable': !activeColorId || palette.length === 2
				})} onClick={()=>{
					handleColorDelete(activeColorId);
				}}>
					{deleteIcon ? deleteIcon : <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="200" height="200"><path d="M892.032 244.992h-136.064V161.536c0-36.672-31.424-66.56-70.08-66.56H338.112c-38.656 0-70.144 29.888-70.144 66.56v83.456H132.032a8 8 0 0 0-7.936 8v56c0 4.48 3.52 8 8 8h35.776l27.712 547.392c1.792 36.224 32.192 64.64 69.12 64.64h494.72c36.928 0 67.328-28.416 69.12-64.64l27.712-547.392h35.84a8 8 0 0 0 7.936-8v-56a8 8 0 0 0-7.936-8zM339.968 167.04h344v78.08H340.096v-78.08z m416.832 690.048h-489.6l-27.328-540.032h544.256l-27.328 540.032zM401.92 412.992h48c5.376 0 8 2.688 8 8v286.016c0 5.312-2.624 8-8 8h-48c-5.312 0-8-2.688-8-8V420.992c0-5.312 2.688-8 8-8z m171.008 0h48c5.312 0 8 2.688 8 8v286.016c0 5.312-2.688 8-8 8h-48c-5.312 0-8-2.688-8-8V420.992c0-5.312 2.688-8 8-8z"></path></svg>}
				</span>
			</div>
			<ColorStopsHolder
				width={paletteWidth}
				disabled={stopsHolderDisabled}
				stops={stops}
				limits={limits}
				onPosChange={handleStopPosChange}
				onAddColor={handleColorAdd}
				onDragStart={onStopDragStart}
				onClick={handleGradientPickerClick}
			/>
			{activeColorId && showColorPicker && <div className='picker'>{colorPicker()}</div>}
		</div>
	);
};

GradientPicker.propTypes = GRADIENT_PICKER_PROP_TYPES;

export default GradientPicker;