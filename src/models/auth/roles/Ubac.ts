import { RbacSegment } from "./RbacSegment"
import { Rbac } from "./Rbac"
import { IRbac } from "./IRbac"

export class Ubac implements IRbac {
	static readonly SEGMENT_SEPARATOR: string = "."
	
	path: string
	resource: RbacSegment
	action: RbacSegment
	object: RbacSegment

	constructor(ubac: string) {
		if (!ubac) {
			throw "Ubac definition is null, undefined or empty!"
		}

		this.path = ubac

		const segments = ubac.split(Rbac.SEGMENT_SEPARATOR)
		switch (segments.length) {
			case 1:
			{
				this.resource = new RbacSegment(segments[0])
				this.action = RbacSegment.ALL
				this.object = RbacSegment.ALL
			}
			break;
			case 2:
			{
				this.resource = new RbacSegment(segments[0])
				this.action = new RbacSegment(segments[1])
				this.object = RbacSegment.ALL
			}
			break;
			case 3:
			{
				this.resource = new RbacSegment(segments[0])
				this.action = new RbacSegment(segments[1])
				this.object = new RbacSegment(segments[2])
			}
			break;
			default:
				throw "Invalid ubac definition: " + ubac
		}
	}

	hasCategory(): boolean {
		return this.resource.hasCategory()
	}

	getCategory(): string {
		return this.resource.category!
	}

	isExceptional(): boolean {
		return !this.object.isAll()
	}

	toString(): string {
		return this.path
	}
}