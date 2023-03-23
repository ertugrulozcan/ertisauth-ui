import { PublishedStorageFile } from "../../../../models/media/StorageFile"
import { ImageFieldInfo } from "../../../../models/schema/custom-types/ImageFieldInfo"
import { FieldComponentProps } from "../FieldComponentProps"
import { FieldInfoComponentProps } from "../FieldInfoComponentProps"

export type ImageFieldValue = PublishedStorageFile | PublishedStorageFile[]

export interface ImageFieldProps extends FieldInfoComponentProps<ImageFieldInfo, ImageFieldValue>, FieldComponentProps {
	columnCount?: number
	boxSize?: number
}