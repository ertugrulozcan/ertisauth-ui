import { Service } from 'typedi'
import { getPaginationQueryParams, toQueryString } from '../../helpers/RestHelper'
import { ErtisAuthConfiguration } from '../../configuration/ErtisAuthConfiguration'
import { ErrorResponseModel } from '../../models/ErrorResponseModel'
import { Mailhook } from '../../models/auth/mailhooks/Mailhook'
import { PaginatedResponse } from '../../models/PaginatedResponse'
import { HttpMethod, RequestModel } from '../../models/RequestModel'
import { ResponseResult } from '../../models/ResponseResult'
import { executeRequest } from '../RestService'
import { IToken } from '../../models/auth/IToken'

@Service()
export class MailhookService {
	private config: ErtisAuthConfiguration = ErtisAuthConfiguration.fromEnvironment()

	async getMailhooksAsync(token: IToken, skip?: number, limit?: number, withCount?: boolean): Promise<ResponseResult<PaginatedResponse<Mailhook> | ErrorResponseModel>> {
		const queryString = toQueryString(getPaginationQueryParams(skip, limit, withCount))
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/mailhooks${queryString}`,
			method: HttpMethod.GET,
			headers: { 'Authorization': token.toString() }
		}

		return await executeRequest(request)
	}

	async getMailhookAsync(mailhookId: string, token: IToken): Promise<ResponseResult<Mailhook | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/mailhooks/${mailhookId}`,
			method: HttpMethod.GET,
			headers: { 'Authorization': token.toString() }
		}

		return await executeRequest(request)
	}

	async createMailhookAsync(mailhook: Mailhook, token: IToken): Promise<ResponseResult<any | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/mailhooks`,
			method: HttpMethod.POST,
			headers: { 
				'Authorization': token.toString(), 
				'Content-Type': 'application/json' 
			},
			body: mailhook
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

	async updateMailhookAsync(mailhook: Mailhook, token: IToken): Promise<ResponseResult<Mailhook | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/mailhooks/${mailhook._id}`,
			method: HttpMethod.PUT,
			headers: { 
				'Authorization': token.toString(), 
				'Content-Type': 'application/json' 
			},
			body: mailhook
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

	async deleteMailhookAsync(id: string, token: IToken): Promise<ResponseResult<any | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/mailhooks/${id}`,
			method: HttpMethod.DELETE,
			headers: { 
				'Authorization': token.toString()
			}
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