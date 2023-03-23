import { Service } from 'typedi'
import { NavigationMenuProvider } from "./NavigationMenuProvider"
import { MenuItem } from "./MenuItem"

@Service()
export class AuthMenuProvider implements NavigationMenuProvider {
	async getMenuItems(loc: (key: string) => string): Promise<MenuItem[]> {
		return [
			new MenuItem(loc("Auth.Menu.Users"), "users", `/auth/users`, "users"),
			new MenuItem(loc("Auth.Menu.UserTypes"), "user-types", `/auth/user-types`, "user-types"),
			new MenuItem(loc("Auth.Menu.Roles"), "roles", `/auth/roles`, "roles"),
			new MenuItem(loc("Auth.Menu.Applications"), "applications", `/auth/applications`, "applications"),
			new MenuItem(loc("Auth.Menu.Memberships"), "memberships", `/auth/memberships`, "memberships"),
			new MenuItem(loc("Auth.Menu.Sessions"), "sessions", `/auth/sessions`, "sessions"),
			new MenuItem(loc("Auth.Menu.Providers"), "providers", `/auth/providers`, "providers"),
			new MenuItem(loc("Auth.Menu.Webhooks"), "webhooks", `/auth/webhooks`, "webhooks"),
			new MenuItem(loc("Auth.Menu.Mailhooks"), "mailhooks", `/auth/mailhooks`, "mailhooks"),
			new MenuItem(loc("Auth.Menu.Events"), "events", `/auth/events`, "events"),
		]
	}
}