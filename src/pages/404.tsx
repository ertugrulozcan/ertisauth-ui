import Head from 'next/head'
import Link from "next/link"
import { HomeIcon } from "@heroicons/react/outline"
import { Styles } from "../components/Styles"
import { useTranslations } from 'next-intl'

type NotFoundProps = {
	url?: string
}

export default function NotFound(props: NotFoundProps) {
	const gloc = useTranslations()

	return (
		<>
		<Head>
			<title>{`ErtisAuth - ${gloc("Messages.PageNotFound")}`}</title>
		</Head>

		<div className="flex items-center justify-center overflow-hidden w-full h-full pb-36">
			<div className="flex flex-col items-center max-w-4xl px-20 pt-[4.1rem] pb-[3.7rem]">
				<div className="flex items-center gap-4 mr-0.5">
					<span className="text-gray-400 dark:text-zinc-500 font-black text-[2.4rem] pb-1.5">{":("}</span>
					<span className="text-gray-400 dark:text-zinc-500 font-black text-5xl">404</span>
				</div>

				<h2 className="text-gray-500 dark:text-zinc-500 text-center mb-8">{gloc("Messages.PageNotFound")}</h2>
				<p className="text-gray-500 dark:text-zinc-400 text-center text-[0.9rem] max-w-sm">{gloc("Messages.PageNotFoundSubText")}</p>
				
				<div className="flex flex-col items-center text-gray-500 dark:text-zinc-500 font-semibold text-center text-xs leading-3 gap-2 mt-10">
					{props.url ? <span>Url : {props.url}</span> : <></>}
				</div>
				
				<Link href={"/"} className={`${Styles.button.classic} gap-3 px-6 mt-16`}>
					<HomeIcon className="text-inherit w-4 h-4" />
					{gloc("Actions.ReturnToHomePage")}
				</Link>
			</div>
		</div>
		</>
	)
}