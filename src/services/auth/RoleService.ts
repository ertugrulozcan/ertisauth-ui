import { Service } from 'typedi'
import { getPaginationQueryParams, toQueryString } from '../../helpers/RestHelper'
import { capitalize } from '../../helpers/StringHelper'
import { ErtisAuthConfiguration } from '../../configuration/ErtisAuthConfiguration'
import { ErrorResponseModel } from '../../models/ErrorResponseModel'
import { Role } from '../../models/auth/roles/Role'
import { PaginatedResponse } from '../../models/PaginatedResponse'
import { HttpMethod, RequestModel } from '../../models/RequestModel'
import { ResponseResult } from '../../models/ResponseResult'
import { executeRequest } from '../RestService'
import { IToken } from '../../models/auth/IToken'

@Service()
export class RoleService {
	private config: ErtisAuthConfiguration = ErtisAuthConfiguration.fromEnvironment()

	async getRolesAsync(token: IToken, skip?: number, limit?: number, withCount?: boolean): Promise<ResponseResult<PaginatedResponse<Role> | ErrorResponseModel>> {
		const queryString = toQueryString(getPaginationQueryParams(skip, limit, withCount))
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/roles${queryString}`,
			method: HttpMethod.GET,
			headers: { 'Authorization': token.toString() }
		}

		return await executeRequest(request)
	}

	async getRoleAsync(roleId: string, token: IToken): Promise<ResponseResult<Role | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/roles/${roleId}`,
			method: HttpMethod.GET,
			headers: { 'Authorization': token.toString() }
		}

		return await executeRequest(request)
	}

	async createRoleAsync(role: Role, token: IToken): Promise<ResponseResult<any | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/roles`,
			method: HttpMethod.POST,
			headers: { 
				'Authorization': token.toString(), 
				'Content-Type': 'application/json' 
			},
			body: role
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

	async updateRoleAsync(role: Role, token: IToken): Promise<ResponseResult<Role | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/roles/${role._id}`,
			method: HttpMethod.PUT,
			headers: { 
				'Authorization': token.toString(), 
				'Content-Type': 'application/json' 
			},
			body: role
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

	async deleteRoleAsync(id: string, token: IToken): Promise<ResponseResult<any | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/roles/${id}`,
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

const localizedResources = [ 
	"memberships", 
	"users", 
	"user-types", 
	"applications", 
	"roles", 
	"providers", 
	"sessions",
	"tokens", 
	"contents", 
	"content-types", 
	"collections", 
	"pages", 
	"nested-types", 
	"redirections",
	"webhooks", 
	"cms-webhooks", 
	"mailhooks", 
	"events", 
	"cms-events", 
	"locales", 
	"files",
	"stock-media-providers"
]

export const localizePluralResourceName = (resourceSlug: string, loc: (key: string, args?: any) => string, applyCapitalize?: boolean): string => {
	if (localizedResources.includes(resourceSlug)) {
		if (applyCapitalize) {
			return capitalize(loc(`Resources.Plural.${resourceSlug}`))
		}
		else {
			return loc(`Resources.Plural.${resourceSlug}`)
		}
	}

	return resourceSlug
}

export const localizeSingularResourceName = (resourceSlug: string, loc: (key: string, args?: any) => string, applyCapitalize?: boolean): string => {
	if (localizedResources.includes(resourceSlug)) {
		if (applyCapitalize) {
			return capitalize(loc(`Resources.Singular.${resourceSlug}`))
		}
		else {
			return loc(`Resources.Singular.${resourceSlug}`)
		}
	}

	return resourceSlug
}

const localizedActions = [ "create", "read", "update", "delete", "publish", "unpublish" ]
export const localizeActionName = (actionSlug: string, loc: (key: string, args?: any) => string, applyCapitalize?: boolean): string => {
	if (localizedActions.includes(actionSlug)) {
		if (applyCapitalize) {
			return capitalize(loc(`Actions.${actionSlug}`))
		}
		else {
			return loc(`Actions.${actionSlug}`)	
		}
	}

	return actionSlug
}