import { Service } from 'typedi'
import { getPaginationQueryParams, toQueryString } from '../../helpers/RestHelper'
import { ErtisAuthConfiguration } from '../../configuration/ErtisAuthConfiguration'
import { ErrorResponseModel } from '../../models/ErrorResponseModel'
import { IToken } from '../../models/auth/IToken'
import { Application } from '../../models/auth/applications/Application'
import { PaginatedResponse } from '../../models/PaginatedResponse'
import { HttpMethod, RequestModel } from '../../models/RequestModel'
import { ResponseResult } from '../../models/ResponseResult'
import { executeRequest } from '../RestService'

@Service()
export class ApplicationService {
	private config: ErtisAuthConfiguration = ErtisAuthConfiguration.fromEnvironment()

	async getApplicationsAsync(token: IToken, skip?: number, limit?: number, withCount?: boolean): Promise<ResponseResult<PaginatedResponse<Application> | ErrorResponseModel>> {
		const queryString = toQueryString(getPaginationQueryParams(skip, limit, withCount))
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/applications${queryString}`,
			method: HttpMethod.GET,
			headers: { 'Authorization': token.toString() }
		}

		return await executeRequest(request)
	}

	async getApplicationAsync(applicationId: string, token: IToken): Promise<ResponseResult<Application | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/applications/${applicationId}`,
			method: HttpMethod.GET,
			headers: { 'Authorization': token.toString() }
		}

		return await executeRequest(request)
	}

	async createApplicationAsync(application: Application, token: IToken): Promise<ResponseResult<any | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/applications`,
			method: HttpMethod.POST,
			headers: { 
				'Authorization': token.toString(), 
				'Content-Type': 'application/json' 
			},
			body: application
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

	async updateApplicationAsync(application: Application, token: IToken): Promise<ResponseResult<Application | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/applications/${application._id}`,
			method: HttpMethod.PUT,
			headers: { 
				'Authorization': token.toString(), 
				'Content-Type': 'application/json' 
			},
			body: application
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

	async deleteApplicationAsync(id: string, token: IToken): Promise<ResponseResult<any | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/applications/${id}`,
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