import React, { Fragment, useState } from "react"
import Link from "next/link"
import MailhookEditor from "../../../components/auth/mailhooks/MailhookEditor"
import DiffViewerPanel from '../../../components/utils/DiffViewerPanel'
import RouteLeavingGuard from '../../../components/modals/RouteLeavingGuard'
import SysInfoPanel from "../../../components/layouts/panels/SysInfoPanel"
import { ErtisAuthConfiguration } from "../../../configuration/ErtisAuthConfiguration"
import { PageProps } from "../../../models/PageProps"
import { GetServerSideProps } from "next"
import { Container } from 'typedi'
import { Tooltip, Space, Spin, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { EyeIcon } from '@heroicons/react/outline'
import { ContentSave } from '../../../components/icons/google/MaterialIcons'
import { Styles } from '../../../components/Styles'
import { Mailhook } from "../../../models/auth/mailhooks/Mailhook"
import { Membership } from "../../../models/auth/memberships/Membership"
import { NetworkService } from "../../../services/NetworkService"
import { MailhookService } from "../../../services/auth/MailhookService"
import { MembershipService } from "../../../services/auth/MembershipService"
import { ErrorResponseModel } from "../../../models/ErrorResponseModel"
import { getValidatedServerSession } from '../../../models/auth/Session'
import { checkAuthorization } from "../../../services/AuthorizationHandler"
import { BearerToken } from "../../../models/auth/BearerToken"
import { PageWrapper } from "../../../components/layouts/PageWrapper"
import { FooterToolboxProvider } from '../../../components/layouts/footer/FooterToolboxProvider'
import { deepEqual, deepCopy } from "../../../helpers/ObjectHelper"
import { exportIdFromContext } from "../../../helpers/RouteHelper"
import { useTranslations } from 'next-intl'

import { ExclamationIcon } from "@heroicons/react/solid"

export type MailhookDetailProps = {
	model: Mailhook
	membership: Membership
};

export default function MailhookDetail(props: MailhookDetailProps & PageProps) {
	const [initialData, setInitialData] = useState<Mailhook>(deepCopy(props.model));
	const [mailhook, setMailhook] = useState<Mailhook>(props.model);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>();
	const [diffViewerVisibility, setDiffViewerVisibility] = useState<boolean>(false);
	const [validationErrors, setValidationErrors] = useState<string[]>();
	const [isSmtpServerConfigurated, setIsSmtpServerConfigurated] = useState<boolean>();
	const [smtpServerTestProgressing, setSmtpServerTestProgressing] = useState<boolean>();
	const [smtpServerTestResult, setSmtpServerTestResult] = useState<boolean>();
	const [smtpServerTestError, setSmtpServerTestError] = useState<string>();

	const gloc = useTranslations()
	const loc = useTranslations('Auth.Mailhooks')

	const baseUrl = "/auth"

	React.useEffect(() => {
		const isSmtpServerConfigurated = props.membership.mail_settings && props.membership.mail_settings.smtp_server
		if (isSmtpServerConfigurated) {
			setIsSmtpServerConfigurated(true)
			testSmtpServerConnection()
		}
		else {
			setIsSmtpServerConfigurated(false)
		}
	}, [props.membership]) // eslint-disable-line react-hooks/exhaustive-deps

	const testSmtpServerConnection = React.useCallback(async () => {
		if (props.membership.mail_settings && props.membership.mail_settings.smtp_server) {
			setSmtpServerTestProgressing(true)
			setSmtpServerTestResult(undefined)
			setSmtpServerTestError(undefined)

			try {
				const networkService = Container.get(NetworkService);
				const response = await networkService.smtpServerTestConnectionAsync(props.membership.mail_settings.smtp_server)
				if (response.IsSuccess) {
					setSmtpServerTestResult(true)
					setSmtpServerTestError(undefined)
				}
				else {
					setSmtpServerTestResult(false)
					const error = response.Data as ErrorResponseModel
					setSmtpServerTestError(error.Message)
				}
			}
			catch (ex) {
				setSmtpServerTestError(`${ex}`)
			}
			finally {
				setSmtpServerTestProgressing(false)
			}
		}
    }, [props.membership]) // eslint-disable-line react-hooks/exhaustive-deps

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

		const mailhookService = Container.get(MailhookService)
		const updateResponse = await mailhookService.updateMailhookAsync(mailhook, BearerToken.fromSession(props.session))
		if (updateResponse.IsSuccess) {
			const getMailhookResponse = await mailhookService.getMailhookAsync(mailhook._id, BearerToken.fromSession(props.session))
			if (getMailhookResponse.IsSuccess) {
				const updatedMailhook = getMailhookResponse.Data as Mailhook
				setInitialData(deepCopy(updatedMailhook))
				setMailhook(updatedMailhook)
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

	const onMailhookChange = (changedMailhook: Mailhook) => {
		setMailhook(changedMailhook)
		setHasUnsavedChanges(!deepEqual(initialData, changedMailhook || mailhook))
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

	const breadcrumb = [{title: gloc('Breadcrumb.Home'), link: '/'}, {title: gloc('Breadcrumb.Auth')}, {title: loc('Mailhooks'), link: '/auth/mailhooks'}]

	return (
		<PageWrapper title={mailhook.name} breadcrumb={breadcrumb} session={props.session}>
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

			<PageWrapper.Content>
				<div className="relative flex justify-between h-full overflow-y-hidden">
					<div className="flex flex-col flex-1 overflow-y-hidden px-10 pt-8 pb-0">
						{isSmtpServerConfigurated === false || smtpServerTestResult === false ?
						<div className="flex flex-shrink justify-between items-center bg-gray-50 dark:bg-zinc-900 border border-dashed border-red-500 dark:border-red-600 rounded-md px-6 py-4 mb-8">
							<div className="flex items-center gap-4">
								<ExclamationIcon className="w-6 h-6 fill-red-500 animate-pulse" />
								<span className="text-gray-500 dark:text-zinc-400 text-justify text-sm font-semibold leading-none line-clamp-1 pb-px">
									{`${loc("Warning")}: ${isSmtpServerConfigurated ? `${loc("SmtpServerTestFailed")} (${loc("Error")}: ${(smtpServerTestError || loc("UnknownError"))})` : loc("SmtpServerNotConfigured")}`}
								</span>
							</div>
							<Link href={`${baseUrl}/memberships/${props.membership._id}`} className="flex items-center justify-center text-xs font-medium leading-none text-gray-900 bg-white rounded border border-gray-400 focus:outline-none hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-gray-300 dark:focus:ring-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-600 dark:hover:text-white dark:hover:bg-zinc-700 min-w-[6rem] py-2 pl-4 pr-5">
								<span className="text-inherit pt-0.5">{loc("GoToMailSettings")}</span>
							</Link>
						</div> :
						<>
						{smtpServerTestProgressing ?
						<div className="flex flex-shrink justify-between items-center bg-gray-50 dark:bg-zinc-900 border border-dashed border-gray-500 dark:border-zinc-700 rounded-md px-6 py-4 mb-8">
							<div className="flex items-center gap-4">
								<span className="text-gray-500 dark:text-zinc-400 text-justify text-sm font-semibold leading-none line-clamp-1 pb-px">
									{loc("SmtpServerChecking")}...
								</span>
							</div>
						</div> :
						<></>}
						</>}
						
						<MailhookEditor mailhook={props.model} onMailhookChange={onMailhookChange} onValidationStateChange={onValidationStateChange} />
					</div>

					<div className="border-l border-borderline dark:border-borderlinedark p-7 min-w-[22.5%] max-w-[30%]">
						<div className="mb-5">
							<label className="text-xs text-zinc-500 leading-4">{loc('Id')}</label>
							<span className="block text-sm font-medium text-gray-600 dark:text-gray-200">{mailhook._id}</span>
						</div>

						<div className="mb-5">
							<label className={Styles.label.default}>{loc('Name')}</label>
							<span className={Styles.text.subtext}>{mailhook.name}</span>
						</div>

						<div className="mb-5">
							<label className={Styles.label.default}>{loc('Description')}</label>
							<span className={Styles.text.subtext}>{mailhook.description}</span>
						</div>

						<SysInfoPanel sys={mailhook.sys} />
					</div>

					<RouteLeavingGuard 
						hasUnsavedChanges={hasUnsavedChanges} 
						title={gloc("Messages.UnsavedChanges")} 
						message={gloc("Messages.ThereAreUnsavedChanges")} 
						question={gloc("Messages.AreYouSureYouWantToContinue")}
						session={props.session} />
				</div>

				<DiffViewerPanel originalContent={initialData} changedContent={mailhook} isVisible={diffViewerVisibility} onCloseRequest={openCloseDiffViewerPanel} />
			</PageWrapper.Content>
		</PageWrapper>
	)
}

export const getServerSideProps: GetServerSideProps<MailhookDetailProps & PageProps> = async (context) => {
	let mailhook: Mailhook | undefined
	let membership: Membership | undefined
	let notFound: boolean = false

	const mailhookId: string | null = exportIdFromContext(context)
	const session = getValidatedServerSession(context.req, context.res)
	if (mailhookId) {
		const mailhookService = Container.get(MailhookService);
		const getMailhookResponse = await mailhookService.getMailhookAsync(mailhookId, BearerToken.fromSession(session))
		if (getMailhookResponse.IsSuccess) {
			mailhook = getMailhookResponse.Data as Mailhook

			const membershipService = Container.get(MembershipService);
			const getMembershipResponse = await membershipService.getMembershipAsync(mailhook.membership_id, BearerToken.fromSession(session))
			if (getMembershipResponse.IsSuccess) {
				membership = getMembershipResponse.Data as Membership
			}
			else {
				notFound = true
			}
		}
		else {
			notFound = true
		}
	}
	else {
		notFound = true
	}

	const props: MailhookDetailProps & PageProps = {
		model: mailhook ?? {} as Mailhook,
		membership: membership ?? {} as Membership,
		session
	}

	return {
		props: props,
		notFound: notFound,
		redirect: await checkAuthorization(session, context.resolvedUrl) || ""
	}
};