export type FileInfo = FileInfoBase | ImageFileInfo

export interface FileInfoBase {
	pid: string
	name: string
	type: string
	file: File
	data?: any
	size: number
}

export interface ImageFileInfo extends FileInfoBase {
	bitmap?: any
	blob?: Blob
}