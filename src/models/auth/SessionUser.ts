export interface SessionUser {
	_id: string,
	firstname: string,
	lastname: string,
	fullname?: string,
	username: string,
	email_address: string,
	role: string,
	avatar?: string,
	membership_id: string
}