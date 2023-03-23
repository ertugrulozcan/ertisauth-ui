import { SysModel } from "./SysModel"

export interface ResourceBase<T> {
	_id: string
	title: string
	sys: SysModel
	object: T
}