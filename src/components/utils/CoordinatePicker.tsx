import React, { useState } from "react"
import GoogleMap, { Maps, ClickEventValue, ChangeEventValue } from 'google-map-react'
import { ReduxStore } from "../../redux/ReduxStore"
import { Modal, Tooltip } from 'antd'
import { XIcon, ExclamationIcon } from "@heroicons/react/outline"
import { Styles } from "../../components/Styles"
import { Coordinate } from "../../models/auth/GeoLocationInfo"
import { useTranslations } from 'next-intl'
import { MapsLocationPin } from "../icons/google/MaterialIcons"

const DEFAULT_ZOOM_LEVEL: number = 6
const DEFAULT_CENTER_POINT: Coordinate = {
	latitude: 39.925013,
	longitude: 32.836957
}

type CoordinatePickerProps = {
	visibility: boolean | undefined
	defaultValue?: Coordinate
	onSelectedChanged?(selectedCoordinate: Coordinate): void
	onCancel?(): void
}

const getCenterPoint = (defaultValue: Coordinate | undefined): GoogleMap.Coords => {
	if (defaultValue) {
		return {
			lat: defaultValue.latitude,
			lng: defaultValue.longitude
		}
	}

	return {
		lat: DEFAULT_CENTER_POINT.latitude,
		lng: DEFAULT_CENTER_POINT.longitude
	}
}

const createMapOptions = (maps: Maps, isDarkTheme: boolean) => {
	return {
		zoomControlOptions: {
			position: maps.ControlPosition.RIGHT
		},
		mapTypeControl: false,
		fullscreenControl: false,
		draggableCursor: "crosshair",
		draggingCursor: "pointer",
		styles: isDarkTheme ? Styles.googleMaps.darkTheme : Styles.googleMaps.lightTheme
	}
}

const CoordinatePicker = (props: CoordinatePickerProps) => {
	const state = ReduxStore.getState()
	const [useDarkTheme, setUseDarkTheme] = useState<boolean>(state.theme.value === "dark");
	const [selectedCoordinate, setSelectedCoordinate] = useState<Coordinate | undefined>(props.defaultValue);
	const [zoom, setZoom] = useState<number>();

	ReduxStore.subscribe(() => {
		const state = ReduxStore.getState()
		setUseDarkTheme(state.theme.value === "dark")
	})
	
	const gloc = useTranslations()

	React.useEffect(() => {
		setSelectedCoordinate(props.defaultValue)
	}, [props.defaultValue])

	const onClickOnMap = (e: ClickEventValue): any => {
		onChange({
			latitude : e.lat,
			longitude: e.lng,
		})
	}

	const onChange = (coordinate: Coordinate) => {
		setSelectedCoordinate(coordinate)
		if (props.onSelectedChanged) {
			props.onSelectedChanged(coordinate)
		}
	}

	const handleCancel = () => {
		if (props.onCancel) {
			props.onCancel()
		}
	}

	const handleMapChanges = (e: ChangeEventValue) => {
		setZoom(e.zoom)
	}

	const centerPoint = getCenterPoint(props.defaultValue)

	return (
		<Modal
			open={props.visibility}
			className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700 rounded-lg overflow-hidden"
			onCancel={handleCancel}
			width="64rem"
			closable={false}
			maskClosable={true}
			destroyOnClose={true}
			footer={<></>}
			title={<div className="flex items-center justify-between w-full pt-2.5 pb-2 pl-6 pr-2.5">
				<span className="text-slate-600 dark:text-zinc-300 mr-4">{`${gloc("Auth.Sessions.PickCoordinate")}`}</span>
				<Tooltip title={gloc("Actions.Close")} placement="bottom">
					<button type="button" onClick={handleCancel} className="inline-flex justify-center text-gray-700 dark:text-zinc-400 hover:text-slate-500 hover:dark:text-zinc-300 bg-transparent dark:bg-transparent border border-transparent dark:border-transparent hover:bg-white hover:border-gray-400 hover:dark:bg-zinc-800 active:bg-white active:dark:bg-zinc-900 hover:dark:border-zinc-700 rounded-md focus:outline-none focus-visible:outline-indigo-500 disabled-inline-flex px-1.5 py-1.5 ml-5">
						<XIcon className="w-5 h-5 mb-px mr-px" />
					</button>
				</Tooltip>
			</div>}>
			<div className="relative flex border-y border-zinc-200 dark:border-zinc-700 h-[30rem]">
				{process.env.GOOGLE_MAPS_API_KEY ? 
				<GoogleMap 
					bootstrapURLKeys={{ key: process.env.GOOGLE_MAPS_API_KEY }} 
					center={centerPoint} 
					defaultCenter={centerPoint || { lat: DEFAULT_CENTER_POINT.latitude, lng: DEFAULT_CENTER_POINT.longitude }}
					zoom={zoom} 
					defaultZoom={zoom || DEFAULT_ZOOM_LEVEL}
					onClick={onClickOnMap}
					onChange={handleMapChanges}
					options={(maps) => createMapOptions(maps, useDarkTheme)} 
					yesIWantToUseGoogleMapApiInternals>
						{selectedCoordinate ? <MapIndicator lat={selectedCoordinate.latitude} lng={selectedCoordinate.longitude} /> : <></>}
				</GoogleMap> :
				<div className="flex flex-col items-center justify-center h-full my-auto pb-10">
					<ExclamationIcon className="w-12 h-12 stroke-amber-600" />
					<span className="text-gray-500 dark:text-zinc-400 mt-2">{gloc("Auth.Sessions.MapsIsNotConfigured")} !</span>
				</div>
				}
			</div>
		</Modal>
	);
}

export default CoordinatePicker;

export const MapIndicator: React.FC<{lat: number, lng: number}> = (props) => {
	return (
		<MapsLocationPin className="w-10 h-10 fill-red-500 -ml-5 -mt-9" />
	)	
}