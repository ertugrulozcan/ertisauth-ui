import React, { useState } from "react"
import { Styles } from '../Styles'

export interface SecretKeyGeneratorProps {
	value?: string
	defaultValue?: string
	className?: string
	onChange?: (value: string) => void
}

const generateRandomKey = (length: number): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
	
	let result = ''
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length))
	}
	
	return result
}

const SecretKeyGenerator = (props: SecretKeyGeneratorProps) => {
	const inputRef = React.createRef<HTMLInputElement>()

	const generate = () => {
		const key = generateRandomKey(32)
		if (inputRef.current) {
			inputRef.current.value = key
		}

		if (props.onChange) {
			props.onChange(key)
		}
	}

	return (
		<div className={`flex ${props.className}`}>
			<div className="relative w-full">
				<input ref={inputRef} type="text" autoComplete="off" className={Styles.input.default + " rounded-r-none h-11"} value={props.value} defaultValue={props.defaultValue} onChange={(e) => props.onChange ? props.onChange(e.currentTarget.value) : {}} />
			</div>

			<button onClick={() => generate()} className={Styles.button.classic + " dark:bg-zinc-400/[0.05] focus:ring-0 border-l-0 rounded-lg rounded-l-none w-40"}>
				<span className="text-center w-full">Generate</span>
			</button>
		</div>
	)
}

export default SecretKeyGenerator;