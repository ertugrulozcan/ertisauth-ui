import { ValidationRules } from "../ValidationRules"
import { LocationFieldInfo } from "../../../models/schema/custom-types/LocationFieldInfo"
import { IFieldInfoValidator } from "../IFieldInfoValidator"
import { FieldValidationResult } from "../FieldValidationResult"
import { Coordinate } from "../../../models/auth/GeoLocationInfo"

export class LocationFieldValidator implements IFieldInfoValidator<LocationFieldInfo, Coordinate> {
	validateFieldInfo(fieldInfo: LocationFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []

		return validationResults
	}

	validateFieldInfoSchema(fieldInfo: LocationFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []
		return validationResults
	}

	validateValue(fieldInfo: LocationFieldInfo, value: Coordinate, bypassRequiredValueValidation?: boolean): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []
	
		if (!bypassRequiredValueValidation && !fieldInfo.isReadonly) {
			validationResults.push({
				isValid: !(fieldInfo.isRequired && !value || (!value?.latitude && !value?.longitude)),
				errorCode: ValidationRules.CommonRules.FieldRequired
			})
		}

		validationResults.push({
			isValid: !(value && value.latitude === null && value.longitude !== null),
			errorCode: ValidationRules.LocationRules.LatitudeRequired
		})

		validationResults.push({
			isValid: !(value && value.latitude !== null && value.longitude === null),
			errorCode: ValidationRules.LocationRules.LongitudeRequired
		})
		
		return validationResults
	}
}