import { User } from '../models/auth/users/User'
import { Role } from '../models/auth/roles/Role'
import { IRbac } from '../models/auth/roles/IRbac'
import { Rbac } from '../models/auth/roles/Rbac'
import { Ubac } from '../models/auth/roles/Ubac'
import { IHasUbacs } from '../models/auth/users/IHasUbacs'
import { OrganizationSummary } from "../models/auth/roles/ViewModels"
import { OrganizationModel, OrganizationRbacs, ActionModel, ResourceModel } from '../models/auth/roles/ViewModels'
import { localizePluralResourceName, localizeSingularResourceName, localizeActionName } from "../services/auth/RoleService"
import { objectToDictionary } from './ObjectHelper'

const resourceOrder = [ 
	"organizations", 
	"users", 
	"user-types", 
	"roles", 
	"applications", 
	"memberships", 
	"providers", 
	"sessions", 
	"tokens", 
	"contents", 
	"content-types", 
	"collections", 
	"pages", 
	"nested-types", 
	"webhooks", 
	"cms-webhooks", 
	"mailhooks", 
	"redirections",
	"events", 
	"cms-events", 
	"files",
	"stock-media-providers",
	"locales" 
]

const defaults = {
	cms: {
		"contents": [ "create", "read", "update", "delete", "publish", "unpublish" ],
		"content-types": [ "create", "read", "update", "delete" ],
		"collections": [ "create", "read", "update", "delete", "publish", "unpublish" ],
		"pages": [ "create", "read", "update", "delete", "publish", "unpublish" ],
		"nested-types": [ "create", "read", "update", "delete", "publish", "unpublish" ],
		"cms-webhooks": [ "create", "read", "update", "delete" ],
		"cms-events": [ "read" ],
		"redirections": [ "create", "read", "update", "delete" ],
		"locales": [ "create", "read", "update", "delete" ],
		"files": [ "create", "read", "update", "delete" ],
		"stock-media-providers": [ "create", "read", "update", "delete" ]
	} as { [k: string]: string[] },
	auth: {
		"organizations": [ "create", "read", "update", "delete" ],
		"memberships": [ "create", "read", "update", "delete" ],
		"users": [ "create", "read", "update", "delete" ],
		"user-types": [ "create", "read", "update", "delete" ],
		"applications": [ "create", "read", "update", "delete" ],
		"roles": [ "create", "read", "update", "delete" ],
		"events": [ "read" ],
		"providers": [ "create", "read", "update", "delete" ],
		"sessions": [ "read" ],
		"tokens": [ "create", "read" ],
		"webhooks": [ "create", "read", "update", "delete" ],
		"mailhooks": [ "create", "read", "update", "delete" ],
		"files": [ "create", "read", "update", "delete" ]
	} as { [k: string]: string[] }
}

/*
	Rbac dizisini organizasyona göre gruplar
*/
export const groupByOrganization = (rbacs: IRbac[]): { key: string; value: IRbac[]; }[] => {
	const dictionary: {[k: string]: IRbac[]} = {}

	for (let rbac of rbacs) {
		if (rbac.hasCategory()) {
			const organizationId = rbac.getCategory()
			if (dictionary[organizationId]) {
				dictionary[organizationId].push(rbac)
			}
			else {
				dictionary[organizationId] = [rbac]
			}
		}
		else {
			const category = "uncategorized"
			if (dictionary[category]) {
				dictionary[category].push(rbac)
			}
			else {
				dictionary[category] = [rbac]
			}
		}
	}

	return objectToDictionary<IRbac[]>(dictionary)
}

/*
	Rbac dizisini resource'a göre gruplar
*/
export const groupByResource = (rbacs: IRbac[]): { key: string; value: IRbac[]; }[] => {
	const dictionary: {[k: string]: IRbac[]} = {}

	for (let rbac of rbacs) {
		if (dictionary[rbac.resource.value]) {
			dictionary[rbac.resource.value].push(rbac)
		}
		else {
			dictionary[rbac.resource.value] = [rbac]
		}
	}

	return objectToDictionary<IRbac[]>(dictionary)
}

