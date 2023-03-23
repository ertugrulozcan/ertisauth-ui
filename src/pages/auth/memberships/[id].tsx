import React, { Fragment, useState } from "react"
import MembershipEditor from "../../../components/auth/memberships/MembershipEditor"
import DiffViewerPanel from '../../../components/utils/DiffViewerPanel'
import RouteLeavingGuard from '../../../components/modals/RouteLeavingGuard'
import SysInfoPanel from "../../../components/layouts/panels/SysInfoPanel"
import { ErtisAuthConfiguration } from "../../../configuration/ErtisAuthConfiguration"
import { PageProps } from "../../../models/PageProps"
import { GetServerSideProps } from "next"
import { Tooltip, Space, Spin, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { Container } from 'typedi'
import { EyeIcon } from '@heroicons/react/outline'
import { ContentSave } from '../../../components/icons/google/MaterialIcons'
import { MembershipService } from "../../../services/auth/MembershipService"
import { getValidatedServerSession } from '../../../models/auth/Session'
import { checkAuthorization } from "../../../services/AuthorizationHandler"
import { BearerToken } from "../../../models/auth/BearerToken"
import { PageWrapper } from "../../../components/layouts/PageWrapper"
import { Membership } from '../../../models/auth/memberships/Membership'
import { ErrorResponseModel } from "../../../models/ErrorResponseModel"
import { MembershipSettings } from "../../../models/auth/memberships/MembershipSettings"
import { Styles } from "../../../components/Styles"
import { FooterToolboxProvider } from "../../../components/layouts/footer/FooterToolboxProvider"
import { deepEqual, deepCopy } from "../../../helpers/ObjectHelper"
import { exportIdFromContext } from "../../../helpers/RouteHelper"
import { useTranslations } from 'next-intl'

export type MembershipDetailProps = {
	model: Membership
	membershipSettings: MembershipSettings
};

export default function MembershipDetail(props: MembershipDetailProps & PageProps) {
	const [initialData, setInitialData] = useState<Membership>(deepCopy(props.model));
	const [membership, setMembership] = useState<Membership>(props.model);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>();
	const [diffViewerVisibility, setDiffViewerVisibility] = useState<boolean>(false);
	const [isValid, setIsValid] = useState<boolean>(true);

	const gloc = useTranslations()
	const loc = useTranslations('Auth.Memberships')

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

		const membershipService = Container.get(MembershipService)
		const updateResponse = await membershipService.updateMembershipAsync(membership, BearerToken.fromSession(props.session))
		if (updateResponse.IsSuccess) {
			const getMembershipResponse = await membershipService.getMembershipAsync(membership._id, BearerToken.fromSession(props.session))
			if (getMembershipResponse.IsSuccess) {
				const updatedMembership = getMembershipResponse.Data as Membership
				setInitialData(deepCopy(updatedMembership))
				setMembership(updatedMembership)
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

	const onMembershipChange = (changedMembership: Membership) => {
		setMembership(changedMembership)
		setHasUnsavedChanges(!deepEqual(initialData, changedMembership || membership))
	}

	const onValidationStateChange = (isValid: boolean) => {
		setIsValid(isValid)
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

	const breadcrumb = [{title: gloc('Breadcrumb.Home'), link: '/'}, {title: gloc('Breadcrumb.Auth')}, {title: loc('Memberships'), link: '/auth/memberships'}]
	return (
		<PageWrapper title={membership.name} breadcrumb={breadcrumb} session={props.session}>
			<PageWrapper.Toolbox>
				{!isValid ? 
				<button type="button" className={Styles.button.disabledSuccess + "h-10 pl-8 pr-10 ml-4"} disabled>
					<ContentSave className="w-4 h-4 mr-3 fill-inherit" />
					{gloc('Actions.Save')}
				</button>:
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
				<div className="flex flex-1 justify-between overflow-y-hidden">
					<div className="relative w-full overflow-y-hidden">
						<div className="overflow-y-scroll h-full px-10 py-8">
							<MembershipEditor 
								membership={props.model} 
								membershipSettings={props.membershipSettings} 
								mode={"update"}
								onMembershipChange={onMembershipChange} 
								onValidationStateChange={onValidationStateChange} />
						</div>

						<RouteLeavingGuard 
							hasUnsavedChanges={hasUnsavedChanges} 
							title={gloc("Messages.UnsavedChanges")} 
							message={gloc("Messages.ThereAreUnsavedChanges")} 
							question={gloc("Messages.AreYouSureYouWantToContinue")}
							session={props.session} />
					</div>

					<div className="border-l border-borderline dark:border-borderlinedark p-7 min-w-[22.5%] max-w-[30%]">
						<div className="mb-5">
							<label className={Styles.label.default}>{loc('Id')}</label>
							<span className={Styles.text.subtext}>{membership._id}</span>
						</div>

						<div className="mb-5">
							<label className={Styles.label.default}>{loc('Name')}</label>
							<span className={Styles.text.subtext}>{membership.name}</span>
						</div>

						<SysInfoPanel sys={membership.sys} />
					</div>
				</div>

				<DiffViewerPanel originalContent={initialData} changedContent={membership} isVisible={diffViewerVisibility} onCloseRequest={openCloseDiffViewerPanel} />
			</PageWrapper.Content>
		</PageWrapper>
	)
}

export const getServerSideProps: GetServerSideProps<MembershipDetailProps & PageProps> = async (context) => {
	let membership: Membership | undefined
	let membershipSettings: MembershipSettings | undefined
	let notFound: boolean = false

	const membershipId: string | null = exportIdFromContext(context)
	const session = getValidatedServerSession(context.req, context.res)
	if (membershipId) {
		const membershipService = Container.get(MembershipService);
		const getMembershipResponse = await membershipService.getMembershipAsync(membershipId, BearerToken.fromSession(session))
		if (getMembershipResponse.IsSuccess) {
			membership = getMembershipResponse.Data as Membership

			const getMembershipSettingsResponse = await membershipService.getMembershipSettingsAsync(BearerToken.fromSession(session))
			if (getMembershipSettingsResponse.IsSuccess) {
				membershipSettings = getMembershipSettingsResponse.Data as MembershipSettings
			}
		}
		else {
			notFound = true
		}
	}
	else {
		notFound = true
	}

	const props: MembershipDetailProps & PageProps = {
		model: membership ?? {} as Membership,
		membershipSettings: membershipSettings ?? {} as MembershipSettings,
		session
	}

	return {
		props: props,
		notFound: notFound,
		redirect: await checkAuthorization(session, context.resolvedUrl) || ""
	}
};