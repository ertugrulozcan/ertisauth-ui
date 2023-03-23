import React, { useState } from "react"
import FileEditor, { FileEditorRef } from "../../../media/FileEditor"
import MultipleImageField from "./MultipleImageField"
import SingleImageField from "./SingleImageField"
import { PublishedStorageFile } from "../../../../models/media/StorageFile"
import { ImageFieldProps } from "./ImageFieldProps"
import { buildFieldValue } from "../../../../models/schema/FieldInfo"
import { toResolutionRules } from "../../../../helpers/FieldInfoHelper"

const ImageField = (props: ImageFieldProps) => {
	const [filePickerVisibility, setFilePickerVisibility] = useState<boolean>(false);
	const [imageSelectionMode, setImageSelectionMode] = useState<"add" | "change">("add");

	const fileEditorRef = React.createRef<FileEditorRef>();
	
	const onFileEdit = (file: PublishedStorageFile) => {
		fileEditorRef.current?.open(file)
	}

	const onFileUpdated = (updatedStorageFile: PublishedStorageFile) => {
		if (props.fieldInfo.multiple) {
			const updatedSelectedFiles = (props.value ? props.value as PublishedStorageFile[] : []).concat([])
			const index = updatedSelectedFiles.findIndex(x => x._id === updatedStorageFile._id)
			if (index >= 0) {
				updatedSelectedFiles[index] = updatedStorageFile
				buildFieldValue(props, updatedSelectedFiles, props.bypassRequiredValueValidation)
			}
		}
		else {
			buildFieldValue(props, updatedStorageFile, props.bypassRequiredValueValidation)
		}
	};

	const onFilePickerOpen = (mode: "add" | "change", selectedFile: PublishedStorageFile | undefined) => {
		setImageSelectionMode(mode)
		setFilePickerVisibility(true)
	}

	const onFileRemove = (removedFile: PublishedStorageFile) => {
		if (props.fieldInfo.multiple) {
			const updatedSelectedFiles = (props.value ? props.value as PublishedStorageFile[] : []).concat([])
			const index = updatedSelectedFiles.findIndex(x => x._id === removedFile._id)
			if (index >= 0) {
				updatedSelectedFiles.splice(index, 1)
				buildFieldValue(props, updatedSelectedFiles, props.bypassRequiredValueValidation)
			}
		}
		else {
			buildFieldValue(props, null, props.bypassRequiredValueValidation)
		}
	}

	const onImageOrderChange = (orderedImages: PublishedStorageFile[]) => {
		buildFieldValue(props, orderedImages, props.bypassRequiredValueValidation)
	}

	return (
		<>
		{props.fieldInfo.multiple ?
		<MultipleImageField 
			fieldInfo={props.fieldInfo} 
			images={props.value ? props.value as PublishedStorageFile[] : []} 
			filePickerVisibility={filePickerVisibility}
			columnCount={props.columnCount}
			boxSize={props.boxSize}
			onFileEdit={onFileEdit}
			onFilePickerOpen={onFilePickerOpen}
			onFileRemove={onFileRemove}
			onOrderChange={onImageOrderChange}
			session={props.session} /> :
		<SingleImageField 
			fieldInfo={props.fieldInfo} 
			image={props.value as PublishedStorageFile} 
			filePickerVisibility={filePickerVisibility}
			onFileEdit={onFileEdit}
			onFilePickerOpen={onFilePickerOpen}
			onFileRemove={onFileRemove}
			session={props.session} />}

		<FileEditor 
			ref={fileEditorRef}
			session={props.session}
			maxSize={props.fieldInfo.maxSize || undefined}
			resolutionRules={toResolutionRules(props.fieldInfo)}
			onCompleted={onFileUpdated} />
		</>
	)
}

export default ImageField;