/*
	Verilen rolün tüm rbac tanımlarını organized ve unorganized olarak ikiye böler, OrganizationRbacs modellerinin içine organization'leri yerleştirir ve organizasyona göre hepsini gruplar
*/
export const groupAll = (hasUbacsModel: IHasUbacs, organizations: OrganizationSummary[], rbacKind: "rbac" | "ubac"): OrganizationRbacs[] => {
	const organizationRbacs: OrganizationRbacs[] = []
	const unorganizedRbacs: OrganizationRbacs = {
		organization: undefined,
		permissions: [],
		forbiddens: []
	}

	let groupedPermissionRbacsByOrganization: { key: string; value: IRbac[]; }[] = []
	if (hasUbacsModel.permissions) {
		const permissionRbacs = hasUbacsModel.permissions.map(x => rbacKind === "rbac" ? new Rbac(x) : new Ubac(x))
		groupedPermissionRbacsByOrganization = groupByOrganization(permissionRbacs)
	}

	let groupedForbiddenRbacsByOrganization: { key: string; value: IRbac[]; }[] = []
	if (hasUbacsModel.forbidden) {
		const forbiddenRbacs = hasUbacsModel.forbidden.map(x => rbacKind === "rbac" ? new Rbac(x) : new Ubac(x))
		groupedForbiddenRbacsByOrganization = groupByOrganization(forbiddenRbacs)
	}

	for (let pair of groupedPermissionRbacsByOrganization) {
		const organization = organizations.find(x => x._id === pair.key)
		if (organization) {
			const organizationRbac = organizationRbacs.find(x => x.organization?._id === organization._id)
			if (organizationRbac) {
				organizationRbac.permissions = pair.value
			}
			else {
				organizationRbacs.push({
					organization: organization,
					permissions: pair.value,
					forbiddens: []
				})
			}
		}
		else {
			unorganizedRbacs.permissions = pair.value
		}
	}

	for (let pair of groupedForbiddenRbacsByOrganization) {
		const organization = organizations.find(x => x._id === pair.key)
		if (organization) {
			const organizationRbac = organizationRbacs.find(x => x.organization?._id === organization._id)
			if (organizationRbac) {
				organizationRbac.forbiddens = pair.value
			}
			else {
				organizationRbacs.push({
					organization: organization,
					permissions: [],
					forbiddens: pair.value
				})
			}
		}
		else {
			unorganizedRbacs.forbiddens = pair.value
		}
	}

	for (let organization of organizations) {
		if (!organizationRbacs.some(x => x.organization?._id === organization._id)) {
			organizationRbacs.push({
				organization: organization,
				permissions: [],
				forbiddens: []
			})
		}
	}

	return organizationRbacs.concat([unorganizedRbacs])
}

export const generateOrganizationModels = (organizationRbacs: OrganizationRbacs[], organizationUbacs: OrganizationRbacs[] | undefined, loc: (key: string, args?: any) => string): OrganizationModel[] => {
	const organizationModels: OrganizationModel[] = []

	for (let organizationRbac of organizationRbacs) {
		const organizationUbac = organizationUbacs ? (organizationRbac.organization ? organizationUbacs.find(x => x.organization?._id === organizationRbac.organization?._id) : organizationUbacs.find(x => !x.organization)) : undefined

		organizationModels.push({
			organization: organizationRbac.organization,
			resources: generateResourceModels(organizationRbac.permissions, organizationRbac.forbiddens, organizationUbac?.permissions, organizationUbac?.forbiddens, organizationRbac.organization, loc),
			isAuthorizedByRole: !organizationRbac.organization || organizationRbac.organization.isAuthorized
		})
	}

	return organizationModels
}

export const localizeActionDescription = (actionSlug: string, resourceSlug: string, loc: (key: string, args?: any) => string): string => {
	const localizedResourceName = actionSlug === "read" ? localizePluralResourceName(resourceSlug, loc) : localizeSingularResourceName(resourceSlug, loc)
	return loc(`ActionDescription_${actionSlug}`, { resource: localizedResourceName })
}

