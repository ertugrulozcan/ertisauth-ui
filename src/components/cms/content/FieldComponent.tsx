import React from "react"
import { FieldInfoContentProps } from "./FieldInfoContentProps"
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
import ObjectField from "../components/primitives/ObjectField"
import ArrayField from "../components/primitives/ArrayField"
import StringField from "../components/primitives/StringField"
import IntegerField from "../components/primitives/IntegerField"
import FloatField from "../components/primitives/FloatField"
import BooleanField from "../components/primitives/BooleanField"
import EnumField from "../components/primitives/EnumField"
import ConstantField from "../components/primitives/ConstantField"
import ColorField from "../components/custom-types/ColorField"
import DateField from "../components/custom-types/DateField"
import DateTimeField from "../components/custom-types/DateTimeField"
import EmailAddressField from "../components/custom-types/EmailAddressField"
import HostNameField from "../components/custom-types/HostNameField"
import UriField from "../components/custom-types/UriField"
import LongTextField from "../components/custom-types/LongTextField"
import LocationField from "../components/custom-types/LocationField"
import JsonField from "../components/custom-types/JsonField"
import CodeField from "../components/custom-types/CodeField"
import RichTextField from "../components/custom-types/RichTextField"
import ImageField from "../components/custom-types/ImageField"

const FieldComponent = (props: FieldInfoContentProps<FieldInfo, any>) => {
	switch (props.fieldInfo.type.toString()) {
		// Primitive types
		case "object":
			const objectFieldInfo = props.fieldInfo as ObjectFieldInfo
			return <ObjectField {...props} fieldInfo={objectFieldInfo} payload={objectFieldInfo} />
		case "string":
			const stringFieldInfo = props.fieldInfo as StringFieldInfo
			return <StringField {...props} fieldInfo={stringFieldInfo} payload={stringFieldInfo} />
		case "integer":
			const integerFieldInfo = props.fieldInfo as IntegerFieldInfo
			return <IntegerField {...props} fieldInfo={integerFieldInfo} payload={integerFieldInfo} />
		case "float":
			const floatFieldInfo = props.fieldInfo as FloatFieldInfo
			return <FloatField {...props} fieldInfo={floatFieldInfo} payload={floatFieldInfo} />
		case "boolean":
			const booleanFieldInfo = props.fieldInfo as BooleanFieldInfo
			return <BooleanField {...props} fieldInfo={booleanFieldInfo} payload={booleanFieldInfo} />
		case "array":
			const arrayFieldInfo = props.fieldInfo as ArrayFieldInfo
			return <ArrayField {...props} fieldInfo={arrayFieldInfo} payload={arrayFieldInfo} />
		case "enum":
			const enumFieldInfo = props.fieldInfo as EnumFieldInfo
			return <EnumField {...props} fieldInfo={enumFieldInfo} payload={enumFieldInfo} />
		case "const":
			const constantFieldInfo = props.fieldInfo as ConstantFieldInfo
			return <ConstantField {...props} fieldInfo={constantFieldInfo} payload={constantFieldInfo} />

		// Custom types
		case "json":
			const jsonFieldInfo = props.fieldInfo as JsonFieldInfo
			return <JsonField {...props} fieldInfo={jsonFieldInfo} payload={jsonFieldInfo} />
		case "date":
			const dateFieldInfo = props.fieldInfo as DateFieldInfo
			return <DateField {...props} fieldInfo={dateFieldInfo} payload={dateFieldInfo} />
		case "datetime":
			const dateTimeFieldInfo = props.fieldInfo as DateTimeFieldInfo
			return <DateTimeField {...props} fieldInfo={dateTimeFieldInfo} payload={dateTimeFieldInfo} />
		case "longtext":
			const longTextFieldInfo = props.fieldInfo as LongTextFieldInfo
			return <LongTextField {...props} fieldInfo={longTextFieldInfo} payload={longTextFieldInfo} />
		case "richtext":
			const richTextFieldInfo = props.fieldInfo as RichTextFieldInfo
			return <RichTextField {...props} fieldInfo={richTextFieldInfo} payload={richTextFieldInfo} />
		case "email":
			const emailAddressFieldInfo = props.fieldInfo as EmailAddressFieldInfo
			return <EmailAddressField {...props} fieldInfo={emailAddressFieldInfo} payload={emailAddressFieldInfo} />
		case "uri":
			const uriFieldInfo = props.fieldInfo as UriFieldInfo
			return <UriField {...props} fieldInfo={uriFieldInfo} payload={uriFieldInfo} />
		case "hostname":
			const hostNameFieldInfo = props.fieldInfo as HostNameFieldInfo
			return <HostNameField {...props} fieldInfo={hostNameFieldInfo} payload={hostNameFieldInfo} />
		case "color":
			const colorFieldInfo = props.fieldInfo as ColorFieldInfo
			return <ColorField {...props} fieldInfo={colorFieldInfo} payload={colorFieldInfo} />
		case "location":
			const locationFieldInfo = props.fieldInfo as LocationFieldInfo
			return <LocationField {...props} fieldInfo={locationFieldInfo} payload={locationFieldInfo} />
		case "code":
			const codeFieldInfo = props.fieldInfo as CodeFieldInfo
			return <CodeField {...props} fieldInfo={codeFieldInfo} payload={codeFieldInfo} />
		case "image":
			const imageFieldInfo = props.fieldInfo as ImageFieldInfo
			return <ImageField {...props} fieldInfo={imageFieldInfo} payload={imageFieldInfo} columnCount={props.fieldName === "defaultValue" ? 4 : undefined} boxSize={props.fieldName === "defaultValue" ? 11 : undefined} />
	}

	return (
		<></>
	)
}

export default FieldComponent;