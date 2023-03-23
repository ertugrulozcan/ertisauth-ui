export interface ErtisAuthEvent {
	_id: string
	event_type: string
	utilizer_id: string
	event_time: Date
	document: any
	prior: any
	is_custom_event: boolean
	membership_id: string
}

export interface GenericErtisAuthEvent<T> {
	_id: string
	event_type: string
	utilizer_id: string
	event_time: Date
	document: T
	prior: T
	is_custom_event: boolean
	membership_id: string
}