export const distinctRbacArray = (rbacs: IRbac[] | undefined): IRbac[] | undefined => {
	if (!rbacs) {
		return rbacs
	}

	const distinctList: IRbac[] = []
	for (let rbac of rbacs) {
		if (!distinctList.some(x => x.path === rbac.path)) {
			distinctList.push(rbac)
		}
	}

	return distinctList
}

export const generateResourceModels = (allPermissions: IRbac[], allForbiddens: IRbac[], allUbacPermissions: IRbac[] | undefined, allUbacForbiddens: IRbac[] | undefined, organization: OrganizationSummary | undefined, loc: (key: string, args?: any) => string): ResourceModel[] => {
	const resourceModels: ResourceModel[] = []

	const defaultResources = organization ? defaults.cms : defaults.auth
	const defaultResourcesDictionary = objectToDictionary(defaultResources)
	const allResources = defaultResourcesDictionary.map(x => x.key)

	const groupedPermissionsByResource = groupByResource(allPermissions)
	const groupedForbiddensByResource = groupByResource(allForbiddens)

	for (let resourceSlug of allResources) {
		if (!groupedPermissionsByResource.some(x => x.key === resourceSlug)) {
			groupedPermissionsByResource.push({ key: resourceSlug, value: [] })
		}

		if (!groupedForbiddensByResource.some(x => x.key === resourceSlug)) {
			groupedForbiddensByResource.push({ key: resourceSlug, value: [] })
		}
	}

	const groupedUbacPermissionsByResource = allUbacPermissions ? groupByResource(allUbacPermissions) : undefined
	const groupedUbacForbiddensByResource = allUbacForbiddens ? groupByResource(allUbacForbiddens) : undefined
	
	for (let pair of groupedPermissionsByResource) {
		const resourceSlug = pair.key
		const resourcePermissionRbacs = pair.value

		const permissions: IRbac[] = resourcePermissionRbacs.filter(x => !x.isExceptional());
		const forbiddens: IRbac[] = groupedForbiddensByResource.find(x => x.key === resourceSlug)?.value?.filter(x => !x.isExceptional()) || [];
		const exceptionalPermissions: IRbac[] = resourcePermissionRbacs.filter(x => x.isExceptional());
		const exceptionalForbiddens: IRbac[] = [];

		const ubacPermissionRbacs = groupedUbacPermissionsByResource?.find(x => x.key === resourceSlug)?.value;
		const ubacForbiddenRbacs = groupedUbacForbiddensByResource?.find(x => x.key === resourceSlug)?.value;
		const ubacPermissions = ubacPermissionRbacs?.filter(x => !x.isExceptional());
		const ubacForbiddens = ubacForbiddenRbacs?.filter(x => !x.isExceptional());
		const exceptionalUbacPermissions = ubacPermissionRbacs?.filter(x => x.isExceptional());
		const exceptionalUbacForbiddens = ubacForbiddenRbacs?.filter(x => x.isExceptional());

		if (!resourceModels.some(x => x.slug === resourceSlug)) {
			resourceModels.push({
				slug: resourceSlug,
				displayName: localizePluralResourceName(resourceSlug, loc, true),
				organization: organization,
				actions: generateActionModels(
					permissions, 
					forbiddens,
					ubacPermissions,
					ubacForbiddens,
					organization,
					resourceSlug,
					loc),
				exceptionalCases: {
					permissions: exceptionalPermissions,
					forbiddens: exceptionalForbiddens,
					ubacPermissions: exceptionalUbacPermissions,
					ubacForbiddens: exceptionalUbacForbiddens
				}
			})
		}
		else {
			const index = resourceModels.findIndex(x => x.slug === resourceSlug)
			const exceptionalPermissionsByResource = resourceModels[index].exceptionalCases.permissions
			const exceptionalForbiddensByResource = resourceModels[index].exceptionalCases.forbiddens
			const exceptionalUbacPermissionsByResource = resourceModels[index].exceptionalCases.ubacPermissions
			const exceptionalUbacForbiddensByResource = resourceModels[index].exceptionalCases.ubacForbiddens

			resourceModels[index] = {
				slug: resourceSlug,
				displayName: localizePluralResourceName(resourceSlug, loc, true),
				organization: organization,
				actions: generateActionModels(
					permissions, 
					forbiddens,
					ubacPermissions,
					ubacForbiddens,
					organization,
					resourceSlug,
					loc),
				exceptionalCases: {
					permissions: distinctRbacArray(exceptionalPermissionsByResource.concat(exceptionalPermissions)) || [],
					forbiddens: distinctRbacArray(exceptionalForbiddensByResource.concat(exceptionalForbiddens)) || [],
					ubacPermissions: distinctRbacArray(exceptionalUbacPermissionsByResource && exceptionalUbacPermissions ? exceptionalUbacPermissionsByResource?.concat(exceptionalUbacPermissions) : exceptionalUbacPermissions),
					ubacForbiddens: distinctRbacArray(exceptionalUbacForbiddensByResource && exceptionalUbacForbiddens ? exceptionalUbacForbiddensByResource?.concat(exceptionalUbacForbiddens) : exceptionalUbacForbiddens)
				}
			}
		}
	}

	for (let pair of groupedForbiddensByResource) {
		const resourceSlug = pair.key
		const resourceForbiddenRbacs = pair.value

		const permissions: IRbac[] = groupedPermissionsByResource.find(x => x.key === resourceSlug)?.value?.filter(x => !x.isExceptional()) || [];
		const forbiddens: IRbac[] = resourceForbiddenRbacs.filter(x => !x.isExceptional());
		const exceptionalPermissions: IRbac[] = [];
		const exceptionalForbiddens: IRbac[] = resourceForbiddenRbacs.filter(x => x.isExceptional());

		const ubacPermissionRbacs = groupedUbacPermissionsByResource?.find(x => x.key === resourceSlug)?.value;
		const ubacForbiddenRbacs = groupedUbacForbiddensByResource?.find(x => x.key === resourceSlug)?.value;
		const ubacPermissions = ubacPermissionRbacs?.filter(x => !x.isExceptional());
		const ubacForbiddens = ubacForbiddenRbacs?.filter(x => !x.isExceptional());
		const exceptionalUbacPermissions = ubacPermissionRbacs?.filter(x => x.isExceptional());
		const exceptionalUbacForbiddens = ubacForbiddenRbacs?.filter(x => x.isExceptional());

		if (!resourceModels.some(x => x.slug === resourceSlug)) {
			resourceModels.push({
				slug: resourceSlug,
				displayName: localizePluralResourceName(resourceSlug, loc, true),
				organization: organization,
				actions: generateActionModels(
					permissions, 
					forbiddens,
					ubacPermissions,
					ubacForbiddens,
					organization,
					resourceSlug,
					loc),
				exceptionalCases: {
					permissions: exceptionalPermissions,
					forbiddens: exceptionalForbiddens,
					ubacPermissions: exceptionalUbacPermissions,
					ubacForbiddens: exceptionalUbacForbiddens
				}
			})
		}
		else {
			const index = resourceModels.findIndex(x => x.slug === resourceSlug)
			const exceptionalPermissionsByResource = resourceModels[index].exceptionalCases.permissions
			const exceptionalForbiddensByResource = resourceModels[index].exceptionalCases.forbiddens
			const exceptionalUbacPermissionsByResource = resourceModels[index].exceptionalCases.ubacPermissions
			const exceptionalUbacForbiddensByResource = resourceModels[index].exceptionalCases.ubacForbiddens

			resourceModels[index] = {
				slug: resourceSlug,
				displayName: localizePluralResourceName(resourceSlug, loc, true),
				organization: organization,
				actions: generateActionModels(
					permissions, 
					forbiddens,
					ubacPermissions,
					ubacForbiddens,
					organization,
					resourceSlug,
					loc),
				exceptionalCases: {
					permissions: distinctRbacArray(exceptionalPermissionsByResource.concat(exceptionalPermissions)) || [],
					forbiddens: distinctRbacArray(exceptionalForbiddensByResource.concat(exceptionalForbiddens)) || [],
					ubacPermissions: distinctRbacArray(exceptionalUbacPermissionsByResource && exceptionalUbacPermissions ? exceptionalUbacPermissionsByResource?.concat(exceptionalUbacPermissions) : exceptionalUbacPermissions),
					ubacForbiddens: distinctRbacArray(exceptionalUbacForbiddensByResource && exceptionalUbacForbiddens ? exceptionalUbacForbiddensByResource?.concat(exceptionalUbacForbiddens) : exceptionalUbacForbiddens)
				}
			}
		}
	}

	// Fix missing actions
	const defaultActionsGroup = organization ? defaults.cms : defaults.auth
	for (let resourceModel of resourceModels) {
		const defaultActions = defaultActionsGroup[resourceModel.slug]

		for (let exceptionalPermission of resourceModel.exceptionalCases.permissions) {
			if (!resourceModel.actions.some(x => x.slug === exceptionalPermission.action.value)) {
				const isCustomAction = !defaultActions?.some(x => x === exceptionalPermission.action.value)
				resourceModel.actions.push({
					slug: exceptionalPermission.action.value,
					displayName: localizeActionName(exceptionalPermission.action.value, loc, true),
					description: isCustomAction ? "" : localizeActionDescription(exceptionalPermission.action.value, resourceModel.slug, loc),
					value: false,
					rbacValue: false,
					ubacValue: undefined,
					isCustom: isCustomAction
				})
			}
		}

		for (let exceptionalForbidden of resourceModel.exceptionalCases.forbiddens) {
			if (!resourceModel.actions.some(x => x.slug === exceptionalForbidden.action.value)) {
				const isCustomAction = !defaultActions?.some(x => x === exceptionalForbidden.action.value)
				resourceModel.actions.push({
					slug: exceptionalForbidden.action.value,
					displayName: localizeActionName(exceptionalForbidden.action.value, loc, true),
					description: isCustomAction ? "" : localizeActionDescription(exceptionalForbidden.action.value, resourceModel.slug, loc),
					value: false,
					rbacValue: false,
					ubacValue: undefined,
					isCustom: isCustomAction
				})
			}
		}
	}

	// Fix missing resources
	for (let pair of defaultResourcesDictionary) {
		const resourceSlug = pair.key
		
		if (!resourceModels.some(x => x.slug === resourceSlug)) {
			const defaultActions: ActionModel[] = []
			const actions = pair.value
			for (let defaultAction of actions) {
				defaultActions.push({
					slug: defaultAction,
					displayName: localizeActionName(defaultAction, loc, true),
					description: localizeActionDescription(defaultAction, resourceSlug, loc),
					value: false,
					rbacValue: false,
					ubacValue: undefined,
					isCustom: false,
				})
			}

			resourceModels.push({
				slug: resourceSlug,
				displayName: localizePluralResourceName(resourceSlug, loc, true),
				organization: organization,
				actions: defaultActions,
				exceptionalCases: {
					permissions: [],
					forbiddens: [],
					ubacPermissions: [],
					ubacForbiddens: []
				}
			})
		}
	}

	// Sort resources
	const orderedResourceModels: ResourceModel[] = []
	for (let resourceSlug of resourceOrder) {
		const resourceModel = resourceModels.find(x => x.slug === resourceSlug)
		if (resourceModel) {
			orderedResourceModels.push(resourceModel)
		}
	}

	for (let resourceModel of resourceModels) {
		if (!orderedResourceModels.some(x => x.slug === resourceModel.slug)) {
			orderedResourceModels.push(resourceModel)
		}
	}

	return orderedResourceModels
}

