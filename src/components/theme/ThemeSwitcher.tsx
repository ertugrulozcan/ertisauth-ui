import React, { useState, useEffect } from "react"
import { ReduxStore } from "../../redux/ReduxStore"
import { Tooltip } from "antd"
import { useDispatch } from "react-redux"
import { changeDarkMode } from "../../redux/reducers/ThemeReducer"
import { getSvgIcon } from "../icons/Icons"
import { useTranslations } from 'next-intl'

type ThemeSwitcherProps = {
	
};

const ThemeSwitcher = (props: ThemeSwitcherProps) => {
	const [darkmode, setDarkmode] = useState<boolean>();

	const loc = useTranslations('Theme')

	const dispatch = useDispatch();

	ReduxStore.subscribe(() => {
		const state = ReduxStore.getState()
		setDarkmode(state.theme.value === "dark")
	})

	const ToggleNow = () => {
		setDarkmode(!darkmode);
	};

	useEffect(() => {
		if (darkmode === true) {
			localStorage.theme = "dark";
			document.documentElement.classList.add("dark");
			dispatch(changeDarkMode(localStorage.theme));
		}

		if (darkmode === false) {
			localStorage.theme = "light";
			document.documentElement.classList.remove("dark");
			dispatch(changeDarkMode(localStorage.theme));
		}
	}, [darkmode, dispatch]);

	useEffect(() => {
		setDarkmode(localStorage.theme === "dark");
	}, [dispatch]);

	if (darkmode) {
		return (
			<Tooltip title={loc("Light")} placement="bottom">
				<button type="button" onClick={(e) => { ToggleNow() }}>
					{getSvgIcon("sun", "w-4 h-4 fill-orange-400")}
				</button>
			</Tooltip>
		)
	}
	else {
		return (
			<Tooltip title={loc("Dark")} placement="bottom">
				<button type="button" onClick={(e) => { ToggleNow() }}>
					{getSvgIcon("moon", "w-4 h-4 fill-indigo-500")}
				</button>
			</Tooltip>
		)
	}
};

export default ThemeSwitcher;