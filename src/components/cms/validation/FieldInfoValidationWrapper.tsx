import React from "react"
import { FieldInfo } from "../../../models/schema/FieldInfo"
import { ObjectFieldInfo } from '../../../models/schema/primitives/ObjectFieldInfo'
import { StringFieldInfo } from '../../../models/schema/primitives/StringFieldInfo'
import { IntegerFieldInfo } from '../../../models/schema/primitives/IntegerFieldInfo'
import { FloatFieldInfo } from '../../../models/schema/primitives/FloatFieldInfo'
import { BooleanFieldInfo } from '../../../models/schema/primitives/BooleanFieldInfo'
import { ArrayFieldInfo } from '../../../models/schema/primitives/ArrayFieldInfo'
import { EnumFieldInfo } from '../../../models/schema/primitives/EnumFieldInfo'
import { ConstantFieldInfo } from '../../../models/schema/primitives/ConstantFieldInfo'
import { JsonFieldInfo } from '../../../models/schema/custom-types/JsonFieldInfo'
import { DateFieldInfo } from '../../../models/schema/custom-types/DateFieldInfo'
import { DateTimeFieldInfo } from '../../../models/schema/custom-types/DateTimeFieldInfo'
import { LongTextFieldInfo } from '../../../models/schema/custom-types/LongTextFieldInfo'
import { RichTextFieldInfo } from '../../../models/schema/custom-types/RichTextFieldInfo'
import { EmailAddressFieldInfo } from '../../../models/schema/custom-types/EmailAddressFieldInfo'
import { UriFieldInfo } from '../../../models/schema/custom-types/UriFieldInfo'
import { HostNameFieldInfo } from '../../../models/schema/custom-types/HostNameFieldInfo'
import { ColorFieldInfo } from '../../../models/schema/custom-types/ColorFieldInfo'
import { LocationFieldInfo } from '../../../models/schema/custom-types/LocationFieldInfo'
import { CodeFieldInfo } from '../../../models/schema/custom-types/CodeFieldInfo'
import { ImageFieldInfo } from '../../../models/schema/custom-types/ImageFieldInfo'
import { FieldInfoValidationProps } from "./FieldInfoValidationProps"
import ObjectValidationFields from "./primitives/ObjectValidationFields"
import ArrayValidationFields from "./primitives/ArrayValidationFields"
import StringValidationFields from "./primitives/StringValidationFields"
import IntegerValidationFields from "./primitives/IntegerValidationFields"
import FloatValidationFields from "./primitives/FloatValidationFields"
import BooleanValidationFields from "./primitives/BooleanValidationFields"
import EnumValidationFields from "./primitives/EnumValidationFields"
import ConstantValidationFields from "./primitives/ConstantValidationFields"
import ColorValidationFields from "./custom-types/ColorValidationFields"
import DateValidationFields from "./custom-types/DateValidationFields"
import DateTimeValidationFields from "./custom-types/DateTimeValidationFields"
import EmailAddressValidationFields from "./custom-types/EmailAddressValidationFields"
import HostNameValidationFields from "./custom-types/HostNameValidationFields"
import UriValidationFields from "./custom-types/UriValidationFields"
import LongTextValidationFields from "./custom-types/LongTextValidationFields"
import LocationValidationFields from "./custom-types/LocationValidationFields"
import JsonValidationFields from "./custom-types/JsonValidationFields"
import CodeValidationFields from "./custom-types/CodeValidationFields"
import RichTextValidationFields from "./custom-types/RichTextValidationFields"
import ImageValidationFields from "./custom-types/ImageValidationFields"

