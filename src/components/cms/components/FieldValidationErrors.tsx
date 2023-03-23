import React from "react"
import { ExclamationIcon } from "@heroicons/react/solid"
import { FieldInfo } from "../../../models/schema/FieldInfo"
import { useTranslations } from 'next-intl'

type FieldValidationErrorsProps = {
	fieldInfo: FieldInfo
	className?: string
}

const FieldValidationErrors = (props: FieldValidationErrorsProps) => {
	const gloc = useTranslations()

	if (props.fieldInfo.validationResults && props.fieldInfo.validationResults.some(x => !x.isValid)) {
		return (
			<ul className="mt-2">
				{props.fieldInfo.validationResults.filter(x => !x.isValid).map((x, i) => {
					const errorMessage = x.customErrorMessage ?? (x.messageParameters ? gloc(`Validations.${x.errorCode}`, x.messageParameters) : gloc(`Validations.${x.errorCode}`))

					return (
						<li key={`${props.fieldInfo.name}_${i}`} className="flex items-center mb-1">
							<ExclamationIcon className="fill-red-500 w-4 h-4 mr-1" />
							<span className="text-xs font-normal leading-none text-gray-400 dark:text-gray-500">{errorMessage}</span>
						</li>
					)
				})}
			</ul>
		)
	}
	else {
		return (
			<></>
		)
	}
}

export default FieldValidationErrors;