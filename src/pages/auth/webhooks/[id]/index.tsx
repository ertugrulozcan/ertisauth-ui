import React, { Fragment, useState } from "react"
import Link from "next/link"
import WebhookEditor from "../../../../components/auth/webhooks/WebhookEditor"
import DiffViewerPanel from '../../../../components/utils/DiffViewerPanel'
import RouteLeavingGuard from '../../../../components/modals/RouteLeavingGuard'
import SysInfoPanel from "../../../../components/layouts/panels/SysInfoPanel"
import { ErtisAuthConfiguration } from "../../../../configuration/ErtisAuthConfiguration"
import { PageProps } from "../../../../models/PageProps"
import { GetServerSideProps } from "next"
import { Container } from 'typedi'
import { Tooltip, Space, Spin, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { EyeIcon } from '@heroicons/react/outline'
import { CalendarIcon } from "@heroicons/react/solid"
import { ContentSave } from '../../../../components/icons/google/MaterialIcons'
import { Styles } from '../../../../components/Styles'
import { Webhook } from "../../../../models/auth/webhooks/Webhook"
import { WebhookService } from "../../../../services/auth/WebhookService"
import { ErrorResponseModel } from "../../../../models/ErrorResponseModel"
import { getValidatedServerSession } from '../../../../models/auth/Session'
import { checkAuthorization } from "../../../../services/AuthorizationHandler"
import { BearerToken } from "../../../../models/auth/BearerToken"
import { PageWrapper } from "../../../../components/layouts/PageWrapper"
import { FooterToolboxProvider } from '../../../../components/layouts/footer/FooterToolboxProvider'
import { deepEqual, deepCopy } from "../../../../helpers/ObjectHelper"
import { exportIdFromContext } from "../../../../helpers/RouteHelper"
import { useTranslations } from 'next-intl'

export type WebhookDetailProps = {
	model: Webhook
};

export default function WebhookDetail(props: WebhookDetailProps & PageProps) {
	const [initialData, setInitialData] = useState<Webhook>(deepCopy(props.model));
	const [webhook, setWebhook] = useState<Webhook>(props.model);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>();
	const [diffViewerVisibility, setDiffViewerVisibility] = useState<boolean>(false);
	const [validationErrors, setValidationErrors] = useState<string[]>();

	const baseUrl = "/auth"

	const gloc = useTranslations()
	const loc = useTranslations('Auth.Webhooks')

	const onSubmit = async function() {
		const key = 'updatable'
		notification.open({
			key,
			message: (
			<div className='flex flex-row items-center'>
				<Space size="middle">
					<Spin indicator={<LoadingOutlined spin />} />
				</Space>
				<span className='ml-5 mt-1'>{gloc('Actions.Saving')}...</span>
			</div>),
			className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl',
			duration: 0
		})

		const webhookService = Container.get(WebhookService)
		const updateResponse = await webhookService.updateWebhookAsync(webhook, BearerToken.fromSession(props.session))
		if (updateResponse.IsSuccess) {
			const getWebhookResponse = await webhookService.getWebhookAsync(webhook._id, BearerToken.fromSession(props.session))
			if (getWebhookResponse.IsSuccess) {
				const updatedWebhook = getWebhookResponse.Data as Webhook
				setInitialData(deepCopy(updatedWebhook))
				setWebhook(updatedWebhook)
				setHasUnsavedChanges(false)
			}

			notification.success({
				key,
				message: gloc('Messages.Saved'),
				description: loc('Messages.SavedSuccessfully'),
				className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl',
			})
		}
		else {
			const error = updateResponse.Data as ErrorResponseModel
			if (error) {
				notification.error({
					key,
					message: gloc('Messages.Failed'),
					description: gloc(`Messages.${error.ErrorCode}`) || error.Message,
					className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl',
				});
			}
			else {
				notification.error({
					key,
					message: gloc("Messages.Error"),
					description: gloc("Messages.UnknownError"),
					className: "dark:bg-zinc-900 dark:border dark:border-zinc-700 dark:text-zinc-100"
				});
			}
		}
	}

	const onWebhookChange = (changedWebhook: Webhook) => {
		setWebhook(changedWebhook)
		setHasUnsavedChanges(!deepEqual(initialData, changedWebhook || webhook))
	}

	const onValidationStateChange = (validationMessages: string[]) => {
		setValidationErrors(validationMessages)
	}

	const openCloseDiffViewerPanel = () => {
		setDiffViewerVisibility(!diffViewerVisibility)
	}

	const renderFooterToolbox = () => {
		return (
			<Fragment>
				<Tooltip title="Diff Viewer" placement="top">
					<button type="button" onClick={openCloseDiffViewerPanel} className={Styles.button.footer}>
						<EyeIcon className="w-5 h-5" strokeWidth={1} />
					</button>
				</Tooltip>
			</Fragment>
		)
	}

	const footerToolboxProvider = Container.get(FooterToolboxProvider)
	footerToolboxProvider.setToolbox(renderFooterToolbox())

	const breadcrumb = [{title: gloc('Breadcrumb.Home'), link: '/'}, {title: gloc('Breadcrumb.Auth')}, {title: loc('Webhooks'), link: '/auth/webhooks'}]

	return (
		<PageWrapper title={webhook.name} breadcrumb={breadcrumb} session={props.session}>
			<PageWrapper.Toolbox>
				{validationErrors && validationErrors.length > 0 ? 
				<Tooltip title={validationErrors[0]} placement="bottom">
					<div>
						<button type="button" className={Styles.button.disabledSuccess + "h-10 pl-8 pr-10 ml-4"} disabled>
							<ContentSave className="w-4 h-4 mr-3 fill-inherit" />
							{gloc('Actions.Save')}
						</button>
					</div>
				</Tooltip>:
				<>
				{hasUnsavedChanges ? 
				<button type="button" onClick={onSubmit} className={Styles.button.success + "h-10 pl-8 pr-10 ml-4"}>
					<ContentSave className="w-4 h-4 mr-3 fill-inherit" />
					{gloc('Actions.Save')}
				</button>:
				<button type="button" className={Styles.button.disabledSuccess + "h-10 pl-8 pr-10 ml-4"} disabled>
					<ContentSave className="w-4 h-4 mr-3 fill-inherit" />
					{gloc('Actions.Save')}
				</button>}
				</>}
			</PageWrapper.Toolbox>

			<PageWrapper.Menu>
				<Link href={`${baseUrl}/webhooks/${webhook?._id}/event-history`} className={"hover:bg-zinc-200 dark:hover:bg-zinc-600 " + `${Styles.menu.menuItemIdle} ${Styles.menu.menuItem}`}>
					<CalendarIcon className="w-5 h-5 fill-slate-700 dark:fill-zinc-200" />
					<span className="ml-3">{loc('EventHistory.EventHistory')}</span>
				</Link>
			</PageWrapper.Menu>

			<PageWrapper.Content>
				<div className="relative flex justify-between h-full overflow-y-hidden">
					<div className="flex-1 overflow-y-hidden px-10 pt-8 pb-0">
						<WebhookEditor webhook={props.model} onWebhookChange={onWebhookChange} onValidationStateChange={onValidationStateChange} />
					</div>

					<div className="border-l border-borderline dark:border-borderlinedark p-7 min-w-[22.5%] max-w-[30%]">
						<div className="mb-5">
							<label className="text-xs text-zinc-500 leading-4">{loc('Id')}</label>
							<span className="block text-sm font-medium text-gray-600 dark:text-gray-200">{webhook._id}</span>
						</div>

						<div className="mb-5">
							<label className={Styles.label.default}>{loc('Name')}</label>
							<span className={Styles.text.subtext}>{webhook.name}</span>
						</div>

						<div className="mb-5">
							<label className={Styles.label.default}>{loc('Description')}</label>
							<span className={Styles.text.subtext}>{webhook.description}</span>
						</div>

						<SysInfoPanel sys={webhook.sys} />
					</div>

					<RouteLeavingGuard 
						hasUnsavedChanges={hasUnsavedChanges} 
						title={gloc("Messages.UnsavedChanges")} 
						message={gloc("Messages.ThereAreUnsavedChanges")} 
						question={gloc("Messages.AreYouSureYouWantToContinue")}
						session={props.session} />
				</div>

				<DiffViewerPanel originalContent={initialData} changedContent={webhook} isVisible={diffViewerVisibility} onCloseRequest={openCloseDiffViewerPanel} />
			</PageWrapper.Content>
		</PageWrapper>
	)
}

export const getServerSideProps: GetServerSideProps<WebhookDetailProps & PageProps> = async (context) => {
	let webhook: Webhook | undefined
	let notFound: boolean = false

	const webhookId: string | null = exportIdFromContext(context)
	const session = getValidatedServerSession(context.req, context.res)
	if (webhookId) {
		const webhookService = Container.get(WebhookService);
		const getWebhookResponse = await webhookService.getWebhookAsync(webhookId, BearerToken.fromSession(session))
		if (getWebhookResponse.IsSuccess) {
			webhook = getWebhookResponse.Data as Webhook
		}
		else {
			notFound = true
		}
	}
	else {
		notFound = true
	}

	const props: WebhookDetailProps & PageProps = {
		model: webhook ?? {} as Webhook,
		session
	}

	return {
		props: props,
		notFound: notFound,
		redirect: await checkAuthorization(session, context.resolvedUrl) || ""
	}
};