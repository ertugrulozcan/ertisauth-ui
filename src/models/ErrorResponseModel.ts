export interface ErrorResponseModel {
	Message: string
	ErrorCode: string
	StatusCode: number
}

export interface SchemaValidationErrorResponse extends ErrorResponseModel {
	Errors: SchemaValidationErrorModel[]
}

export interface ModelValidationErrorResponse extends ErrorResponseModel {
	ValidationErrors: string[]
}

export interface SchemaValidationErrorModel {
	Message: string
	FieldName: string
	FieldPath: string
}