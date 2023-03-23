import React from "react"
import OptionsTab from "./OptionsTab"
import ValidationTab from "./ValidationTab"
import SchemaTab from "./SchemaTab"
import DefaultsTab from "./DefaultsTab"
import { Tab } from "@headlessui/react"
import { FieldInfo } from "../../../models/schema/FieldInfo"
import { BaseTabProps } from "./BaseTabProps"

export type FieldInfoEditorMode = "unspecified" | "create" | "update"

export type FieldInfoEditorActions = {
	onSave?: () => FieldInfo | undefined
	onCancel?: () => void
}

type FieldInfoEditorProps = {
	properties: FieldInfo[]
	actions: FieldInfoEditorActions
}

const FieldInfoEditor = (props: FieldInfoEditorProps & BaseTabProps) => {
	const handleSave = (): FieldInfo | undefined => {
		if (props.fieldInfo) {
			delete props.fieldInfo["validationResults"]
			return props.fieldInfo
		}
	}

	const handleCancel = () => {
		if (props.fieldInfo) {
			delete props.fieldInfo["validationResults"]
		}
	}
	
	if (props.actions) {
		props.actions.onSave = handleSave
	}

	if (props.actions) {
		props.actions.onCancel = handleCancel
	}

	if (props.fieldInfo) {
		return (
			<div className="max-h-[70vh] h-full w-full">
				<Tab.Panels>
					<Tab.Panel>
						<OptionsTab {...props} properties={props.properties} />
					</Tab.Panel>

					<Tab.Panel>
						<SchemaTab {...props} />
					</Tab.Panel>

					<Tab.Panel>
						<ValidationTab {...props} />
					</Tab.Panel>

					<Tab.Panel>
						<DefaultsTab {...props} />
					</Tab.Panel>
				</Tab.Panels>
			</div>
		);
	}
	else {
		return <></>
	}
}

export default FieldInfoEditor;