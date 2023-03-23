import React from "react"
import { PaperClipIcon } from "@heroicons/react/solid"
import { ConstantFieldProps } from "./ConstantFieldProps"

const ConstantField = (props: ConstantFieldProps) => {
	return (
		<div className="flex items-center border border-dashed border-neutral-500 dark:border-zinc-600 rounded shadow-sm px-4 py-3">
			<PaperClipIcon className="fill-sky-600 w-6 h-6" />
			<span className="text-neutral-500 dark:text-neutral-300 font-semibold ml-4">{props.fieldInfo.value?.toString()}</span>
		</div>
	)
}

export default ConstantField;