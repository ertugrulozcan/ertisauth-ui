import { hasDefaultValue, isStringBaseFieldInfo } from "../../helpers/FieldInfoHelper"
import { Slugifier } from "../../helpers/Slugifier"
import { isNumber } from "../../helpers/StringHelper"
import { FieldInfo } from "../../models/schema/FieldInfo"
import { FieldType } from "../../models/schema/FieldType"
import { ArrayFieldInfo } from "../../models/schema/primitives/ArrayFieldInfo"
import { validateFieldInfo, validateFieldInfoSchema, validateValue } from "./FieldInfoValidator"
import { FieldValidationResult } from "./FieldValidationResult"
import { ValidationRules } from "./ValidationRules"
import { StringFieldInfo } from "../../models/schema/primitives/StringFieldInfo"

export function validateAllFieldInfo(fieldInfo: FieldInfo, properties: FieldInfo[]): { [key: string]: FieldValidationResult[] } {
	return {
		"options": validateOptionsTab(fieldInfo, properties),
		"schema": validateSchemaTab(fieldInfo),
		"validation": validateValidationsTab(fieldInfo),
		"defaults": validateDefaultsTab(fieldInfo)
	}
}

function validateOptionsTab(fieldInfo: FieldInfo, properties: FieldInfo[]): FieldValidationResult[] {
	const validationResults: FieldValidationResult[] = []

	if (!fieldInfo) {
		return []
	}

	// Display Name validations
	validationResults.push({
		isValid: !(!fieldInfo.displayName || fieldInfo.displayName.trim() === ""),
		fieldInfo,
		errorCode: ValidationRules.OptionsTabRules.DisplayNameRequired
	})

	validationResults.push({
		isValid: !properties.some(x => x.displayName === fieldInfo.displayName && x.guid !== fieldInfo.guid),
		fieldInfo,
		errorCode: ValidationRules.OptionsTabRules.DisplayNameAlreadyExist
	})
	
	// Name validations
	validationResults.push({
		isValid: !(!fieldInfo.name || fieldInfo.name.trim() === ""),
		fieldInfo,
		errorCode: ValidationRules.OptionsTabRules.FieldNameRequired
	})
	
	if (fieldInfo.name) {
		validationResults.push({
			isValid: !(isNumber(fieldInfo.name[0])),
			fieldInfo,
			errorCode: ValidationRules.OptionsTabRules.FieldNameCannotStartWithNumber
		})

		validationResults.push({
			isValid: !(fieldInfo.name.includes(' ')),
			fieldInfo,
			errorCode: ValidationRules.OptionsTabRules.FieldNameCannotContainBlankSpace
		})

		validationResults.push({
			isValid: Slugifier.IsValid(fieldInfo.name),
			fieldInfo,
			errorCode: ValidationRules.OptionsTabRules.FieldNameCannotContainSpecialCharacter
		})

		validationResults.push({
			isValid: !properties.some(x => x.name === fieldInfo.name && x.guid !== fieldInfo.guid),
			fieldInfo,
			errorCode: ValidationRules.OptionsTabRules.FieldNameAlreadyExist
		})
	}

	return validationResults
}

function validateSchemaTab(fieldInfo: FieldInfo): FieldValidationResult[] {
	if (!fieldInfo) {
		return []
	}

	switch (fieldInfo.type) {
		case FieldType.array:
			let arrayFieldInfo = fieldInfo as ArrayFieldInfo
			const arrayValidationResults = validateAllFieldInfo(arrayFieldInfo.itemSchema, [])
			if (arrayValidationResults["validation"].some(x => !x.isValid)) {
				return arrayValidationResults["validation"]
			}

			break;
	}

	return validateFieldInfoSchema(fieldInfo)
}

function validateValidationsTab(fieldInfo: FieldInfo): FieldValidationResult[] {
	const validationResults: FieldValidationResult[] = []

	if (!fieldInfo) {
		return []
	}

	let hasDefaultValue = 'defaultValue' in fieldInfo
	hasDefaultValue = hasDefaultValue === true ? (fieldInfo as any).defaultValue !== null : hasDefaultValue

	let isOverridedVirtualFieldInfo = false;
	if (isStringBaseFieldInfo(fieldInfo)) {
		const stringFieldInfo = fieldInfo as StringFieldInfo
		if (stringFieldInfo) {
			isOverridedVirtualFieldInfo = 
				stringFieldInfo.isVirtual && 
				stringFieldInfo.formatPattern !== null && 
				stringFieldInfo.formatPattern !== undefined && 
				stringFieldInfo.formatPattern.trim() !== ""
		}
	}
	
	const hasHiddenAndRequiredConflict = !hasDefaultValue && fieldInfo.isHidden && fieldInfo.isRequired && !isOverridedVirtualFieldInfo
	validationResults.push({
		isValid: !hasHiddenAndRequiredConflict,
		fieldInfo: fieldInfo,
		errorCode: ValidationRules.ValidationTabRules.HiddenAndRequiredConflict
	})

	const hasReadonlyAndRequiredConflict = !hasDefaultValue && fieldInfo.isReadonly && fieldInfo.isRequired
	validationResults.push({
		isValid: !hasReadonlyAndRequiredConflict,
		fieldInfo: fieldInfo,
		errorCode: ValidationRules.ValidationTabRules.ReadonlyAndRequiredConflict
	})

	return validateFieldInfo(fieldInfo).concat(validationResults)
}

function validateDefaultsTab(fieldInfo: FieldInfo): FieldValidationResult[] {
	if (!fieldInfo) {
		return []
	}
	
	if (hasDefaultValue(fieldInfo)) {
		return validateValue(fieldInfo, fieldInfo.defaultValue, true) || []
	}

	return []
}