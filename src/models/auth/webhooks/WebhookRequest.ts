export interface WebhookRequest {
	method: "GET" | "PUT" | "POST" | "DELETE" | "HEAD" | "OPTIONS" | "TRACE" | "PATCH" | "CONNECT" 
	url: string
	headers: any // { key: string, value: string | number | boolean }[]
	body: any
}