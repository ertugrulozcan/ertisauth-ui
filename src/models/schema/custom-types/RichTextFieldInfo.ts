import { ResolutionRules } from "../../../components/media/ResolutionRules"
import { StringFieldInfo } from "../primitives/StringFieldInfo"

export interface RichTextFieldInfo extends StringFieldInfo {
	minWordCount: number | null | undefined
	maxWordCount: number | null | undefined
	embeddedImageRules: ResolutionRules | null | undefined
	embeddedImageMaxSize: number | null | undefined
}