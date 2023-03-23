import React, { SelectHTMLAttributes } from "react"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	
}

const Select = (props: SelectProps) => {
	return (
		<select {...props} className={`block w-full bg-transparent dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-11 py-2 px-3 border border-gray-300 dark:border-zinc-700 ${props.className || ""}`}>
			{props.children}
		</select>
	);
}

export default Select;