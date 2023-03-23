import { SysModel } from "../../SysModel"
import { IHasUbacs } from "./IHasUbacs"
import { ProviderAccountInfo } from "../providers/ProviderAccountInfo"

export interface User extends IHasUbacs {
	_id: string
	firstname: string
	lastname: string
	username: string
	email_address: string
	role: string
	permissions?: string[]
	forbidden?: string[]
	user_type: string
	sourceProvider?: string
	connectedAccounts?: ProviderAccountInfo[]
	sys: SysModel
	membership_id: string
}