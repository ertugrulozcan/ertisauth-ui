import { SysModel } from "../../SysModel"
import { WebhookRequest } from "./WebhookRequest"

export interface Webhook {
	_id: string
	name: string
	description: string
	event: string
	status: "active" | "passive" | null | undefined
	request: WebhookRequest
	try_count: number
	membership_id: string
	sys: SysModel
}