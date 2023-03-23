import { ActiveToken } from "./ActiveToken";

export interface RevokedToken {
	token: ActiveToken,
	user_id: string,
	username: string,
	email_address: string,
	first_name: string,
	last_name: string,
	token_type: string,
	revoked_at: Date,
}