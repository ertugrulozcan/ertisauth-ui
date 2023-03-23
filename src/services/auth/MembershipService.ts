import { Service } from 'typedi'
import { getPaginationQueryParams, toQueryString } from '../../helpers/RestHelper'
import { ErtisAuthConfiguration } from '../../configuration/ErtisAuthConfiguration'
import { ErrorResponseModel } from '../../models/ErrorResponseModel'
import { Membership } from '../../models/auth/memberships/Membership'
import { MembershipSettings } from '../../models/auth/memberships/MembershipSettings'
import { PaginatedResponse } from '../../models/PaginatedResponse'
import { HttpMethod, RequestModel } from '../../models/RequestModel'
import { ResponseResult } from '../../models/ResponseResult'
import { executeRequest } from '../RestService'
import { IToken } from '../../models/auth/IToken'

@Service()
export class MembershipService {
	private config: ErtisAuthConfiguration = ErtisAuthConfiguration.fromEnvironment()

	async getMembershipsAsync(token: IToken, skip?: number, limit?: number, withCount?: boolean): Promise<ResponseResult<PaginatedResponse<Membership> | ErrorResponseModel>> {
		const queryString = toQueryString(getPaginationQueryParams(skip, limit, withCount))
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships${queryString}`,
			method: HttpMethod.GET,
			headers: { 'Authorization': token.toString() }
		}

		return await executeRequest(request)
	}

	async getMembershipAsync(membershipId: string, token: IToken): Promise<ResponseResult<Membership | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${membershipId}`,
			method: HttpMethod.GET,
			headers: { 'Authorization': token.toString() }
		}

		return await executeRequest(request)
	}

	async getMembershipSettingsAsync(token: IToken): Promise<ResponseResult<MembershipSettings | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/settings`,
			method: HttpMethod.GET,
			headers: { 'Authorization': token.toString() }
		}

		return await executeRequest(request)
	}

	async createMembershipAsync(membership: Membership, token: IToken): Promise<ResponseResult<any | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships`,
			method: HttpMethod.POST,
			headers: { 
				'Authorization': token.toString(), 
				'Content-Type': 'application/json' 
			},
			body: membership
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

	async updateMembershipAsync(membership: Membership, token: IToken): Promise<ResponseResult<Membership | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${membership._id}`,
			method: HttpMethod.PUT,
			headers: { 
				'Authorization': token.toString(), 
				'Content-Type': 'application/json' 
			},
			body: membership
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

	async deleteMembershipAsync(id: string, token: IToken): Promise<ResponseResult<any | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${id}`,
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