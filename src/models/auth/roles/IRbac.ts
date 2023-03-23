import { RbacSegment } from "./RbacSegment"

export interface IRbac {
	path: string
	resource: RbacSegment
	action: RbacSegment
	object: RbacSegment
	hasCategory(): boolean
	getCategory(): string
	isExceptional(): boolean
	toString(): string
}