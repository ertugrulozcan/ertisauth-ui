import React, { useState } from "react"
import { ReduxStore } from "../../redux/ReduxStore"
import { useDispatch } from "react-redux"
import { changeDarkMode } from "../../redux/reducers/ThemeReducer"
import { RadioGroup } from '@headlessui/react'
import { useTranslations } from 'next-intl'

type ThemeSettingsProps = {
	
}

const ThemeSettings = (props: ThemeSettingsProps) => {
	const state = ReduxStore.getState()
	const [selectedTheme, setSelectedTheme] = useState<"dark" | "light">(state.theme.value === "dark" ? "dark" : "light")

	const gloc = useTranslations()

	const dispatch = useDispatch();

	ReduxStore.subscribe(() => {
		const state = ReduxStore.getState()
		setSelectedTheme(state.theme.value === "dark" ? "dark" : "light")
	})

	React.useEffect(() => {
		localStorage.theme = selectedTheme;
		document.documentElement.classList.remove(selectedTheme === "dark" ? "light" : "dark")
		document.documentElement.classList.add(selectedTheme);
		dispatch(changeDarkMode(selectedTheme));
	}, [selectedTheme, dispatch]);

	return (
		<RadioGroup value={selectedTheme} onChange={setSelectedTheme} className="grid grid-cols-3 gap-7 w-fit mt-4">
			<RadioGroup.Option value={"dark"} className={({ active, checked }) => `outline outline-4 outline-offset-8 ${checked ? "outline-sky-600" : (active ? "ring-2 ring-indigo-500" : "outline-transparent")} active:ring-0 rounded-sm cursor-pointer`}>
				<div className="flex flex-col items-center justify-center">
					<div className="flex flex-col bg-zinc-800 border border-borderlinedark shadow-sm dark:shadow shadow-gray-500 dark:shadow-black overflow-hidden rounded w-44 h-32">
						<div className="flex items-center justify-between bg-zinc-900/[0.5] border-b border-borderlinedark w-full h-2.5 px-1"></div>
						<div className="flex flex-1">
							<div className="bg-zinc-900/[0.5] border-r border-borderlinedark w-2.5 h-full"></div>
							<div className="bg-black/[0.3] w-6 h-full"></div>
							<div className="flex flex-col flex-1 space-y-1.5 p-2">
								<span className="bg-zinc-700 h-1.5 w-full"></span>
								<span className="bg-zinc-700 h-1.5 w-full"></span>
								<span className="bg-zinc-700 h-1.5 w-full"></span>
								<span className="bg-zinc-700 h-1.5 w-16"></span>
								<div className="grid grid-cols-3 pt-1">
									<span className="bg-zinc-700 h-8 w-8"></span>
									<span className="bg-zinc-700 h-8 w-8"></span>
									<span className="bg-zinc-700 h-8 w-8"></span>
								</div>
								<div className="flex justify-between space-x-2 pt-1">
									<span className="bg-zinc-700 h-1.5 w-full"></span>
									<span className="bg-zinc-700 h-1.5 w-full"></span>
								</div>
							</div>
						</div>
					</div>

					<span className="text-xs text-gray-700 dark:text-zinc-300 mt-4">{gloc("Theme.Dark")}</span>
				</div>
			</RadioGroup.Option>
			<RadioGroup.Option value={"light"} className={({ active, checked }) => `outline outline-4 outline-offset-8 ${checked ? "outline-sky-600" : (active ? "ring-2 ring-indigo-500" : "outline-transparent")} active:ring-0 rounded-sm cursor-pointer`}>
				<div className="flex flex-col items-center justify-center">
					<div className="flex flex-col bg-gray-50 border border-gray-300 shadow-sm dark:shadow-md shadow-gray-500 dark:shadow-black overflow-hidden rounded w-44 h-32">
						<div className="flex items-center justify-between bg-gray-200/[0.25] border-b border-gray-200 w-full h-2.5 px-1"></div>
						<div className="flex flex-1">
							<div className="bg-gray-200/[0.25] border-r border-gray-200 w-2.5 h-full"></div>
							<div className="bg-gray-300/[0.35] w-6 h-full"></div>
							<div className="flex flex-col flex-1 bg-gray-100/[0.5] space-y-1.5 p-2">
								<span className="bg-gray-200 h-1.5 w-full"></span>
								<span className="bg-gray-200 h-1.5 w-full"></span>
								<span className="bg-gray-200 h-1.5 w-full"></span>
								<span className="bg-gray-200 h-1.5 w-16"></span>
								<div className="grid grid-cols-3 pt-1">
									<span className="bg-gray-200 h-8 w-8"></span>
									<span className="bg-gray-200 h-8 w-8"></span>
									<span className="bg-gray-200 h-8 w-8"></span>
								</div>
								<div className="flex justify-between space-x-2 pt-1">
									<span className="bg-gray-200 h-1.5 w-full"></span>
									<span className="bg-gray-200 h-1.5 w-full"></span>
								</div>
							</div>
						</div>
					</div>

					<span className="text-xs text-gray-700 dark:text-zinc-300 mt-4">{gloc("Theme.Light")}</span>
				</div>
			</RadioGroup.Option>
		</RadioGroup>
	)
}

export default ThemeSettings;