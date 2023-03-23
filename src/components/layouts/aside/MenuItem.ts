export class MenuItem {
	title: string
	slug: string
	href: string | null
	icon: string
	children?: MenuItem[]

	constructor(title: string, slug: string, href: string | null, icon: string, children?: MenuItem[]) {
		this.title = title
		this.slug = slug
		this.href = href
		this.icon = icon
		this.children = children
	}
}