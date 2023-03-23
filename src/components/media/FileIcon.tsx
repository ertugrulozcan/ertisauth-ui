import React from "react"
import { 
	PhotographIcon, 
	FilmIcon, 
	MusicNoteIcon, 
	DocumentTextIcon 
} from "@heroicons/react/solid"

export interface FileIconProps {
	mimeType: string
	className?: string
	iconClassName?: string
}

const FileIcon = (props: FileIconProps) => {
	let fileKind: "image" | "video" | "audio" | "document" = "document"
	if (props.mimeType.startsWith("image/")) {
		fileKind = "image"
	}
	else if (props.mimeType.startsWith("video/")) {
		fileKind = "video"
	}
	else if (props.mimeType.startsWith("audio/")) {
		fileKind = "audio"
	}

	return (
		<div className={props.className}>
			<div className="flex items-center justify-center rounded-sm overflow-hidden w-full h-full">
				{
					{
						'image': <PhotographIcon className={`fill-sky-500 dark:fill-sky-500 ${props.iconClassName}`} />,
						'audio': <MusicNoteIcon className={`fill-blue-500 dark:fill-blue-600 ${props.iconClassName}`} />,
						'video': <FilmIcon className={`fill-rose-500 dark:fill-rose-600 ${props.iconClassName}`} />,
						'document': <DocumentTextIcon className={`fill-blue-500 dark:fill-blue-600 ${props.iconClassName}`} />,
					} [fileKind]
				}
			</div>
		</div>
	)
}

export default FileIcon;