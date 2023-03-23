import React from "react"
import FieldComponent from "./FieldComponent"
import FieldValidationErrors from "../components/FieldValidationErrors"
import FieldValidationRules from "../components/FieldValidationRules"
import { Tooltip } from 'antd'
import { XCircleIcon } from "@heroicons/react/outline"
import { FieldInfo } from "../../../models/schema/FieldInfo"
import { ImageFieldInfo } from "../../../models/schema/custom-types/ImageFieldInfo"
import { FieldInfoContentProps } from "./FieldInfoContentProps"
import { hasDefaultValue } from "../../../helpers/FieldInfoHelper"
import { useTranslations } from 'next-intl'

const resetButtonIgnoreList = [ "object", "array", "date", "datetime", "boolean", "const" ]
const minWidthComponentList = [ "date", "datetime", "boolean", "color", "image" ]
const highComponentList = [ "object", "array", "richtext", "json", "code" ]

export interface FieldInfoContentWrapperProps {
	className?: string
	verticalAligned?: boolean
}

const FieldInfoContentWrapper = (props: FieldInfoContentProps<FieldInfo, any> & FieldInfoContentWrapperProps) => {
	const gloc = useTranslations()

	const onFieldInfoResetButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		if (props.onReset) {
			props.onReset(props.fieldInfo)
		}
	};

	let resetButtonVisible = !resetButtonIgnoreList.some(x => x === props.fieldInfo.type)
	if (props.fieldInfo.isReadonly && !props.allowEditIfReadonly) {
		resetButtonVisible = false
	}

	let horizontalAlignment: "left" | "justify" | undefined
	if (props.fieldInfo.type === "image") {
		const imageFieldInfo = props.fieldInfo as ImageFieldInfo
		horizontalAlignment = imageFieldInfo.multiple ? "justify" : "left"
	}

	const minWidth = horizontalAlignment === "left" || minWidthComponentList.some(x => x === props.fieldInfo.type)
	const isHighComponent = highComponentList.some(x => x === props.fieldInfo.type)
	const isVerticalAligned = props.verticalAligned === undefined || props.verticalAligned
	const wrapperClass = "relative " + (minWidth ? "inline-block " : "") + ((resetButtonVisible || (!minWidth && isVerticalAligned)) ? "pr-8" : "")
	const resetButtonClass = "absolute stroke-gray-500 hover:stroke-rose-500 active:stroke-red-600 focus:outline-none focus-visible:outline-indigo-500 rounded-full h-fit right-0 " + (isHighComponent ? "top-3 " : "top-0 bottom-0 my-auto ")

	let value: any = props.value
	if (value === undefined || value === null) {
		if (hasDefaultValue(props.fieldInfo)) {
			value = props.fieldInfo.defaultValue
		}
	}

	return (
		<div className={"relative " + (props.className || "")}>
			<div className={wrapperClass}>
				<FieldComponent 
					fieldInfo={props.fieldInfo}
					value={value}
					fieldName={props.fieldName}
					session={props.session}
					bypassRequiredValueValidation={props.bypassRequiredValueValidation}
					allowEditIfReadonly={props.allowEditIfReadonly}
					onChange={props.onChange}
					mode={props.mode} />

				{resetButtonVisible ?
				<Tooltip title={gloc("Actions.Reset")} placement="bottom">
					<button type="button" onClick={onFieldInfoResetButtonClick} className={resetButtonClass}>
						<XCircleIcon className="stroke-inherit hover:stroke-inherit h-5 w-5" />
					</button>
				</Tooltip>
				:<></>}
			</div>

			<FieldValidationErrors fieldInfo={props.fieldInfo} className="mt-2" />
			<FieldValidationRules fieldInfo={props.fieldInfo} className="mt-2" />
		</div>
	)
}

export default FieldInfoContentWrapper;