export interface EventType {
	name: string
	resource: string
	action: "create" | "read" | "update" | "delete" | "publish" | "unpublish" | "other"
	impact: "positive" | "negative" | "neutral" | "perfect" | "disaster"
	hookable: boolean
}