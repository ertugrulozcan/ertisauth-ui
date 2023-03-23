import { MenuItem } from "./MenuItem"

export interface NavigationMenuProvider {
	getMenuItems(loc: (key: string) => string): Promise<MenuItem[]>
}