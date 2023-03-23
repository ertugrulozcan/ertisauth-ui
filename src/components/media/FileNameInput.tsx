import React, { useState } from "react"
import { trimEnd } from "../../helpers/StringHelper"

type FileNameInputProps = {
	value: string
	maxLength: number
	className?: string
	onChange?(name: string): void
}

const ignoredChars = [ '/', '\\', '"', '\'', '*', ':', ';', '?', '[', ']', '~', '!', '%', '$', '{', '}', '<', '>', '#', '@', '&', '|', '\t', '\n', '\r\n' ]

const fileNamingConvensionCheck = (name: string): boolean => {
	return !ignoredChars.some(x => name.includes(x))
}

const getFileExtension = (fileName: string): string | undefined => {
	const dotIndex = fileName.lastIndexOf('.')
	if (dotIndex > 0) {
		return fileName.substring(dotIndex + 1)
	}
}

const getFileNameWithoutExtension = (fileName: string, originalName: string): string => {
	const extension = getFileExtension(originalName)
	if (extension && fileName.endsWith(`.${extension}`)) {
		return fileName.substring(0, fileName.length - extension.length - 1)
	}

	return fileName
}

const FileNameInput = (props: FileNameInputProps) => {
	const [fileName, setFileName] = useState<string>(props.value);
	const [hideFileExtension, setHideFileExtension] = useState<boolean>(false);

	React.useEffect(() => {
		if (!hideFileExtension) {
			setFileName(props.value)
		}
	}, [props.value]) // eslint-disable-line react-hooks/exhaustive-deps
	
	React.useEffect(() => {
		const name = getFileNameWithoutExtension(fileName, props.value)
		if (hideFileExtension) {
			setFileName(name)
		}
		else {
			const extension = getFileExtension(props.value)
			if (extension) {
				setFileName(`${name}.${extension}`)
			}
			else {
				setFileName(name)
			}
		}
	}, [hideFileExtension]) // eslint-disable-line react-hooks/exhaustive-deps
	
	const onFileNameChanged = (value: string) => {
		if (value && value.trim() && fileNamingConvensionCheck(value)) {
			handleFileNameChange(value)
		}
	}

	const handleFileNameChange = (value: string) => {
		setFileName(value)

		if (props.onChange) {
			const extension = getFileExtension(props.value)
			if (extension) {
				props.onChange(`${getFileNameWithoutExtension(value, props.value)}.${extension}`)
			}
			else {
				props.onChange(value)
			}
		}
	}

	const fixFileName = () => {
		let fixedName = fileName.trim()
		fixedName = trimEnd(fixedName, '.')
		if (fixedName !== fileName) {
			handleFileNameChange(fixedName)
		}
	}

	const onFocus = () => {
		setHideFileExtension(true)
	}

	const onUnfocus = () => {
		setHideFileExtension(false)
		fixFileName()
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && hideFileExtension) {
			e.currentTarget.blur()
		}
	}

	return (
		<input 
			type="text" 
			className={props.className}
			value={fileName} 
			maxLength={props.maxLength}
			onChange={(e) => { onFileNameChanged(e.currentTarget.value) }}
			onKeyDown={handleKeyDown} 
			onFocus={() => { onFocus() }}
			onBlur={() => { onUnfocus() }}
			autoComplete="off">
		</input>
	)
}

export default FileNameInput;