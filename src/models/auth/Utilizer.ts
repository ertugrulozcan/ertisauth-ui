
export interface Utilizer {
	id: string
	type: "None" | "System" | "User" | "Application"
	username: string
	role: string
	membership_id: string
}