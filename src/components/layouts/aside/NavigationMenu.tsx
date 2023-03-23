import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from "react"
import { ReduxStore } from "../../../redux/ReduxStore"
import { IToken } from '../../../models/auth/IToken'
import { Menu } from 'antd'
import { NavigationMenuProvider } from './NavigationMenuProvider'
import { clearQueryString } from "../../../helpers/RouteHelper"
import { getSvgIcon } from '../../icons/Icons'
import { useTranslations } from 'next-intl'

import type { MenuProps } from 'antd'
import { MenuItem } from './MenuItem'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { SvgIcon } from '../../icons/SvgIcon'
type AntMenuItem = Required<MenuProps>['items'][number]

function createMenuItem(label: React.ReactNode, key: React.Key, icon?: React.ReactNode, children?: AntMenuItem[], type?: 'group'): AntMenuItem {
	return { key, icon, children, label, type } as AntMenuItem
}

const getMenuItemLabel = (menuItem: MenuItem): React.ReactNode => {
	if (menuItem.href) {
		return (
			<Link href={menuItem.href} className="text-gray-600 dark:text-zinc-400">
				{menuItem.title}
			</Link>
		)
	}
	else {
		return menuItem.title
	}
}

const toAntMenuItems = (menuItems: MenuItem[] | undefined): AntMenuItem[] | undefined => {
	if (menuItems && menuItems.length > 0) {
		return menuItems.map(x => createMenuItem(getMenuItemLabel(x), x.slug, getSvgIcon(x.icon, "fill-neutral-700 dark:fill-zinc-200 w-[1.1rem] h-[1.1rem]"), toAntMenuItems(x.children)))
	}
}

const NavigationMenu = (props:{ provider: NavigationMenuProvider, token: IToken, showMenuTitle: boolean }) => {
	const [menuItems, setMenuItems] = React.useState<ItemType[]>();
	const [selectedMenuItemKeys, setSelectedMenuItemKeys] = React.useState<string[]>();

	const loc = useTranslations()
	const router = useRouter()

	const state = ReduxStore.getState()
	const [useDarkTheme, setUseDarkTheme] = useState<boolean>(state.theme.value === "dark");

	ReduxStore.subscribe(() => {
		const state = ReduxStore.getState()
		setUseDarkTheme(state.theme.value === "dark")
	})

	React.useEffect(() => {
		const fetchMenuItemsAsync = async () => {
			await fetchMenuItems()
		}
		
		fetchMenuItemsAsync().catch(console.error);
	}, [selectedMenuItemKeys]) // eslint-disable-line react-hooks/exhaustive-deps

	const fetchMenuItems = React.useCallback(async () => {
		try {
			const menuItems = await props.provider.getMenuItems(loc)
			setMenuItems(toAntMenuItems(menuItems))
		}
		catch (ex) {
			console.error(ex)
		}
    }, [selectedMenuItemKeys]) // eslint-disable-line react-hooks/exhaustive-deps

	React.useEffect(() => {
		const { asPath } = router
		const path = clearQueryString(asPath)
		
		let keys: string[] = []
		if (path) {
			const segments = path.split('/')
			keys = segments.slice(2)
		}
		
		setSelectedMenuItemKeys(keys)
	}, [router]);

	return (
		<div className={`flex flex-col flex-shrink-0 overflow-hidden border-r border-borderline dark:border-borderlinedark h-[calc(100vh-theme(space.8))] min-w-[16rem] ${props.showMenuTitle ? "-mt-16" : ""}`}>
			{props.showMenuTitle &&
			<div className="flex flex-col flex-shrink-0 justify-center border-b border-borderline dark:border-borderlinedark h-16 max-h-16 min-h-16 px-6">
				<Link href={"/"} className="flex items-center opacity-80">
					<SvgIcon stroke="#df3140" thickness={2} className="h-6 w-6 mr-1.5 mb-px">
						<path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
					</SvgIcon>
					<span className="text-zinc-600 dark:text-zinc-400 leading-none text-[1.03rem] font-['RobotoMono'] overflow-hidden">ERTIS</span>
					<span className="text-red-700/[0.65] dark:text-red-500 leading-none text-[1.06rem] font-['RobotoMono'] overflow-hidden">AUTH</span>
				</Link>
			</div>}

			<div className="flex-1 overflow-hidden h-full flex-grow">
				<div className="overflow-y-scroll h-full py-3">
					<Menu items={menuItems} selectedKeys={selectedMenuItemKeys} defaultOpenKeys={["contents_", "members"]} mode="inline" theme={useDarkTheme ? "dark" : "light"} /> 
				</div>
			</div>
		</div>
	)
}

export default NavigationMenu;