import React from "react"
import { DateTimeHelper, FormatType } from "../../../helpers/DateTimeHelper"
import { InformationCircleIcon } from "@heroicons/react/solid"
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
import { useLang } from "../../../localization/LocalizationProvider"
import { useTranslations } from 'next-intl'

type FieldValidationRulesProps = {
	fieldInfo: FieldInfo
	className?: string
}

const hasValue = (obj: any) => {
	return obj !== null && obj !== undefined
}

const FieldValidationRules = (props: FieldValidationRulesProps) => {
	const selectedLocale = useLang()
	const gloc = useTranslations()

	var rules: string[] = []

	switch (props.fieldInfo.type.toString()) {
		// Primitive types
		case "object":
			const objectFieldInfo = props.fieldInfo as ObjectFieldInfo
			break;
		case "string":
			const stringFieldInfo = props.fieldInfo as StringFieldInfo
			if (hasValue(stringFieldInfo.minLength) && hasValue(stringFieldInfo.maxLength)) {
				rules.push(gloc("ValidationRules.String.MinMaxLengthRule", { minLength: stringFieldInfo.minLength, maxLength: stringFieldInfo.maxLength }))
			}
			else if (hasValue(stringFieldInfo.minLength)) {
				rules.push(gloc("ValidationRules.String.MinLengthRule", { minLength: stringFieldInfo.minLength }))
			}
			else if (hasValue(stringFieldInfo.maxLength)) {
				rules.push(gloc("ValidationRules.String.MaxLengthRule", { maxLength: stringFieldInfo.maxLength }))
			}

			if (stringFieldInfo.regexPattern) {
				rules.push(gloc("ValidationRules.String.RegexPatternRule", { regexPattern: stringFieldInfo.regexPattern }))
			}

			if (stringFieldInfo.restrictRegexPattern) {
				rules.push(gloc("ValidationRules.String.RestrictRegexPatternRule", { restrictRegexPattern: stringFieldInfo.restrictRegexPattern }))
			}

			break;
		case "integer":
			const integerFieldInfo = props.fieldInfo as IntegerFieldInfo
			if (hasValue(integerFieldInfo.minimum)) {
				rules.push(gloc("ValidationRules.Integer.MinRule", { minimum: integerFieldInfo.minimum }))
			}

			if (hasValue(integerFieldInfo.exclusiveMinimum)) {
				rules.push(gloc("ValidationRules.Integer.ExclusiveMinRule", { exclusiveMinimum: integerFieldInfo.exclusiveMinimum }))
			}
			
			if (hasValue(integerFieldInfo.maximum)) {
				rules.push(gloc("ValidationRules.Integer.MaxRule", { maximum: integerFieldInfo.maximum }))
			}
			
			if (hasValue(integerFieldInfo.exclusiveMaximum)) {
				rules.push(gloc("ValidationRules.Integer.ExclusiveMaxRule", { exclusiveMaximum: integerFieldInfo.exclusiveMaximum }))
			}
			
			if (hasValue(integerFieldInfo.multipleOf)) {
				rules.push(gloc("ValidationRules.Integer.MultipleOfRule", { multipleOf: integerFieldInfo.multipleOf }))
			}

			break;
		case "float":
			const floatFieldInfo = props.fieldInfo as FloatFieldInfo
			if (hasValue(floatFieldInfo.minimum)) {
				rules.push(gloc("ValidationRules.Float.MinRule", { minimum: floatFieldInfo.minimum }))
			}

			if (hasValue(floatFieldInfo.exclusiveMinimum)) {
				rules.push(gloc("ValidationRules.Float.ExclusiveMinRule", { exclusiveMinimum: floatFieldInfo.exclusiveMinimum }))
			}
			
			if (hasValue(floatFieldInfo.maximum)) {
				rules.push(gloc("ValidationRules.Float.MaxRule", { maximum: floatFieldInfo.maximum }))
			}
			
			if (hasValue(floatFieldInfo.exclusiveMaximum)) {
				rules.push(gloc("ValidationRules.Float.ExclusiveMaxRule", { exclusiveMaximum: floatFieldInfo.exclusiveMaximum }))
			}

			break;
		case "boolean":
			const booleanFieldInfo = props.fieldInfo as BooleanFieldInfo
			break;
		case "array":
			const arrayFieldInfo = props.fieldInfo as ArrayFieldInfo
			if (hasValue(arrayFieldInfo.minCount)) {
				rules.push(gloc("ValidationRules.Array.MinCountRule", { minCount: arrayFieldInfo.minCount }))
			}
			
			if (hasValue(arrayFieldInfo.maxCount)) {
				rules.push(gloc("ValidationRules.Array.MaxCountRule", { maxCount: arrayFieldInfo.maxCount }))
			}

			break;
		case "enum":
			const enumFieldInfo = props.fieldInfo as EnumFieldInfo
			break;
		case "const":
			const constantFieldInfo = props.fieldInfo as ConstantFieldInfo
			break;

		// Custom types
		case "json":
			const jsonFieldInfo = props.fieldInfo as JsonFieldInfo
			break;
		case "date":
			const dateFieldInfo = props.fieldInfo as DateFieldInfo
			if (hasValue(dateFieldInfo.minValue)) {
				rules.push(gloc("ValidationRules.Date.MinDateRule", { minValue: DateTimeHelper.format(dateFieldInfo.minValue, FormatType.Date, selectedLocale.languageCode) }))
			}
			
			if (hasValue(dateFieldInfo.maxValue)) {
				rules.push(gloc("ValidationRules.Date.MaxDateRule", { maxValue: DateTimeHelper.format(dateFieldInfo.maxValue, FormatType.Date, selectedLocale.languageCode) }))
			}

			break;
		case "datetime":
			const dateTimeFieldInfo = props.fieldInfo as DateTimeFieldInfo
			if (hasValue(dateTimeFieldInfo.minValue)) {
				rules.push(gloc("ValidationRules.DateTime.MinDateRule", { minValue: DateTimeHelper.format(dateTimeFieldInfo.minValue, FormatType.DateTimeWithSeconds, selectedLocale.languageCode) }))
			}
			
			if (hasValue(dateTimeFieldInfo.maxValue)) {
				rules.push(gloc("ValidationRules.DateTime.MaxDateRule", { maxValue: DateTimeHelper.format(dateTimeFieldInfo.maxValue, FormatType.DateTimeWithSeconds, selectedLocale.languageCode) }))
			}

			break;
		case "longtext":
			const longTextFieldInfo = props.fieldInfo as LongTextFieldInfo
			if (hasValue(longTextFieldInfo.minLength) && hasValue(longTextFieldInfo.maxLength)) {
				rules.push(gloc("ValidationRules.String.MinMaxLengthRule", { minLength: longTextFieldInfo.minLength, maxLength: longTextFieldInfo.maxLength }))
			}
			else if (hasValue(longTextFieldInfo.minLength)) {
				rules.push(gloc("ValidationRules.String.MinLengthRule", { minLength: longTextFieldInfo.minLength }))
			}
			else if (hasValue(longTextFieldInfo.maxLength)) {
				rules.push(gloc("ValidationRules.String.MaxLengthRule", { maxLength: longTextFieldInfo.maxLength }))
			}

			if (longTextFieldInfo.regexPattern) {
				rules.push(gloc("ValidationRules.String.RegexPatternRule", { regexPattern: longTextFieldInfo.regexPattern }))
			}

			if (longTextFieldInfo.restrictRegexPattern) {
				rules.push(gloc("ValidationRules.String.RestrictRegexPatternRule", { restrictRegexPattern: longTextFieldInfo.restrictRegexPattern }))
			}

			break;
		case "richtext":
			const richTextFieldInfo = props.fieldInfo as RichTextFieldInfo
			if (hasValue(richTextFieldInfo.minWordCount)) {
				rules.push(gloc("ValidationRules.RichText.MinWordCountRule", { minWordCount: richTextFieldInfo.minWordCount }))
			}
			
			if (hasValue(richTextFieldInfo.maxWordCount)) {
				rules.push(gloc("ValidationRules.RichText.MaxWordCountRule", { maxWordCount: richTextFieldInfo.maxWordCount }))
			}

			break;
		case "email":
			const emailAddressFieldInfo = props.fieldInfo as EmailAddressFieldInfo
			break;
		case "uri":
			const uriFieldInfo = props.fieldInfo as UriFieldInfo
			break;
		case "hostname":
			const hostNameFieldInfo = props.fieldInfo as HostNameFieldInfo
			break;
		case "color":
			const colorFieldInfo = props.fieldInfo as ColorFieldInfo
			break;
		case "location":
			const locationFieldInfo = props.fieldInfo as LocationFieldInfo
			rules.push(gloc("ValidationRules.Location.LatLongRule"))
			break;
		case "code":
			const codeFieldInfo = props.fieldInfo as CodeFieldInfo
			break;
	}

	if (rules.length > 0) {
		return (
			<ul className={props.className}>
				{rules.map((x, i) => {
					return (
						<li key={`${props.fieldInfo.name}_${i}`} className="flex items-center mb-1">
							<InformationCircleIcon className="fill-sky-500 w-4 h-4 mr-1" />
							<span className="text-xs font-normal leading-none text-gray-400 dark:text-gray-500">{x}</span>
						</li>
					)
				})}
			</ul>
		)
	}

	return (
		<></>
	)
}

export default FieldValidationRules;