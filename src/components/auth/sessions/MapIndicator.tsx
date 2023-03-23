import React, { Fragment, useState } from "react"

type MapIndicatorProps = {
	lat: number
	lng: number,
	text: string,
	itemCount: number,
	zoom: number,
}

const fx = (x: number) => {
	const a: number = 0.6
	const b: number = 1.5
	const c: number = 2

	return a * x * x + b * x + c
}

const calcRadius = (level: number, zoomLevel: number) => {
	return fx(level) / 4 * ((zoomLevel * zoomLevel) / (7 * 7))
}

export const MapIndicator: React.FC<MapIndicatorProps> = (props) => {
	let rem = 0
	if (props.itemCount <= 10) {
		rem = calcRadius(1, props.zoom)
	}
	else if (props.itemCount > 10 && props.itemCount <= 50) {
		rem = calcRadius(2, props.zoom)
	}
	else if (props.itemCount > 50 && props.itemCount <= 250) {
		rem = calcRadius(3, props.zoom)
	}
	else if (props.itemCount > 250 && props.itemCount <= 1000) {
		rem = calcRadius(4, props.zoom)
	}
	else if (props.itemCount > 1000 && props.itemCount <= 5000) {
		rem = calcRadius(5, props.zoom)
	}
	else if (props.itemCount > 5000) {
		rem = calcRadius(6, props.zoom)
	}

	return (
		<div style={{ marginLeft: `-${rem/2}rem`, marginTop: `-${rem/2}rem` }}>
			<span className={"animate-ping absolute inline-flex rounded-full bg-orange-400 opacity-50"} style={{ width: `${rem}rem`, height: `${rem}rem` }}></span>
			<span className={"relative inline-flex rounded-full bg-orange-500/[0.65]"} style={{ width: `${rem}rem`, height: `${rem}rem` }}></span>
			<div className="tooltip absolute left-2/4 -translate-x-2/4 bg-none background-repeat bg-scroll bg-white dark:bg-zinc-900 border border-indigo-500 dark:border-rose-600 after:border-b-indigo-500 dark:after:border-b-rose-600 after:bg-transparent shadow-md dark:shadow-black rounded-lg mt-2">
				<span className="flex flex-col items-center w-min px-5 pt-2 pb-1.5">
					<span className="text-center text-gray-900 dark:text-white">{props.text}</span>
					<div className="text-gray-900 dark:text-white text-center mt-1.5">
						<span className="text-lg">{props.itemCount}</span>
					</div>
				</span>
			</div>
		</div>
	)	
}