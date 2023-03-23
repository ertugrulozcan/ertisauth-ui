import { IRbac } from '../../../models/auth/roles/IRbac'

export interface OrganizationSummary {
	_id: string
	isAuthorized: boolean
}

export interface OrganizationRbacs {
	organization: OrganizationSummary | undefined
	permissions: IRbac[]
	forbiddens: IRbac[]
}

export interface ActionModel {
	slug: string
	displayName: string
	description: string
	value: boolean | undefined
	rbacValue: boolean | undefined
	ubacValue: boolean | undefined
	isCustom: boolean
}

export interface ResourceModel {
	slug: string
	displayName: string
	actions: ActionModel[]
	organization: OrganizationSummary | undefined
	exceptionalCases: {
		permissions: IRbac[]
		forbiddens: IRbac[]
		ubacPermissions?: IRbac[] | undefined
		ubacForbiddens?: IRbac[] | undefined
	}
}

export interface OrganizationModel {
	organization: OrganizationSummary | undefined
	resources: ResourceModel[]
	isAuthorizedByRole: boolean
}

export interface ExceptionalCaseData<T> {
	rbac: IRbac,
	data: T,
	isPermitted: boolean,
	validationWarningMessage?: string
}