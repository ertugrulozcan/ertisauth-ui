import { Service } from 'typedi'
import { getPaginationQueryParams, toQueryString } from '../../helpers/RestHelper'
import { ErtisAuthConfiguration } from '../../configuration/ErtisAuthConfiguration'
import { ErrorResponseModel } from '../../models/ErrorResponseModel'
import { ErtisAuthEvent } from '../../models/auth/events/ErtisAuthEvent'
import { PaginatedResponse } from '../../models/PaginatedResponse'
import { HttpMethod, RequestModel } from '../../models/RequestModel'
import { ResponseResult } from '../../models/ResponseResult'
import { executeRequest } from '../RestService'
import { EventType } from '../../models/EventType'
import { IToken } from '../../models/auth/IToken'

@Service()
export class AuthEventService {
	private config: ErtisAuthConfiguration = ErtisAuthConfiguration.fromEnvironment()

	async getAuthEventsAsync(token: IToken, skip?: number, limit?: number, withCount?: boolean): Promise<ResponseResult<PaginatedResponse<ErtisAuthEvent> | ErrorResponseModel>> {
		const queryString = toQueryString(getPaginationQueryParams(skip, limit, withCount))
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/events${queryString}`,
			method: HttpMethod.GET,
			headers: { 'Authorization': token.toString() }
		}

		return await executeRequest(request)
	}

	async getAuthEventAsync(eventId: string, token: IToken): Promise<ResponseResult<ErtisAuthEvent | ErrorResponseModel>> {
		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/events/${eventId}`,
			method: HttpMethod.GET,
			headers: { 'Authorization': token.toString() }
		}

		return await executeRequest(request)
	}

	async getUserEventsAsync(userId: string, token: IToken, skip?: number, limit?: number, withCount?: boolean): Promise<ResponseResult<PaginatedResponse<ErtisAuthEvent> | ErrorResponseModel>> {
		let queryString = toQueryString(getPaginationQueryParams(skip, limit, withCount))
		queryString = queryString ? `${queryString}&sort=event_time%20desc` : "?sort=event_time%20desc"

		const request: RequestModel = {
			url: `${this.config.baseUrl}/memberships/${this.config.membershipId}/events/_query${queryString}`,
			method: HttpMethod.POST,
			headers: { 'Authorization': token.toString() },
			body: { where: { utilizer_id: userId } }
		}

		return await executeRequest(request)
	}

	getEventTypes(): EventType[] {
		return [
			{
				name: "TokenGenerated",
				resource: "tokens",
				action: "create",
				impact: "perfect",
				hookable: true
			},
			{
				name: "TokenRefreshed",
				resource: "tokens",
				action: "create",
				impact: "positive",
				hookable: true
			},
			{
				name: "TokenRevoked",
				resource: "tokens",
				action: "delete",
				impact: "positive",
				hookable: true
			},
			{
				name: "TokenVerified",
				resource: "tokens",
				action: "other",
				impact: "negative",
				hookable: false
			},
			{
				name: "UserCreated",
				resource: "users",
				action: "create",
				impact: "perfect",
				hookable: true
			},
			{
				name: "UserUpdated",
				resource: "users",
				action: "update",
				impact: "neutral",
				hookable: true
			},
			{
				name: "UserDeleted",
				resource: "users",
				action: "delete",
				impact: "negative",
				hookable: true
			},
			{
				name: "UserPasswordReset",
				resource: "users",
				action: "other",
				impact: "neutral",
				hookable: true
			},
			{
				name: "UserPasswordChanged",
				resource: "users",
				action: "other",
				impact: "positive",
				hookable: true
			},
			{
				name: "UserTypeCreated",
				resource: "user-types",
				action: "create",
				impact: "perfect",
				hookable: true
			},
			{
				name: "UserTypeUpdated",
				resource: "user-types",
				action: "update",
				impact: "neutral",
				hookable: true
			},
			{
				name: "UserTypeDeleted",
				resource: "user-types",
				action: "delete",
				impact: "negative",
				hookable: true
			},
			{
				name: "ApplicationCreated",
				resource: "applications",
				action: "create",
				impact: "perfect",
				hookable: true
			},
			{
				name: "ApplicationUpdated",
				resource: "applications",
				action: "update",
				impact: "neutral",
				hookable: true
			},
			{
				name: "ApplicationDeleted",
				resource: "applications",
				action: "delete",
				impact: "negative",
				hookable: true
			},
			{
				name: "RoleCreated",
				resource: "roles",
				action: "create",
				impact: "perfect",
				hookable: true
			},
			{
				name: "RoleUpdated",
				resource: "roles",
				action: "update",
				impact: "neutral",
				hookable: true
			},
			{
				name: "RoleDeleted",
				resource: "roles",
				action: "delete",
				impact: "negative",
				hookable: true
			},
			{
				name: "MembershipCreated",
				resource: "memberships",
				action: "create",
				impact: "perfect",
				hookable: true
			},
			{
				name: "MembershipUpdated",
				resource: "memberships",
				action: "update",
				impact: "neutral",
				hookable: true
			},
			{
				name: "MembershipDeleted",
				resource: "memberships",
				action: "delete",
				impact: "negative",
				hookable: true
			},
			{
				name: "ProviderCreated",
				resource: "providers",
				action: "create",
				impact: "perfect",
				hookable: true
			},
			{
				name: "ProviderUpdated",
				resource: "providers",
				action: "update",
				impact: "neutral",
				hookable: true
			},
			{
				name: "ProviderDeleted",
				resource: "providers",
				action: "delete",
				impact: "negative",
				hookable: true
			},
			{
				name: "WebhookCreated",
				resource: "webhooks",
				action: "create",
				impact: "perfect",
				hookable: true
			},
			{
				name: "WebhookUpdated",
				resource: "webhooks",
				action: "update",
				impact: "neutral",
				hookable: true
			},
			{
				name: "WebhookDeleted",
				resource: "webhooks",
				action: "delete",
				impact: "negative",
				hookable: true
			},
			{
				name: "WebhookRequestSent",
				resource: "webhooks",
				action: "other",
				impact: "positive",
				hookable: false
			},
			{
				name: "WebhookRequestFailed",
				resource: "webhooks",
				action: "other",
				impact: "disaster",
				hookable: false
			},
			{
				name: "MailhookCreated",
				resource: "mailhooks",
				action: "create",
				impact: "perfect",
				hookable: true
			},
			{
				name: "MailhookUpdated",
				resource: "mailhooks",
				action: "update",
				impact: "neutral",
				hookable: true
			},
			{
				name: "MailhookDeleted",
				resource: "mailhooks",
				action: "delete",
				impact: "negative",
				hookable: true
			},
			{
				name: "MailhookMailSent",
				resource: "mailhooks",
				action: "other",
				impact: "positive",
				hookable: false
			},
			{
				name: "MailhookMailFailed",
				resource: "mailhooks",
				action: "other",
				impact: "disaster",
				hookable: false
			}
		]
	}
}