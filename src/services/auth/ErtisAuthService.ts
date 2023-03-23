import { Service, Container } from 'typedi'
import { ErtisAuthConfiguration } from '../../configuration/ErtisAuthConfiguration'
import { ResponseResult } from '../../models/ResponseResult'
import { ErrorResponseModel } from '../../models/ErrorResponseModel'
import { ErtisAuthResource } from '../../models/auth/ErtisAuthResource'
import { ErtisAuthEvent } from '../../models/auth/events/ErtisAuthEvent'
import { Membership } from '../../models/auth/memberships/Membership'
import { Application } from '../../models/auth/applications/Application'
import { Provider } from '../../models/auth/providers/Provider'
import { Role } from '../../models/auth/roles/Role'
import { UserType } from '../../models/auth/user-types/UserType'
import { User } from '../../models/auth/users/User'
import { Webhook } from '../../models/auth/webhooks/Webhook'
import { Mailhook } from '../../models/auth/mailhooks/Mailhook'
import { ApplicationService } from './ApplicationService'
import { AuthEventService } from './EventService'
import { MembershipService } from './MembershipService'
import { ProviderService } from './ProviderService'
import { RoleService } from './RoleService'
import { UserService } from './UserService'
import { UserTypeService } from './UserTypeService'
import { WebhookService } from './WebhookService'
import { MailhookService } from './MailhookService'
import { PaginatedResponse } from '../../models/PaginatedResponse'
import { IToken } from '../../models/auth/IToken'

@Service()
export class ErtisAuthService {
	private config: ErtisAuthConfiguration = ErtisAuthConfiguration.fromEnvironment()

	async getErtisAuthResource(resourceName: string, id: string, token: IToken): Promise<ResponseResult<ErtisAuthResource<any> | ErrorResponseModel>> {
		switch (resourceName) {
			case "memberships": {
				const membershipService = Container.get(MembershipService);
				const response = await membershipService.getMembershipAsync(id, token)
				if (response.IsSuccess) {
					const membership = response.Data as Membership
					return {
						IsSuccess: true,
						Data: {
							_id: membership._id,
							title: membership.name,
							sys: membership.sys,
							object: membership
						}
					}
				}
				else {
					return response as ResponseResult<ErrorResponseModel>
				}
			}
			case "users": {
				const userService = Container.get(UserService);
				const response = await userService.getUserAsync(id, token)
				if (response.IsSuccess) {
					const user = response.Data as User
					return {
						IsSuccess: true,
						Data: userResourceConverter(user)
					}
				}
				else {
					return response as ResponseResult<ErrorResponseModel>
				}
			}
			case "user-types": {
				const userTypeService = Container.get(UserTypeService);
				const response = await userTypeService.getUserTypeAsync(id, token)
				if (response.IsSuccess) {
					const userType = response.Data as UserType
					return {
						IsSuccess: true,
						Data: {
							_id: userType._id,
							title: userType.name,
							sys: userType.sys,
							object: userType
						}
					}
				}
				else {
					return response as ResponseResult<ErrorResponseModel>
				}
			}
			case "applications": {
				const applicationService = Container.get(ApplicationService);
				const response = await applicationService.getApplicationAsync(id, token)
				if (response.IsSuccess) {
					const application = response.Data as Application
					return {
						IsSuccess: true,
						Data: {
							_id: application._id,
							title: application.name,
							sys: application.sys,
							object: application
						}
					}
				}
				else {
					return response as ResponseResult<ErrorResponseModel>
				}
			}
			case "roles": {
				const roleService = Container.get(RoleService);
				const response = await roleService.getRoleAsync(id, token)
				if (response.IsSuccess) {
					const role = response.Data as Role
					return {
						IsSuccess: true,
						Data: {
							_id: role._id,
							title: role.name,
							sys: role.sys,
							object: role
						}
					}
				}
				else {
					return response as ResponseResult<ErrorResponseModel>
				}
			}
			case "events": {
				const eventService = Container.get(AuthEventService);
				const response = await eventService.getAuthEventAsync(id, token)
				if (response.IsSuccess) {
					const event = response.Data as ErtisAuthEvent
					return {
						IsSuccess: true,
						Data: {
							_id: event._id,
							title: event.event_type,
							sys: {
								created_at: event.event_time,
								created_by: event.utilizer_id
							},
							object: event
						}
					}
				}
				else {
					return response as ResponseResult<ErrorResponseModel>
				}
			}
			case "providers": {
				const providerService = Container.get(ProviderService);
				const response = await providerService.getProviderAsync(id, token)
				if (response.IsSuccess) {
					const provider = response.Data as Provider
					return {
						IsSuccess: true,
						Data: {
							_id: provider._id,
							title: provider.name,
							sys: provider.sys,
							object: provider
						}
					}
				}
				else {
					return response as ResponseResult<ErrorResponseModel>
				}
			}
			case "tokens": {

			} 
			break;
			case "webhooks": {
				const webhookService = Container.get(WebhookService);
				const response = await webhookService.getWebhookAsync(id, token)
				if (response.IsSuccess) {
					const webhook = response.Data as Webhook
					return {
						IsSuccess: true,
						Data: {
							_id: webhook._id,
							title: webhook.name,
							sys: webhook.sys,
							object: webhook
						}
					}
				}
				else {
					return response as ResponseResult<ErrorResponseModel>
				}
			}
			break;
			case "mailhooks": {
				const mailhookService = Container.get(MailhookService);
				const response = await mailhookService.getMailhookAsync(id, token)
				if (response.IsSuccess) {
					const mailhook = response.Data as Mailhook
					return {
						IsSuccess: true,
						Data: {
							_id: mailhook._id,
							title: mailhook.name,
							sys: mailhook.sys,
							object: mailhook
						}
					}
				}
				else {
					return response as ResponseResult<ErrorResponseModel>
				}
			}
		}

		return {
			IsSuccess: false,
			Data: {
				Message: "Unknown or unsupported ertis-auth resource type: " + resourceName,
				ErrorCode: "ResourceNotFound",
				StatusCode: 404
			} as ErrorResponseModel
		}
	}
}

export const userResourceConverter = (user: User): ErtisAuthResource<User> => {
	if (!user) {
		return user
	}

	return {
		_id: user._id,
		title: user.firstname + " " + user.lastname,
		sys: user.sys,
		object: user
	}
}

export const paginatedUserResourceConverter = (users: PaginatedResponse<User>): PaginatedResponse<ErtisAuthResource<User>> => {
	if (!users) {
		return users
	}

	return {
		items: users.items?.map(x => userResourceConverter(x)),
		count: users.count
	}
}