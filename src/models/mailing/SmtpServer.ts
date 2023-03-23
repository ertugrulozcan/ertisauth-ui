export interface SmtpServer {
	host: string
	port: number
	tls_enabled: boolean
	username: string
	password: string
}