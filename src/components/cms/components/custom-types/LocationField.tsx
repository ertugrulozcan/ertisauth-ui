import React, { useState } from "react"
import CoordinatePicker from "../../../utils/CoordinatePicker"
import { Tooltip } from "antd"
import { MapIcon } from "@heroicons/react/outline"
import { Styles } from "../../../Styles"
import { LocationFieldProps } from "./LocationFieldProps"
import { Coordinate, NullableCoordinate } from "../../../../models/auth/GeoLocationInfo"
import { buildFieldValue } from "../../../../models/schema/FieldInfo"
import { useTranslations } from 'next-intl'

const LocationField = (props: LocationFieldProps) => {
	const [coordinatePickerModalVisibility, setCoordinatePickerModalVisibility] = useState<boolean>(false);
	
	const loc = useTranslations('Schema')

	const onValueChange = function(e: React.FormEvent<HTMLInputElement>) {
		if (e.currentTarget.name === "latitude" || e.currentTarget.name === "longitude") {
			const value = (!e.currentTarget.value || e.currentTarget.value === "") ? null : parseFloat(e.currentTarget.value)
			
			if (e.currentTarget.name === "latitude") {
				if (value && (value > 90.0 || value < -90.0)) {
					return
				}

				let location: NullableCoordinate | null = null
				location = { latitude: value ?? null, longitude: props.value?.longitude ?? null }
				
				buildFieldValue(props, location, props.bypassRequiredValueValidation)
			}
			else if (e.currentTarget.name === "longitude") {
				if (value && (value > 180.0 || value < -180.0)) {
					return
				}

				let location: NullableCoordinate | null = null
				location = { latitude: props.value?.latitude ?? null, longitude: value ?? null }
				
				buildFieldValue(props, location, props.bypassRequiredValueValidation)
			}
		}
	}

	const onCoordinatePickerSelected = (selectedCoordinate: Coordinate) => {
		let location: NullableCoordinate | null = null
		location = { latitude: selectedCoordinate.latitude ?? null, longitude: selectedCoordinate.longitude ?? null }
		
		buildFieldValue(props, location, props.bypassRequiredValueValidation)
		setCoordinatePickerModalVisibility(false)
	}
	
	const onCoordinatePickerModalCancel = () => {
		setCoordinatePickerModalVisibility(false)
	}

	const isDisabled = props.fieldInfo.isReadonly && !props.allowEditIfReadonly

	return (
		<div className="flex items-center justify-between">
			<Tooltip title={loc("FieldInfo.PickFromMap")}>
				<button type="button" onClick={() => { setCoordinatePickerModalVisibility(true) }} className="inline-flex justify-center font-medium text-white bg-transparent dark:bg-transparent border border-borderline dark:border-zinc-600 hover:bg-white hover:border-gray-400 hover:dark:bg-zinc-800 active:bg-white active:dark:bg-zinc-900 hover:dark:border-zinc-400 rounded-md focus:outline-none focus-visible:outline-indigo-500 disabled-inline-flex px-2 py-2" disabled={isDisabled}>
					<MapIcon className="w-5 h-5 text-slate-500 dark:text-zinc-300" aria-hidden="true" />
				</button>
			</Tooltip>
			
			<div className="grid grid-cols-2 gap-5 w-full ml-4">
				<div className="flex rounded-md shadow-sm">
					<span className={Styles.input.group.icon + Styles.input.disabled}>{loc('Lat')}</span>
					<input 
						type="number" 
						name="latitude"
						placeholder={loc("Latitude")} 
						className={isDisabled ? (Styles.input.group.input + Styles.input.disabled) : Styles.input.group.input} 
						value={(props.value?.latitude || props.value?.latitude === 0.0) ? props.value?.latitude : ""} 
						min={-90.0}
						max={90.0}
						step={0.1}
						onChange={onValueChange}
						disabled={isDisabled} />
				</div>

				<div className="flex rounded-md shadow-sm">
					<span className={Styles.input.group.icon + Styles.input.disabled}>{loc('Long')}</span>
					<input 
						id="longitude"
						type="number" 
						name="longitude"
						placeholder={loc("Longitude")} 
						className={isDisabled ? (Styles.input.group.input + Styles.input.disabled) : Styles.input.group.input} 
						value={(props.value?.longitude || props.value?.longitude === 0.0) ? props.value?.longitude : ""} 
						min={-180.0}
						max={180.0}
						step={0.1}
						onChange={onValueChange}
						disabled={isDisabled} />
				</div>
			</div>

			<CoordinatePicker 
				defaultValue={props.value || undefined}
				visibility={coordinatePickerModalVisibility} 
				onSelectedChanged={onCoordinatePickerSelected} 
				onCancel={onCoordinatePickerModalCancel} />
		</div>
	)
}

export default LocationField;