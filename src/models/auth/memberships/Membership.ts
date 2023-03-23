import { SysModel } from "../../SysModel"
import { MembershipMailSettings } from "./MembershipMailSettings"

export interface Membership {
	_id: string
	name: string
	expires_in: number
	refresh_token_expires_in: number
	secret_key: string
	hash_algorithm: string
	encoding: string
	default_language: string
	mail_settings: MembershipMailSettings | null
	sys: SysModel
}