export const generateActionModels = (permissionRbacs: IRbac[] | undefined, forbiddenRbacs: IRbac[] | undefined, permissionUbacs: IRbac[] | undefined, forbiddenUbacs: IRbac[] | undefined, organization: OrganizationSummary | undefined, resourceSlug: string, loc: (key: string, args?: any) => string): ActionModel[] => {
	const actionModels: ActionModel[] = []

	const defaultActionsGroup = organization ? defaults.cms : defaults.auth
	const defaultActions = defaultActionsGroup[resourceSlug]
	if (defaultActions) {
		for (let defaultAction of defaultActions) {
			actionModels.push({
				slug: defaultAction,
				displayName: localizeActionName(defaultAction, loc, true),
				description: localizeActionDescription(defaultAction, resourceSlug, loc),
				value: false,
				rbacValue: false,
				ubacValue: undefined,
				isCustom: false
			})
		}
	}
	
	if (permissionRbacs) {
		for (let permissionRbac of permissionRbacs) {
			const isExceptional = permissionRbac.isExceptional()
			const index = actionModels.findIndex(x => x.slug === permissionRbac.action.value)

			const permissionUbac = permissionUbacs ? permissionUbacs.find(x => x.resource.value === permissionRbac.resource.value && x.action.value === permissionRbac.action.value) : undefined
			const ubacValue = permissionUbac ? !permissionUbac?.isExceptional() : undefined

			if (index !== -1) {
				actionModels[index] = {
					slug: permissionRbac.action.value,
					displayName: localizeActionName(permissionRbac.action.value, loc, true),
					description: localizeActionDescription(permissionRbac.action.value, resourceSlug, loc),
					value: ubacValue !== undefined ? ubacValue : !isExceptional,
					rbacValue: !isExceptional,
					ubacValue: ubacValue,
					isCustom: false
				}
			}
			else {
				actionModels.push({
					slug: permissionRbac.action.value,
					displayName: localizeActionName(permissionRbac.action.value, loc, true),
					description: "",
					value: ubacValue !== undefined ? ubacValue : !isExceptional,
					rbacValue: !isExceptional,
					ubacValue: ubacValue,
					isCustom: true
				})
			}
		}
	}

	if (forbiddenRbacs) {
		for (let forbiddenRbac of forbiddenRbacs) {
			const isExceptional = forbiddenRbac.isExceptional()
			const index = actionModels.findIndex(x => x.slug === forbiddenRbac.action.value)

			const forbiddenUbac = forbiddenUbacs ? forbiddenUbacs.find(x => x.resource.value === forbiddenRbac.resource.value && x.action.value === forbiddenRbac.action.value) : undefined
			const ubacValue = forbiddenUbac ? !forbiddenUbac?.isExceptional() : undefined
			
			if (index !== -1) {
				actionModels[index] = {
					slug: forbiddenRbac.action.value,
					displayName: localizeActionName(forbiddenRbac.action.value, loc, true),
					description: localizeActionDescription(forbiddenRbac.action.value, resourceSlug, loc),
					value: ubacValue !== undefined ? ubacValue : isExceptional,
					rbacValue: isExceptional,
					ubacValue: ubacValue,
					isCustom: false
				}
			}
			else {
				actionModels.push({
					slug: forbiddenRbac.action.value,
					displayName: localizeActionName(forbiddenRbac.action.value, loc, true),
					description: "",
					value: ubacValue !== undefined ? ubacValue : isExceptional,
					rbacValue: isExceptional,
					ubacValue: ubacValue,
					isCustom: true
				})
			}
		}
	}

	if (permissionUbacs) {
		for (let permissionUbac of permissionUbacs) {
			const index = actionModels.findIndex(x => x.slug === permissionUbac.action.value)
			const isExceptional = permissionUbac.isExceptional()
			const ubacValue = permissionUbac ? !isExceptional : undefined

			const permissionRbac = permissionRbacs ? permissionRbacs.find(x => x.resource.value === permissionUbac.resource.value && x.action.value === permissionUbac.action.value) : undefined
			const forbiddenRbac = forbiddenRbacs ? forbiddenRbacs.find(x => x.resource.value === permissionUbac.resource.value && x.action.value === permissionUbac.action.value) : undefined
			const rbacValueFromPermissions = permissionRbac ? !permissionRbac?.isExceptional() : undefined
			const rbacValueFromForbiddens = forbiddenRbac ? forbiddenRbac?.isExceptional() : undefined
			const rbacValue = rbacValueFromForbiddens !== undefined ? rbacValueFromForbiddens : rbacValueFromPermissions
			
			if (index !== -1) {
				actionModels[index] = {
					slug: permissionUbac.action.value,
					displayName: localizeActionName(permissionUbac.action.value, loc, true),
					description: localizeActionDescription(permissionUbac.action.value, resourceSlug, loc),
					value: ubacValue,
					rbacValue: rbacValue,
					ubacValue: ubacValue,
					isCustom: false
				}
			}
			else {
				actionModels.push({
					slug: permissionUbac.action.value,
					displayName: localizeActionName(permissionUbac.action.value, loc, true),
					description: "",
					value: ubacValue,
					rbacValue: rbacValue,
					ubacValue: ubacValue,
					isCustom: true
				})
			}
		}
	}

	if (forbiddenUbacs) {
		for (let forbiddenUbac of forbiddenUbacs) {
			const index = actionModels.findIndex(x => x.slug === forbiddenUbac.action.value)
			const isExceptional = forbiddenUbac.isExceptional()
			const ubacValue = forbiddenUbac ? isExceptional : undefined
			
			const permissionRbac = permissionRbacs ? permissionRbacs.find(x => x.resource.value === forbiddenUbac.resource.value && x.action.value === forbiddenUbac.action.value) : undefined
			const forbiddenRbac = forbiddenRbacs ? forbiddenRbacs.find(x => x.resource.value === forbiddenUbac.resource.value && x.action.value === forbiddenUbac.action.value) : undefined
			const rbacValueFromPermissions = permissionRbac ? !permissionRbac?.isExceptional() : undefined
			const rbacValueFromForbiddens = forbiddenRbac ? forbiddenRbac?.isExceptional() : undefined
			const rbacValue = rbacValueFromForbiddens !== undefined ? rbacValueFromForbiddens : rbacValueFromPermissions

			if (index !== -1) {
				actionModels[index] = {
					slug: forbiddenUbac.action.value,
					displayName: localizeActionName(forbiddenUbac.action.value, loc, true),
					description: localizeActionDescription(forbiddenUbac.action.value, resourceSlug, loc),
					value: ubacValue,
					rbacValue: rbacValue,
					ubacValue: ubacValue,
					isCustom: false
				}
			}
			else {
				actionModels.push({
					slug: forbiddenUbac.action.value,
					displayName: localizeActionName(forbiddenUbac.action.value, loc, true),
					description: "",
					value: ubacValue,
					rbacValue: rbacValue,
					ubacValue: ubacValue,
					isCustom: true
				})
			}
		}
	}

	return actionModels
}

