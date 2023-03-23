import { SessionToken } from "../../../models/auth/SessionToken"
import { ErrorResponseModel } from "../../../models/ErrorResponseModel"
import { ResponseResult } from "../../../models/ResponseResult"

export type ProviderLoginProps = {
	ipAddress?: string 
	userAgent?: string
	onSigningIn(): void
	callback(provider: string, response: ResponseResult<SessionToken | ErrorResponseModel>): void
}