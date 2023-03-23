import { SysModel } from "../../SysModel"

export interface Mailhook {
	_id: string
	name: string
	description: string
	event: string
	status: "active" | "passive" | null | undefined
	mailSubject: string
	mailTemplate: string
	fromName: string
	fromAddress: string
	membership_id: string
	sys: SysModel
}