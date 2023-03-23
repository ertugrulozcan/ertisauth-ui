import { SysModel } from "../../SysModel"
import { IHasUbacs } from "../users/IHasUbacs"

export interface Application extends IHasUbacs {
	_id: string
	name: string
	role: string
	permissions?: string[]
	forbidden?: string[]
	sys: SysModel
	membership_id: string
}