import React from "react"
import CodeEditor from "../../../utils/CodeEditor"
import { Code } from "../../../../models/schema/custom-types/CodeFieldInfo"
import { CodeFieldProps } from "./CodeFieldProps"
import { buildFieldValue } from "../../../../models/schema/FieldInfo"

const CodeField = (props: CodeFieldProps) => {
	const onCodeChange = (value: string | undefined) => {
		let codeModel: Code | undefined = value !== undefined ? { code: value, language: props.value?.language } : undefined
		updateCode(codeModel)
	}

	const onLanguageChange = (value: string | undefined) => {
		let codeModel: Code = { code: props.value?.code, language: value }
		updateCode(codeModel)
	}

	const updateCode = function(code: Code | undefined) {
		buildFieldValue(props, code, props.bypassRequiredValueValidation)
	}

	return (
		<CodeEditor 
			code={props.value?.code} 
			language={props.value?.language} 
			onChange={onCodeChange} 
			onLanguageChange={onLanguageChange} 
			showTitleBar={true} 
			showLanguagesDropdown={true}
			disabled={props.fieldInfo.isReadonly && !props.allowEditIfReadonly} 
			height={"20rem"} />
	)
}

export default CodeField;