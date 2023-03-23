import { IRbac } from "./IRbac"
import { RbacSegment } from "./RbacSegment"

export class Rbac implements IRbac {
	static readonly SEGMENT_SEPARATOR: string = "."
	
	path: string
	subject: RbacSegment
	resource: RbacSegment
	action: RbacSegment
	object: RbacSegment

	constructor(rbac: string) {
		if (!rbac) {
			throw "Rbac definition is null, undefined or empty!"
		}

		this.path = rbac

		const segments = rbac.split(Rbac.SEGMENT_SEPARATOR)
		switch (segments.length) {
			case 1:
			{
				this.subject = RbacSegment.ALL
				this.resource = new RbacSegment(segments[0])
				this.action = RbacSegment.ALL
				this.object = RbacSegment.ALL
			}
			break;
			case 2:
			{
				this.subject = RbacSegment.ALL
				this.resource = new RbacSegment(segments[0])
				this.action = new RbacSegment(segments[1])
				this.object = RbacSegment.ALL
			}
			break;
			case 3:
			{
				this.subject = RbacSegment.ALL
				this.resource = new RbacSegment(segments[0])
				this.action = new RbacSegment(segments[1])
				this.object = new RbacSegment(segments[2])
			}
			break;
			case 4:
			{
				this.subject = new RbacSegment(segments[0])
				this.resource = new RbacSegment(segments[1])
				this.action = new RbacSegment(segments[2])
				this.object = new RbacSegment(segments[3])
			}
			break;
			default:
				throw "Invalid rbac definition: " + rbac
		}
	}

	hasCategory(): boolean {
		return this.resource.hasCategory()
	}

	getCategory(): string {
		return this.resource.category!
	}

	isExceptional(): boolean {
		return !this.subject.isAll() || !this.object.isAll()
	}

	toString(): string {
		return this.path
	}
}