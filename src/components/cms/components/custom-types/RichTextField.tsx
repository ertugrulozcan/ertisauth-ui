import React from "react"
import RichTextEditor, { RichTextEditorContentInfo } from "../../../utils/RichTextEditor"
import { RichTextFieldProps } from "./RichTextFieldProps"
import { buildFieldValue } from "../../../../models/schema/FieldInfo"

const RichTextField = (props: RichTextFieldProps) => {
	const onContentChanged = (contentInfo: RichTextEditorContentInfo) => {
		buildFieldValue(props, contentInfo.content, props.bypassRequiredValueValidation, contentInfo)
	}

	return (
		<div>
			<RichTextEditor 
				id={props.fieldInfo.guid}
				initialValue={props.value || undefined} 
				onContentChange={onContentChanged} 
				disabled={props.fieldInfo.isReadonly && !props.allowEditIfReadonly} />
		</div>
	)
}

export default RichTextField;