export const generateAll = (role: Role, userOrApplication: IHasUbacs | undefined, organizations: OrganizationSummary[] | undefined, loc: (key: string, args?: any) => string): OrganizationModel[] => {
	const organizationRbacs = groupAll(role, organizations || [], "rbac")
	const organizationUbacs: OrganizationRbacs[] | undefined = userOrApplication ? groupAll(userOrApplication, organizations || [], "ubac") : undefined
	return generateOrganizationModels(organizationRbacs, organizationUbacs, loc)
}

export const deepCopyActionModel = (action: ActionModel): ActionModel => {
	if (action) {
		return {
			slug: action.slug,
			displayName: action.displayName,
			description: action.description,
			value: action.value,
			rbacValue: action.rbacValue,
			ubacValue: action.ubacValue,
			isCustom: action.isCustom
		}
	}

	return action
}

export const deepCopyResourceModel = (resource: ResourceModel): ResourceModel => {
	if (resource) {
		return {
			slug: resource.slug,
			displayName: resource.displayName,
			actions: resource.actions ? resource.actions.map(action => deepCopyActionModel(action)) : resource.actions,
			organization: resource.organization,
			exceptionalCases: resource.exceptionalCases ? 
			{
				permissions: resource.exceptionalCases.permissions,
				forbiddens: resource.exceptionalCases.forbiddens,
				ubacPermissions: resource.exceptionalCases.ubacPermissions,
				ubacForbiddens: resource.exceptionalCases.ubacForbiddens
			} : resource.exceptionalCases
		}
	}

	return resource
}

