import { ClientInfo } from "./ClientInfo"

export interface ActiveToken {
	access_token: string,
	refresh_token: string,
	expires_in: number,
	refresh_token_expires_in: number,
	token_type: string,
	created_at: Date,
	user_id: string,
	username: string,
	email_address: string,
	first_name: string,
	last_name: string,
	expire_time: Date,
	client_info: ClientInfo
}