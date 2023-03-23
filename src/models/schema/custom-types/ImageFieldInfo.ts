import { ObjectFieldInfo } from "../primitives/ObjectFieldInfo"

export interface ImageFieldInfo extends ObjectFieldInfo {
	multiple: boolean | undefined
	maxSize: number | null | undefined
	minCount: number | null | undefined
	maxCount: number | null | undefined
	maxWidth: number | null | undefined
	maxHeight: number | null | undefined
	maxSizesRequired: boolean | undefined
	minWidth: number | null | undefined
	minHeight: number | null | undefined
	minSizesRequired: boolean | undefined
	recommendedWidth: number | null | undefined
	recommendedHeight: number | null | undefined
	aspectRatioRequired: boolean | undefined
}