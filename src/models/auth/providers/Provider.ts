import { SysModel } from "../../SysModel"

export interface Provider {
	_id: string
	name: string
	description?: string
	defaultRole: string
	defaultUserType: string
	appClientId: string
	tenantId?: string
	isActive: boolean
	membership_id: string
	sys: SysModel
}