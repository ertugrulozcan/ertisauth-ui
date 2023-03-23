export interface SessionToken {
	token_type: string
	refresh_token: string
	refresh_token_expires_in: number
	access_token: string
	expires_in: number
	created_at: Date
}