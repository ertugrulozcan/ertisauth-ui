import { SmtpServer } from "../../mailing/SmtpServer";

export interface MembershipMailSettings {
	smtp_server: SmtpServer | null
}