import { WebhookRequest } from "./WebhookRequest"

export interface WebhookExecutionResult {
	webhook_id: string,
	isSuccess: boolean,
	statusCode: number | null
	tryIndex: number
	exception: any
	request: WebhookRequest
	response: any
}