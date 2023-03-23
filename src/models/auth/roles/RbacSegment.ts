export class RbacSegment {
	static readonly CATEGORY_SEPARATOR: string = ":"
	static readonly ALL: RbacSegment = new RbacSegment("*")

	value: string
	category: string | undefined

	constructor(value: string) {
		if (!value) {
			throw "Rbac segment can not be null/undefined or empty"
		}

		const parts = value.split(RbacSegment.CATEGORY_SEPARATOR)
		if (parts.length == 2) {
			this.category = parts[0]
			this.value = parts[1]
		}
		else {
			this.value = value
		}
	}

	isAll(): boolean {
		return this.value === RbacSegment.ALL.value
	}

	hasCategory(): boolean {
		return this.category !== undefined && this.category !== null && this.category !== ""
	}

	toString(): string {
		return this.value
	}
}