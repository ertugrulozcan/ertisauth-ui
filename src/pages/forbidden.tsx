import Head from 'next/head'
import Link from "next/link"
import { GetServerSideProps } from "next"
import { PageProps } from "../models/PageProps"
import { getValidatedServerSession } from "../models/auth/Session"
import { ArrowLeftIcon, LockClosedIcon } from "@heroicons/react/outline"
import { Styles } from "../components/Styles"
import { useTranslations } from 'next-intl'

type ForbiddenProps = {
	url: string | null
	rbac: string | null
	referer: string | null
};

export default function Forbidden({ url, rbac, referer, session }: ForbiddenProps & PageProps) {
	const gloc = useTranslations()

	return (
		<>
		<Head>
			<title>{`ErtisAuth - ${gloc("Session.AccessDenied")}`}</title>
		</Head>

		<div className="flex items-center justify-center overflow-hidden w-full h-full pb-36">
			<div className="flex flex-col items-center max-w-4xl px-20 pt-[4.1rem] pb-[3.7rem]">
				<div className="flex items-center gap-3">
					<LockClosedIcon className="stroke-gray-400 dark:stroke-zinc-500 w-14 h-14" />
					<span className="text-gray-400 dark:text-zinc-500 font-black text-5xl">403</span>
				</div>

				<h2 className="text-gray-500 dark:text-zinc-500 text-center mb-8">{`${gloc("Session.Forbidden")}/${gloc("Session.AccessDenied")}!`}</h2>
				<h3 className="text-red-500 dark:text-red-600 font-bold text-center mb-2">{gloc("Session.AccessNotGranted")}</h3>
				<p className="text-gray-500 dark:text-zinc-400 text-center text-[0.84rem] max-w-md">{gloc("Session.YouDoNotHaveAccessMessage")}</p>
				
				<div className="flex flex-col items-center text-gray-500 dark:text-zinc-500 font-semibold text-center text-xs leading-3 gap-2 mt-10">
					<span>Url : {url}</span>
					<span>User ID : {session.user._id}</span>
					<span>Role : {session.user.role}</span>
					<span>Rbac : {rbac}</span>
				</div>
				
				{referer && !referer.includes("/forbidden?") ?
					<Link href={referer} className={`${Styles.button.classic} gap-3 px-6 mt-16`}>
						<ArrowLeftIcon className="text-inherit w-4 h-4" />
						{gloc("Actions.GoBack")}
					</Link> :
					<Link href={"/"} className={`${Styles.button.classic} gap-3 px-6 mt-16`}>
						<ArrowLeftIcon className="text-inherit w-4 h-4" />
						{gloc("Actions.GoBack")}
					</Link>
				}
			</div>
		</div>
		</>
	)
}

export const getServerSideProps: GetServerSideProps<ForbiddenProps & PageProps> = async (context) => {
	const session = getValidatedServerSession(context.req, context.res)
	var props: ForbiddenProps & PageProps = {
		url: context.query['url']?.toString() || null,
		rbac: context.query['rbac']?.toString() || null,
		referer: context.req.headers.referer ?? null,
		session
	}

	return {
		props: props
	};
}