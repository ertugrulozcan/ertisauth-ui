import React from "react"
import ContentProperties from "../../content/ContentProperties"
import { Tooltip } from 'antd'
import { ObjectFieldProps } from "./ObjectFieldProps"
import { buildFieldValue } from "../../../../models/schema/FieldInfo"
import { useTranslations } from 'next-intl'

const ObjectField = (props: ObjectFieldProps) => {
	const gloc = useTranslations()
	
	const onChange = (value: any) => {
		buildFieldValue(props, value, props.bypassRequiredValueValidation)
	}

	if (!props.fieldInfo.isReadonly || props.allowEditIfReadonly) {
		return (
			<div className="relative">
				<ContentProperties 
					content={props.value} 
					contentType={props.fieldInfo} 
					session={props.session}
					onContentChange={onChange} 
					trackLineVisibility={true} 
					noDataVisibility={true}
					mode={props.mode} />
			</div>
		)
	}
	else {
		props.fieldInfo.properties.forEach(x => x.isReadonly = true)
		return (
			<div className="relative">
				<Tooltip title={gloc("Schema.ThisFieldIsReadonly")} placement="rightTop" color={"#ea580c"} getPopupContainer={triggerNode => triggerNode.parentElement as HTMLElement} overlayClassName={"z-899"}>
					<ContentProperties 
						content={props.value} 
						contentType={props.fieldInfo} 
						session={props.session}
						trackLineVisibility={true} 
						noDataVisibility={true}
						mode={props.mode} />
						
					<div className="absolute bg-diagonal-stripes rounded-lg w-full h-full top-0 left-0"></div>
				</Tooltip>
			</div>
		)
	}
}

export default ObjectField;