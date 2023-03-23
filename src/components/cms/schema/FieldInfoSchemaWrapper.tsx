import React from "react"
import { InformationCircleIcon } from "@heroicons/react/solid"
import { FieldInfo } from "../../../models/schema/FieldInfo"
import { ObjectFieldInfo } from '../../../models/schema/primitives/ObjectFieldInfo'
import { StringFieldInfo } from '../../../models/schema/primitives/StringFieldInfo'
import { ArrayFieldInfo } from '../../../models/schema/primitives/ArrayFieldInfo'
import { EnumFieldInfo } from '../../../models/schema/primitives/EnumFieldInfo'
import { ConstantFieldInfo } from '../../../models/schema/primitives/ConstantFieldInfo'
import { LongTextFieldInfo } from '../../../models/schema/custom-types/LongTextFieldInfo'
import { RichTextFieldInfo } from '../../../models/schema/custom-types/RichTextFieldInfo'
import { ImageFieldInfo } from '../../../models/schema/custom-types/ImageFieldInfo'
import { FieldInfoSchemaProps } from "./FieldInfoSchemaProps"
import ObjectSchemaFields from "./primitives/ObjectSchemaFields"
import ArraySchemaFields from "./primitives/ArraySchemaFields"
import StringSchemaFields from "./primitives/StringSchemaFields"
import EnumSchemaFields from "./primitives/EnumSchemaFields"
import ConstantSchemaFields from "./primitives/ConstantSchemaFields"
import LongTextSchemaFields from "./custom-types/LongTextSchemaFields"
import RichTextSchemaFields from "./custom-types/RichTextSchemaFields"
import ImageSchemaFields from "./custom-types/ImageSchemaFields"
import { useTranslations } from 'next-intl'

const FieldInfoSchemaWrapper = (props: FieldInfoSchemaProps<FieldInfo>) => {
	const loc = useTranslations("Schema")

	const fieldInfo = props.fieldInfo;
	const args = {
		ownerContentType: props.ownerContentType,
		session: props.session,
		onChange: props.onChange,
		mode: props.mode
	}

	switch (fieldInfo.type.toString()) {
		// Primitive types
		case "object":
			const objectFieldInfo = fieldInfo as ObjectFieldInfo
			return <ObjectSchemaFields {...args} fieldInfo={objectFieldInfo} payload={objectFieldInfo} />
		case "string":
			const stringFieldInfo = fieldInfo as StringFieldInfo
			return <StringSchemaFields {...args} fieldInfo={stringFieldInfo} payload={stringFieldInfo} />
		case "array":
			const arrayFieldInfo = fieldInfo as ArrayFieldInfo
			return <ArraySchemaFields {...args} fieldInfo={arrayFieldInfo} payload={arrayFieldInfo} />
		case "enum":
			const enumFieldInfo = fieldInfo as EnumFieldInfo
			return <EnumSchemaFields {...args} fieldInfo={enumFieldInfo} payload={enumFieldInfo} />
		case "const":
			const constantFieldInfo = fieldInfo as ConstantFieldInfo
			return <ConstantSchemaFields {...args} fieldInfo={constantFieldInfo} payload={constantFieldInfo} />
		case "integer":
		case "float":
		case "boolean":
			break;

		// Custom types
		case "longtext":
			const longTextFieldInfo = fieldInfo as LongTextFieldInfo
			return <LongTextSchemaFields {...args} fieldInfo={longTextFieldInfo} payload={longTextFieldInfo} />
		case "richtext":
			const richTextFieldInfo = fieldInfo as RichTextFieldInfo
			return <RichTextSchemaFields {...args} fieldInfo={richTextFieldInfo} payload={richTextFieldInfo} />
		case "tags":
		case "json":
		case "date":
		case "datetime":
		case "email":
		case "uri":
		case "hostname":
		case "color":
		case "location":
		case "code":
			break;
		case "image":
			const imageFieldInfo = fieldInfo as ImageFieldInfo
			return <ImageSchemaFields {...args} fieldInfo={imageFieldInfo} payload={imageFieldInfo} />
	}

	return (
		<div className="flex items-center border border-dashed border-neutral-500 dark:border-zinc-600 rounded shadow-sm px-5 py-3 mb-8">
			<InformationCircleIcon className="fill-sky-500 w-6 h-6" />
			<span className="text-neutral-500 font-medium text-sm ml-4">{loc('NotAvailableForThisFieldType')}</span>
		</div>
	)
}

export default FieldInfoSchemaWrapper;