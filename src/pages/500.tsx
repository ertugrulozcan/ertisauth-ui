import { useTranslations } from 'next-intl'

export default function InternalServerError() {
	const gloc = useTranslations()

	return (
		<div className="flex items-center justify-center h-full w-full">
			<div className="flex items-center relative h-16">
				<span className="inline-block text-gray-500 dark:text-zinc-400 text-2xl font-medium leading-none mr-6 pb-px">500</span>
				<div className="flex items-center border-l border-gray-600 dark:border-zinc-500 h-full pl-6">
					<span className="text-gray-500 dark:text-zinc-400 leading-none">{gloc("Messages.InternalServerError")}</span>
				</div>
			</div>
		</div>
	)
}