import React from "react"
import CodeEditor from "../../../utils/CodeEditor"
import { JsonFieldProps } from "./JsonFieldProps"
import { trySerializeObject, tryDeserializeString } from "../../../../helpers/JsonHelper"
import { buildFieldValue } from "../../../../models/schema/FieldInfo"

const JsonField = (props: JsonFieldProps) => {
	const serializationResult = trySerializeObject(props.value, { indent: 4, tryParseIfString: true })
	
	const onChange = (value: string | undefined) => {
		const deserializationResult = tryDeserializeString(value)
		buildFieldValue(props, deserializationResult.isValid ? deserializationResult.object : deserializationResult.json, props.bypassRequiredValueValidation)
	}

	return (
		<CodeEditor code={serializationResult.json} language="json" onChange={onChange} disabled={props.fieldInfo.isReadonly && !props.allowEditIfReadonly} height={"20rem"} />
	)
}

export default JsonField;