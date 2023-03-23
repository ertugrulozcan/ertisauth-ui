import React, { useState } from "react"
import NoData from "../../utils/NoData"
import Badge from "../../general/Badge"
import FieldInfoContentWrapper from "./FieldInfoContentWrapper"
import { Session } from "../../../models/auth/Session"
import { Tooltip } from 'antd'
import { ContentType } from "../../../models/schema/ContentType"
import { FieldInfo } from "../../../models/schema/FieldInfo"
import { Styles } from "../../Styles"
import { getSvgIcon } from "../../icons/Icons"
import { PrimitiveType } from "../../../models/schema/primitives/PrimitiveType"
import { validateContentType } from "../../../schema/validation/FieldInfoValidator"
import { FieldValidationResult } from "../../../schema/validation/FieldValidationResult"
import { FieldInfoEditorMode } from "../modal/FieldInfoEditor"
import { localizeFieldName } from "../../../helpers/ContentTypeHelper"
import { useTranslations } from 'next-intl'

type ContentPropertiesProps = {
	content: any
	contentType: ContentType
	hiddenFields?: string[]
	trackLineVisibility?: boolean
	noDataVisibility?: boolean
	session: Session
	onContentChange?(content: any): void
	onValidationResultsChange?(validationResults: FieldValidationResult[]): void
	mode: FieldInfoEditorMode
}

function isUnique(fieldInfo: any): fieldInfo is PrimitiveType {
	return "isUnique" in fieldInfo && fieldInfo["isUnique"] === true;
}

const ContentProperties = (props: ContentPropertiesProps) => {
	const [contentType, setContentType] = useState<ContentType>(props.contentType);

	const gloc = useTranslations()

	React.useEffect(() => {
		const validationContext = validateContentType(contentType, props.content)
		setContentType(validationContext.contentType)

		if (props.onValidationResultsChange) {
			props.onValidationResultsChange(validationContext.validationResults)
		}
	}, [props.contentType, props.content]) // eslint-disable-line react-hooks/exhaustive-deps

	const onFieldValueChange = (fieldInfo: FieldInfo, value: any) => {
		let updatedContent: any | null = { ...props.content, [fieldInfo.name]: value }
		
		if (props.onContentChange && updatedContent) {
			props.onContentChange(updatedContent)
		}

		const properties = contentType.properties.concat([])
		const index = properties.findIndex(x => x.name === fieldInfo.name)
		if (index !== -1) {
			properties[index] = fieldInfo
			setContentType(values => ({ ...values, ["properties"]: properties }))
		}
	}

	const onFieldReset = (fieldInfo: FieldInfo) => {
		const updatedContent: any | null = { ...props.content }
		delete updatedContent[fieldInfo.name]

		if (props.onContentChange && updatedContent) {
			props.onContentChange(updatedContent)
		}
	}

	const allProperties = contentType.properties || []
	const visibleProperties = allProperties.filter(x => !x.isHidden && !props.hiddenFields?.some(y => y === x.name))
	const hiddenProperties = allProperties.filter(x => x.isHidden || props.hiddenFields?.some(y => y === x.name))
	const visiblePropertiesCount = allProperties.length - hiddenProperties.length
	const isEmpty = visibleProperties ? visibleProperties.length === 0 : true

	let isObjectFieldInfo: boolean = false
	if ("type" in contentType && (contentType as any)["type"] === "object") {
		isObjectFieldInfo = true
	}

	return (
		<div className={isObjectFieldInfo ? "border border-gray-300 dark:border-zinc-600 rounded-l-lg rounded-r-lg pl-2 pr-3.5" : ""}>
			<ol className={`relative ${(props.trackLineVisibility && visiblePropertiesCount > 1 ? "border-l border-gray-300 dark:border-zinc-500" : "")} ${(isEmpty ? "" : (isObjectFieldInfo ? "mb-0 pt-1.5 pb-0.5" : "mb-0 pt-6 pb-8"))}`}>
				{allProperties.map((fieldInfo, index) => {
					let value: any = undefined
					if (props.content && fieldInfo.name in props.content) {
						value = props.content[fieldInfo.name]
					}

					const isHidden = hiddenProperties.includes(fieldInfo)
					
					return (
						<li id={fieldInfo.guid} key={fieldInfo.guid} className={`ml-8 py-4 ${isHidden ? "hidden": ""}`}>
							<div className="absolute -left-[1.05rem]">
								<Tooltip title={gloc(`Schema.FieldInfo.Types.${fieldInfo.type}`)} placement="left" getPopupContainer={triggerNode => triggerNode.parentElement as HTMLElement} overlayClassName={"z-899"}>
									<div className="bg-gray-100 dark:bg-[#202122] border border-gray-300 dark:border-zinc-500 rounded-full w-[2rem] h-[2rem]">
										{getSvgIcon(fieldInfo.type + "-field", "relative h-5 w-5 fill-sky-800 dark:fill-zinc-300 m-auto top-2/4 -translate-y-1/2")}
									</div>
								</Tooltip>
							</div>
							
							<div className="pb-0.5">
								<div className="mb-2.5">
									<div className="flex items-end">
										<span className="block text-[0.9rem] font-semibold text-gray-900 dark:text-zinc-300 leading-none self-center">
											{localizeFieldName(fieldInfo.name, fieldInfo.displayName, gloc) || fieldInfo.name}
											{fieldInfo.isRequired ? <span className={Styles.input.required}>*</span> : <></>}
										</span>
										
										{fieldInfo.isReadonly ? <Badge type="danger" className="ml-3">{gloc("Schema.Readonly")}</Badge> : <></>}
										{isUnique(fieldInfo) ? <Badge type="primary" className="ml-3">{gloc("Schema.Unique")}</Badge> : <></>}
									</div>
									
									{fieldInfo.description ? <span className="text-xs font-normal leading-none text-gray-400 dark:text-gray-500">{fieldInfo.description}</span> :
									<span className="block mb-3"></span>}
								</div>
								
								<FieldInfoContentWrapper
									fieldInfo={fieldInfo} 
									value={value} 
									fieldName={fieldInfo.name} 
									session={props.session}
									onChange={onFieldValueChange} 
									onReset={onFieldReset}
									mode={props.mode} />
							</div>
						</li>
					)
				})}
			</ol>

			<NoData title={gloc("Schema.ThereAreNoDefinedAnyFieldsInTheSchema")} visibility={isEmpty && props.noDataVisibility === true} className="pt-4 pb-8" />
		</div>
	)
}

export default ContentProperties;