export const sortRbacDefinitions = (rbacDefinitions: string[], rbacKind: "rbac" | "ubac"): string[] => {
	if (!rbacDefinitions || rbacDefinitions.length === 0) {
		return rbacDefinitions
	}

	let orderedRbacDefinitions: string[] = []
	for (let resource of resourceOrder) {
		orderedRbacDefinitions = orderedRbacDefinitions.concat(rbacDefinitions.filter(x => (rbacKind === "rbac" ? new Rbac(x) : new Ubac(x)).resource.value === resource).sort())
	}

	for (let rbacDefinition of rbacDefinitions) {
		if (!orderedRbacDefinitions.includes(rbacDefinition)) {
			orderedRbacDefinitions.push(rbacDefinition)
		}
	}

	return orderedRbacDefinitions
}

export const getResourceTitle = (item: any, resourceSlug: string, api: "ertisauth" | "cms"): string => {
	switch (api) {
		case "ertisauth": {
			switch (resourceSlug) {
				case "users": return `${item.firstname} ${item.lastname}`
				case "user-types": 
				case "roles": 
				case "applications": 
				case "memberships": 
				case "providers": 
				case "webhooks":
				case "mailhooks": 
				return item.name
				default: return "Unknown ertisauth resource: " + resourceSlug
			}
		}
		break;
		case "cms": {
			switch (resourceSlug) {
				case "organizations": return item.name
				case "contents": return item.title
				case "content-types": return item.name
				case "collections": return item.name
				case "pages": return item.name
				case "nested-types": return item.title
				default: return "Unknown cms resource: " + resourceSlug
			}
		}
		default: {
			return "Unknown api: " + api	
		}
		break;
	}
}

