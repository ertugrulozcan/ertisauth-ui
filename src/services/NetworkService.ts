import { Service } from 'typedi'
import { ErtisAuthConfiguration } from '../configuration/ErtisAuthConfiguration'
import { ErrorResponseModel } from '../models/ErrorResponseModel'
import { HttpMethod, RequestModel } from '../models/RequestModel'
import { ResponseResult } from '../models/ResponseResult'
import { executeRequest } from './RestService'
import { SmtpServer } from '../models/mailing/SmtpServer'

interface IpifyResponse {
	ip: string
}

@Service()
export class NetworkService {
	async ping(): Promise<boolean> {
		try {
			const ertisAuthConfig = ErtisAuthConfiguration.fromEnvironment()
			const response = await fetch(`${ertisAuthConfig.baseUrl}/ping`, { method: HttpMethod.GET });
			return response.ok
		}
		catch (ex) {
			console.error(ex)
			return false
		}
	}

	async retrieveIPAddressAsync(): Promise<ResponseResult<string | ErrorResponseModel>> {
		try {
			const request: RequestModel = {
				url: `https://api.ipify.org?format=json`,
				method: HttpMethod.GET
			}

			const response = await executeRequest<IpifyResponse>(request)
			if (response.IsSuccess) {
				return {
					Data: (response.Data as IpifyResponse).ip,
					IsSuccess: true
				}
			}
			else {
				return {
					Data: response.Data as ErrorResponseModel,
					IsSuccess: false
				}
			}	
		} 
		catch (ex) {
			let message: string
			if (ex instanceof Error) {
				message = ex.message
			}
			else {
				message = String(ex)
			}

			return {
				Data: {
					Message: message,
					ErrorCode: "InternalServerError",
					StatusCode: 500
				},
				IsSuccess: false
			}
		}
	}

	async smtpServerTestConnectionAsync(smtpServer: SmtpServer): Promise<ResponseResult<any | ErrorResponseModel>> {
		const ertisAuthConfig = ErtisAuthConfiguration.fromEnvironment()
		const request: RequestModel = {
			url: `${ertisAuthConfig.baseUrl}/healthcheck/smtp-server-test`,
			method: HttpMethod.POST,
			headers: { 
				'Content-Type': 'application/json' 
			},
			body: smtpServer
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
}