const FieldInfoValidationWrapper = (props: FieldInfoValidationProps<FieldInfo>) => {
	const fieldInfo = props.fieldInfo;
	const args = {
		session: props.session,
		onChange: props.onChange,
		mode: props.mode
	}
	
	switch (fieldInfo.type.toString()) {
		// Primitive types
		case "object":
			const objectFieldInfo = fieldInfo as ObjectFieldInfo
			return <ObjectValidationFields {...args} fieldInfo={objectFieldInfo} payload={objectFieldInfo} />
		case "string":
			const stringFieldInfo = fieldInfo as StringFieldInfo
			return <StringValidationFields {...args} fieldInfo={stringFieldInfo} payload={stringFieldInfo} />
		case "integer":
			const integerFieldInfo = fieldInfo as IntegerFieldInfo
			return <IntegerValidationFields {...args} fieldInfo={integerFieldInfo} payload={integerFieldInfo} />
		case "float":
			const floatFieldInfo = fieldInfo as FloatFieldInfo
			return <FloatValidationFields {...args} fieldInfo={floatFieldInfo} payload={floatFieldInfo} />
		case "boolean":
			const booleanFieldInfo = fieldInfo as BooleanFieldInfo
			return <BooleanValidationFields {...args} fieldInfo={booleanFieldInfo} payload={booleanFieldInfo} />
		case "array":
			const arrayFieldInfo = fieldInfo as ArrayFieldInfo
			return <ArrayValidationFields {...args} fieldInfo={arrayFieldInfo} payload={arrayFieldInfo} />
		case "enum":
			const enumFieldInfo = fieldInfo as EnumFieldInfo
			return <EnumValidationFields {...args} fieldInfo={enumFieldInfo} payload={enumFieldInfo} />
		case "const":
			const constantFieldInfo = fieldInfo as ConstantFieldInfo
			return <ConstantValidationFields {...args} fieldInfo={constantFieldInfo} payload={constantFieldInfo} />

		// Custom types
		case "json":
			const jsonFieldInfo = fieldInfo as JsonFieldInfo
			return <JsonValidationFields {...args} fieldInfo={jsonFieldInfo} payload={jsonFieldInfo} />
		case "date":
			const dateFieldInfo = fieldInfo as DateFieldInfo
			return <DateValidationFields {...args} fieldInfo={dateFieldInfo} payload={dateFieldInfo} />
		case "datetime":
			const dateTimeFieldInfo = fieldInfo as DateTimeFieldInfo
			return <DateTimeValidationFields {...args} fieldInfo={dateTimeFieldInfo} payload={dateTimeFieldInfo} />
		case "longtext":
			const longTextFieldInfo = fieldInfo as LongTextFieldInfo
			return <LongTextValidationFields {...args} fieldInfo={longTextFieldInfo} payload={longTextFieldInfo} />
		case "richtext":
			const richTextFieldInfo = fieldInfo as RichTextFieldInfo
			return <RichTextValidationFields {...args} fieldInfo={richTextFieldInfo} payload={richTextFieldInfo} />
		case "email":
			const emailAddressFieldInfo = fieldInfo as EmailAddressFieldInfo
			return <EmailAddressValidationFields {...args} fieldInfo={emailAddressFieldInfo} payload={emailAddressFieldInfo} />
		case "uri":
			const uriFieldInfo = fieldInfo as UriFieldInfo
			return <UriValidationFields {...args} fieldInfo={uriFieldInfo} payload={uriFieldInfo} />
		case "hostname":
			const hostNameFieldInfo = fieldInfo as HostNameFieldInfo
			return <HostNameValidationFields {...args} fieldInfo={hostNameFieldInfo} payload={hostNameFieldInfo} />
		case "color":
			const colorFieldInfo = fieldInfo as ColorFieldInfo
			return <ColorValidationFields {...args} fieldInfo={colorFieldInfo} payload={colorFieldInfo} />
		case "location":
			const locationFieldInfo = fieldInfo as LocationFieldInfo
			return <LocationValidationFields {...args} fieldInfo={locationFieldInfo} payload={locationFieldInfo} />
		case "code":
			const codeFieldInfo = fieldInfo as CodeFieldInfo
			return <CodeValidationFields {...args} fieldInfo={codeFieldInfo} payload={codeFieldInfo} />
		case "image":
			const imageFieldInfo = fieldInfo as ImageFieldInfo
			return <ImageValidationFields {...args} fieldInfo={imageFieldInfo} payload={imageFieldInfo} />
	}

	return (
		<></>
	)
}

export default FieldInfoValidationWrapper;