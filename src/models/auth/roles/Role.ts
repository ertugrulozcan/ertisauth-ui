import { SysModel } from "../../SysModel"
import { IHasUbacs } from "../users/IHasUbacs"

export interface Role extends IHasUbacs {
	_id: string
	name: string
	description: string
	permissions?: string[]
	forbidden?: string[]
	sys: SysModel
	membership_id: string
}