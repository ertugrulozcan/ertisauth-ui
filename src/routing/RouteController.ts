export class RouteController {
	static readonly AuthPages = [
		"users", 
		"user-detail", 
		"user-types",
		"user-type-detail", 
		"roles", 
		"role-detail", 
		"applications", 
		"application-detail", 
		"memberships", 
		"membership-detail", 
		"sessions", 
		"providers",
		"webhooks", 
		"webhook-detail", 
		"webhook-events", 
		"mailhooks", 
		"mailhook-detail", 
		"mailhook-events", 
		"events",
		"event-detail"
	] as const

	static isAuthPage(slug: string): boolean {
		return RouteController.AuthPages.some(x => x === slug)
	}
}