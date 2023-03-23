import { SysModel } from "../SysModel"

export type FileFormatType = "Unknown" | "Application" | "Audio" | "Font" | "Example" | "Image" | "Message" | "Model" | "Multipart" | "Text" | "Video"

export interface StorageFile {
	_id: string
	name: string
	slug: string
	mimeType: string
	formatType: FileFormatType
	// containerName: string
	path: string
	fullPath: string
	size: number
	kind: "File" | "Folder"
	sys: SysModel
}

export interface PublishedStorageFile extends StorageFile {
	cloudUrl: string
	cdnUrl: string
	url: string
}

export interface StorageFolder extends StorageFile {
	parent?: StorageFolder
}

export interface ElasticStorageFile {
	id: string
	name: string
	slug: string
	mimeType: string
	formatType: FileFormatType
	containerName: string
	path: string
	fullPath: string
	size: number
	kind: "File" | "Folder"
	sys: SysModel
	cloudUrl: string
	cdnUrl: string
	url: string
}