export const validateExceptionalSubjectCase = (rbac: IRbac, user: User, role: Role, resource: ResourceModel | undefined, isPermitted: boolean, loc: (key: string, args?: any) => string): string | undefined => {
	let validationWarningMessage: string | undefined
	if (user.role !== role.name) {
		validationWarningMessage = loc("ExceptionalUserCaseValidationMessage1", { role: role.name })
	}

	const allAction = resource?.actions.find(x => x.slug === rbac.action.value)
	if (allAction && allAction.value === isPermitted) {
		validationWarningMessage = loc("ExceptionalUserCaseValidationMessage2", { action: rbac.action.value })
	}

	return validationWarningMessage
}

export const validateExceptionalObjectCase = (rbac: IRbac, resource: ResourceModel | undefined, isPermitted: boolean, loc: (key: string, args?: any) => string): string | undefined => {
	let validationWarningMessage: string | undefined

	const allAction = resource?.actions.find(x => x.slug === rbac.action.value)
	if (allAction && allAction.value === isPermitted) {
		validationWarningMessage = loc("ExceptionalUserCaseValidationMessage2", { action: rbac.action.value })
	}

	return validationWarningMessage
}

export const getTotalExceptionalCaseCount = (resource: ResourceModel): number => {
	if (resource.exceptionalCases) {
		return resource.exceptionalCases.permissions.length + resource.exceptionalCases.forbiddens.length
	}
	
	return 0
}

export const hasExceptionalCase = (resource: ResourceModel): boolean => {
	return getTotalExceptionalCaseCount(resource) > 0
}

export const getTotalUbacExceptionalCaseCount = (resource: ResourceModel): number => {
	if (resource.exceptionalCases) {
		const ubacPermissionsCount = resource.exceptionalCases.ubacPermissions ? resource.exceptionalCases.ubacPermissions.length : 0
		const ubacForbiddensCount = resource.exceptionalCases.ubacForbiddens ? resource.exceptionalCases.ubacForbiddens.length : 0
		return ubacPermissionsCount + ubacForbiddensCount
	}
	
	return 0
}

export const hasUbacExceptionalCase = (resource: ResourceModel): boolean => {
	return getTotalUbacExceptionalCaseCount(resource) > 0
}