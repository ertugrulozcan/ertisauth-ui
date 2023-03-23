import { Service } from 'typedi'
import { getPaginationQueryParams, toQueryString } from '../../helpers/RestHelper'
import { ActiveToken } from '../../models/auth/ActiveToken'
import { ErtisAuthConfiguration } from '../../configuration/ErtisAuthConfiguration'
import { ErrorResponseModel } from '../../models/ErrorResponseModel'
import { RevokedToken } from '../../models/auth/RevokedToken'
import { User } from '../../models/auth/users/User'
import { UserWithPassword } from '../../models/auth/users/UserWithPassword'
import { PaginatedResponse } from '../../models/PaginatedResponse'
import { PaginationQueryParams } from '../../models/PaginationQueryParams'
import { SessionGroupByLocation } from '../../models/auth/SessionGroup'
import { HttpMethod, RequestModel } from '../../models/RequestModel'
import { ResponseResult } from '../../models/ResponseResult'
import { executeRequest } from '../RestService'
import { IToken } from '../../models/auth/IToken'

@Service()
export class UserService {
	private config: ErtisAuthConfiguration = ErtisAuthConfiguration.fromEnvironment()

	async getUsersAsync(token: IToken, skip?: number, limit?: number, withCount?: boolean): Promise<ResponseResult<PaginatedResponse<User> | ErrorResponseModel>> {
		const queryString = toQueryString(getPaginationQueryParams(skip, limit, withCount))
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/users${queryString}`,
			method: HttpMethod.GET,
			headers: { 'Authorization': token.toString() }
		}

		return await executeRequest(request)
	}

	async getUserAsync(userId: string, token: IToken): Promise<ResponseResult<User | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/users/${userId}`,
			method: HttpMethod.GET,
			headers: { 'Authorization': token.toString() }
		}

		return await executeRequest(request)
	}

	async createUserAsync(user: UserWithPassword, token: IToken): Promise<ResponseResult<any | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/users`,
			method: HttpMethod.POST,
			headers: { 
				'Authorization': token.toString(), 
				'Content-Type': 'application/json' 
			},
			body: user
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

	async updateUserAsync(user: User, token: IToken): Promise<ResponseResult<User | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/users/${user._id}`,
			method: HttpMethod.PUT,
			headers: { 
				'Authorization': token.toString(), 
				'Content-Type': 'application/json' 
			},
			body: user
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

	async deleteUserAsync(id: string, token: IToken): Promise<ResponseResult<any | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/users/${id}`,
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

	async getActiveTokensAsync(
		token: IToken, 
		skip?: number | undefined, 
		limit?: number | undefined, 
		withCount?: boolean | undefined, 
		orderBy?: string | undefined, 
		sortDirection?: 'asc' | 'desc' | undefined): 
		Promise<ResponseResult<PaginatedResponse<ActiveToken> | ErrorResponseModel>>
	{
		const query = {
			where: {
				membership_id: this.config.membershipId
			}
		}

		const queryParams: PaginationQueryParams = new PaginationQueryParams(skip, limit, withCount, orderBy, sortDirection)
		let queryString = queryParams.toQueryString()
		if (queryString && queryString !== "") {
			queryString = "?" + queryString
		}

		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/active-tokens/_query${queryString}`,
			method: HttpMethod.POST,
			headers: { 'Authorization': token.toString() },
			body: query
		}

		return await executeRequest(request);
	}

	async getActiveTokensByUserAsync(
		userId: string,
		token: IToken, 
		skip?: number | undefined, 
		limit?: number | undefined, 
		withCount?: boolean | undefined, 
		orderBy?: string | undefined, 
		sortDirection?: 'asc' | 'desc' | undefined): 
		Promise<ResponseResult<PaginatedResponse<ActiveToken> | ErrorResponseModel>>
	{
		const query = {
			where: {
				user_id: userId,
				membership_id: this.config.membershipId
			}
		}

		const queryParams: PaginationQueryParams = new PaginationQueryParams(skip, limit, withCount, orderBy, sortDirection)
		let queryString = queryParams.toQueryString()
		if (queryString && queryString !== "") {
			queryString = "?" + queryString
		}

		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/active-tokens/_query${queryString}`,
			method: HttpMethod.POST,
			headers: { 'Authorization': token.toString() },
			body: query
		}

		return await executeRequest(request);
	}

	async getRevokedTokensByUserAsync(
		userId: string,
		token: IToken,
		skip: number | undefined = undefined,
		limit: number | undefined = undefined,
		withCount: boolean | undefined = undefined,
		orderBy: string | undefined = undefined,
		sortDirection: 'asc' | 'desc' | undefined = undefined):
		Promise<ResponseResult<PaginatedResponse<RevokedToken> | ErrorResponseModel>> {
		const query = {
			where: {
				user_id: userId,
				membership_id: this.config.membershipId,
				token_type: 'bearer_token'
			}
		}

		const queryParams: PaginationQueryParams = new PaginationQueryParams(skip, limit, withCount, orderBy, sortDirection)
		let queryString = queryParams.toQueryString()
		if (queryString && queryString !== "") {
			queryString = "?" + queryString
		}

		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/revoked-tokens/_query${queryString}`,
			method: HttpMethod.POST,
			headers: { 'Authorization': token.toString() },
			body: query
		}

		return await executeRequest(request);
	}

	async getGroupedActiveTokensByLocationAsync(token: IToken): Promise<ResponseResult<SessionGroupByLocation[] | ErrorResponseModel>>
	{
		const query = [
			{ 
				"$group" : { 
					"_id" : "$client_info.geo_location.city", 
					"count" : { 
						"$sum" : 1 
					}, 
					"geo_location" : { 
						"$first" : "$client_info.geo_location" 
					}
				}
			}
		]

		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/active-tokens/_aggregate`,
			method: HttpMethod.POST,
			headers: { 'Authorization': token.toString() },
			body: query
		}

		return await executeRequest(request);
	}

	async checkPasswordAsync(token: IToken, password: string): Promise<ResponseResult<any>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/users/check-password?password=${password}`,
			method: HttpMethod.GET,
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

	async changePasswordAsync(user: User, token: IToken, password: string): Promise<ResponseResult<any>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/users/${user._id}/change-password`,
			method: HttpMethod.PUT,
			headers: { 
				'Authorization': token.toString(), 
				'Content-Type': 'application/json' 
			},
			body: {
				password: password
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