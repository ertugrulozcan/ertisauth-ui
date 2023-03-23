import { Service } from 'typedi'
import { ReactFacebookLoginInfo } from 'react-facebook-login'
import { GoogleCredentialResponse } from '../../components/auth/providers/GoogleLogin'
import { AuthenticationResult } from "@azure/msal-browser"
import { ErtisAuthConfiguration } from '../../configuration/ErtisAuthConfiguration'
import { ErrorResponseModel } from '../../models/ErrorResponseModel'
import { Provider } from '../../models/auth/providers/Provider'
import { HttpMethod, RequestModel } from '../../models/RequestModel'
import { ResponseResult } from '../../models/ResponseResult'
import { executeRequest } from '../RestService'
import { IToken } from '../../models/auth/IToken'
import { SessionToken } from '../../models/auth/SessionToken'
import { ProviderInfo } from '../../models/auth/providers/ProviderInfo'

@Service()
export class ProviderService {
	private config: ErtisAuthConfiguration = ErtisAuthConfiguration.fromEnvironment()

	async getProvidersAsync(token: IToken): Promise<ResponseResult<Provider[] | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/providers`,
			method: HttpMethod.GET,
			headers: { 'Authorization': token.toString() }
		}

		return await executeRequest(request)
	}

	async getProviderAsync(providerId: string, token: IToken): Promise<ResponseResult<Provider | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/providers/${providerId}`,
			method: HttpMethod.GET,
			headers: { 'Authorization': token.toString() }
		}

		return await executeRequest(request)
	}

	async getActiveProvidersAsync(): Promise<ResponseResult<ProviderInfo[] | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/active-providers`,
			method: HttpMethod.GET
		}

		return await executeRequest(request)
	}

	async updateProviderAsync(provider: Provider, token: IToken): Promise<ResponseResult<Provider | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/providers/${provider._id}`,
			method: HttpMethod.PUT,
			headers: { 
				'Authorization': token.toString(), 
				'Content-Type': 'application/json' 
			},
			body: provider
		}

		try {
			return await executeRequest(request)
		}
		catch (ex) {
			let message
			if (ex instanceof Error) {
				message = ex.message
			}
			else {
				message = String(ex)
			}

			const error: ErrorResponseModel = {
				Message: message,
				ErrorCode: "ClientSideException",
				StatusCode: 0
			}

			const response: ResponseResult<ErrorResponseModel> = {
				IsSuccess: false,
				Data: error
			}

			return response
		}
	}

	async loginWithFacebookAsync(user: ReactFacebookLoginInfo, appId: string, ipAddress?: string, userAgent?: string): Promise<ResponseResult<SessionToken | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/oauth/facebook/login`,
			method: HttpMethod.POST,
			body: { 
				user,
				appId
			},
			headers: {
				'Content-Type': 'application/json',
				'X-Ertis-Alias': this.config.membershipId,
				'X-IpAddress': ipAddress || '',
				'X-UserAgent': userAgent || '',
			}
		}

		return await executeRequest(request)
	}

	async loginWithGoogleAsync(payload: GoogleCredentialResponse, ipAddress?: string, userAgent?: string): Promise<ResponseResult<SessionToken | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/oauth/google/login`,
			method: HttpMethod.POST,
			body: { 
				token: payload,
				clientId: payload.clientId
			},
			headers: {
				'Content-Type': 'application/json',
				'X-Ertis-Alias': this.config.membershipId,
				'X-IpAddress': ipAddress || '',
				'X-UserAgent': userAgent || '',
			}
		}

		return await executeRequest(request)
	}

	async loginWithMicrosoftAsync(payload: AuthenticationResult, clientId: string, ipAddress?: string, userAgent?: string): Promise<ResponseResult<SessionToken | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/oauth/microsoft/login`,
			method: HttpMethod.POST,
			body: { 
				token: payload,
				clientId: clientId
			},
			headers: {
				'Content-Type': 'application/json',
				'X-Ertis-Alias': this.config.membershipId,
				'X-IpAddress': ipAddress || '',
				'X-UserAgent': userAgent || '',
			}
		}

		return await executeRequest(request)
	}
}