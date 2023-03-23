import { Service } from 'typedi'
import { getPaginationQueryParams, toQueryString } from '../../helpers/RestHelper'
import { ErtisAuthConfiguration } from '../../configuration/ErtisAuthConfiguration'
import { ErrorResponseModel } from '../../models/ErrorResponseModel'
import { RawUserType, UserType } from '../../models/auth/user-types/UserType'
import { PaginatedResponse } from '../../models/PaginatedResponse'
import { HttpMethod, RequestModel } from '../../models/RequestModel'
import { ResponseResult } from '../../models/ResponseResult'
import { convertRaw, getProperties } from '../../models/schema/ContentType'
import { executeRequest } from '../RestService'
import { IToken } from '../../models/auth/IToken'

@Service()
export class UserTypeService {
	private config: ErtisAuthConfiguration = ErtisAuthConfiguration.fromEnvironment()

	async getUserTypesAsync(token: IToken, skip?: number, limit?: number, withCount?: boolean): Promise<ResponseResult<PaginatedResponse<UserType> | ErrorResponseModel>> {
		const queryString = toQueryString(getPaginationQueryParams(skip, limit, withCount))
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/user-types${queryString}`,
			method: HttpMethod.GET,
			headers: { 'Authorization': token.toString() }
		}

		return await executeRequest(request)
	}

	async getAllUserTypesAsync(token: IToken): Promise<ResponseResult<PaginatedResponse<UserType> | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/user-types/all`,
			method: HttpMethod.GET,
			headers: { 'Authorization': token.toString() }
		}

		const response: ResponseResult<PaginatedResponse<UserType> | ErrorResponseModel> = await executeRequest(request)
		if (response.IsSuccess) {
			const rawUserTypes = response.Data as PaginatedResponse<UserType>
			const userTypes: UserType[] = []
			for (let rawUserType of rawUserTypes.items) {
				var relations: any
				const fieldInfoOwnerRelations = await this.fetchFieldInfoOwnerRelationsAsync(rawUserType._id, token)
				if (fieldInfoOwnerRelations.IsSuccess) {
					relations = fieldInfoOwnerRelations.Data
				}
				
				const userType: UserType = {
					...rawUserType,
					properties: getProperties(rawUserType, relations)
				}

				userTypes.push(userType)
			}

			response.Data = {
				items: userTypes,
				count: rawUserTypes.count
			}
		}

		return response
	}

	async getUserTypeAsync(userTypeId: string, token: IToken): Promise<ResponseResult<UserType | ErrorResponseModel>> {
		const getUserTypeResponse = await this.fetchUserTypeAsync(userTypeId, token)
		if (getUserTypeResponse.IsSuccess) {
			const rawUserType = getUserTypeResponse.Data as RawUserType

			var relations: any
			const fieldInfoOwnerRelations = await this.fetchFieldInfoOwnerRelationsAsync(userTypeId, token)
			if (fieldInfoOwnerRelations.IsSuccess) {
				relations = fieldInfoOwnerRelations.Data
			}

			const userType: UserType = {
				...rawUserType,
				properties: getProperties(rawUserType, relations)
			}

			getUserTypeResponse.Data = userType
		}

		return getUserTypeResponse
	}

	private async fetchUserTypeAsync(userTypeId: string, token: IToken): Promise<ResponseResult<RawUserType | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/user-types/${userTypeId}`,
			method: HttpMethod.GET,
			headers: { 'Authorization': token.toString() }
		}

		return await executeRequest(request)
	}

	private async fetchFieldInfoOwnerRelationsAsync(userTypeId: string, token: IToken): Promise<ResponseResult<any | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/user-types/relations/${userTypeId}`,
			method: HttpMethod.GET,
			headers: { 'Authorization': token.toString() }
		}

		return await executeRequest(request)
	}

	async updateUserTypeAsync(userType: UserType, token: IToken): Promise<ResponseResult<any | ErrorResponseModel>> {
		const rawUserType = convertRaw(userType)
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/user-types/${userType._id}`,
			method: HttpMethod.PUT,
			headers: { 
				'Authorization': token.toString(), 
				'Content-Type': 'application/json' 
			},
			body: rawUserType
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

	async createUserTypeAsync(userType: UserType, token: IToken): Promise<ResponseResult<any | ErrorResponseModel>> {
		const rawUserType = convertRaw(userType)
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/user-types`,
			method: HttpMethod.POST,
			headers: { 
				'Authorization': token.toString(), 
				'Content-Type': 'application/json' 
			},
			body: rawUserType
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

	async deleteUserTypeAsync(id: string, token: IToken): Promise<ResponseResult<any | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/user-types/${id}`,
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