import React, { Fragment, useState } from "react"
import UbacManagementView from '../../../components/auth/users/UbacManagementView'
import DiffViewerPanel from '../../../components/utils/DiffViewerPanel'
import RouteLeavingGuard from '../../../components/modals/RouteLeavingGuard'
import SysInfoPanel from "../../../components/layouts/panels/SysInfoPanel"
import Select from "../../../components/general/Select"
import { ErtisAuthConfiguration } from "../../../configuration/ErtisAuthConfiguration"
import { PageProps } from "../../../models/PageProps"
import { GetServerSideProps } from "next"
import { Container } from 'typedi'
import { Tooltip, Space, Spin, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { EyeIcon } from '@heroicons/react/outline'
import { ContentSave } from '../../../components/icons/google/MaterialIcons'
import { Styles } from '../../../components/Styles'
import { Application } from "../../../models/auth/applications/Application"
import { Role } from "../../../models/auth/roles/Role"
import { Membership } from "../../../models/auth/memberships/Membership"
import { ApplicationService } from "../../../services/auth/ApplicationService"
import { RoleService } from "../../../services/auth/RoleService"
import { MembershipService } from "../../../services/auth/MembershipService"
import { PaginatedResponse } from '../../../models/PaginatedResponse'
import { ErrorResponseModel } from '../../../models/ErrorResponseModel'
import { getValidatedServerSession } from '../../../models/auth/Session'
import { checkAuthorization } from "../../../services/AuthorizationHandler"
import { BearerToken } from "../../../models/auth/BearerToken"
import { PageWrapper } from "../../../components/layouts/PageWrapper"
import { FooterToolboxProvider } from '../../../components/layouts/footer/FooterToolboxProvider'
import { deepEqual, deepCopy } from "../../../helpers/ObjectHelper"
import { IHasUbacs } from "../../../models/auth/users/IHasUbacs"
import { sortRbacDefinitions } from "../../../helpers/RoleHelper"
import { exportIdFromContext } from "../../../helpers/RouteHelper"
import { useTranslations } from 'next-intl'

export type ApplicationDetailProps = {
	model: Application
	membership: Membership
	roles: Role[] | undefined
};

const getApplicationRole = (application: Application, roles: Role[] | undefined): Role | undefined => {
	let role: Role | undefined = roles?.find(x => x.name === application.role)
	return role ? { 
		...role, 
		permissions: role.permissions ? sortRbacDefinitions(role.permissions, "rbac") : [], 
		forbidden: role.forbidden ? sortRbacDefinitions(role.forbidden, "rbac") : []
	} : role
}

export default function ApplicationDetail(props: ApplicationDetailProps & PageProps) {
	const [initialData, setInitialData] = useState<Application>(deepCopy(props.model));
	const [application, setApplication] = useState<Application>(props.model);
	const [applicationRole, setApplicationRole] = useState<Role>();
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>();
	const [diffViewerVisibility, setDiffViewerVisibility] = useState<boolean>(false);

	const gloc = useTranslations()
	const loc = useTranslations('Auth.Applications')

	React.useEffect(() => {
		setApplicationRole(getApplicationRole(application, props.roles))
    }, [application, props.roles])

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

		const applicationService = Container.get(ApplicationService)		
		const updateResponse = await applicationService.updateApplicationAsync(application, BearerToken.fromSession(props.session))
		if (updateResponse.IsSuccess) {
			const getApplicationResponse = await applicationService.getApplicationAsync(application._id, BearerToken.fromSession(props.session))
			if (getApplicationResponse.IsSuccess) {
				const updatedApplication = getApplicationResponse.Data as Application
				setInitialData(deepCopy(updatedApplication))
				setApplication(updatedApplication)
				setApplicationRole(getApplicationRole(updatedApplication, props.roles))
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

	const checkChanges = (changedApplication?: Application) => {
		setHasUnsavedChanges(!deepEqual(initialData, changedApplication || application))
	}

	const onUbacDefinitionsChange = (userOrApplication: IHasUbacs) => {
		setApplication(userOrApplication as Application)
		checkChanges(userOrApplication as Application)
	}

	const handleRoleChange = (e: React.FormEvent<HTMLSelectElement>) => {
		const value = e.currentTarget.value;
		setApplication(values => ({ ...values, ["role"]: value }))
		checkChanges({ ...application, ["role"]: value })
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

	const labelClass: string = "flex items-end text-[0.8rem] font-semibold text-gray-900 dark:text-zinc-300 leading-none self-center mb-2"

	const breadcrumb = [{title: gloc('Breadcrumb.Home'), link: '/'}, {title: gloc('Breadcrumb.Auth')}, {title: loc('Applications'), link: '/auth/applications'}]
	return (
		<PageWrapper title={application.name} breadcrumb={breadcrumb} session={props.session}>
			<PageWrapper.Toolbox>
				{hasUnsavedChanges ? 
				<button type="button" onClick={onSubmit} className={Styles.button.success + "h-10 pl-8 pr-10 ml-4"}>
					<ContentSave className="w-4 h-4 mr-3 fill-inherit" />
					{gloc('Actions.Save')}
				</button>:
				<button type="button" className={Styles.button.disabledSuccess + "h-10 pl-8 pr-10 ml-4"} disabled>
					<ContentSave className="w-4 h-4 mr-3 fill-inherit" />
					{gloc('Actions.Save')}
				</button>}
			</PageWrapper.Toolbox>

			<PageWrapper.Content>
				<div className="flex justify-between overflow-y-hidden">
					<div className="flex flex-col flex-1 overflow-y-hidden px-10 pt-8 pb-0">
						<div className="grid grid-cols-12 gap-6">
							<div className="col-span-6">
								<label htmlFor="nameInput" className={labelClass}>
									{loc('Name')}
									<span className={Styles.input.required}>*</span>
								</label>
								<input id="nameInput" type="text" name="name" autoComplete="off" className={Styles.input.default + Styles.input.disabled} defaultValue={application.name || ""} readOnly={true} />
							</div>

							<div className="col-span-6">
								<label htmlFor="roleDropdown" className={labelClass}>
									{loc('Role')}
									<span className={Styles.input.required}>*</span>
								</label>
								<Select id="roleDropdown" name="roleDropdown" value={application.role} onChange={handleRoleChange}>
									{props.roles?.map(role => <option value={role.name} key={role._id}>{role.name}</option>)}
								</Select>
							</div>

							<div className="col-span-12">
								<label htmlFor="basicTokenInput" className={labelClass}>
									{loc('Key')}
								</label>
								<input id="basicTokenInput" type="text" name="basicToken" autoComplete="off" className={Styles.input.default + Styles.input.disabled} defaultValue={`${application._id}:${props.membership.secret_key}`} readOnly={true} />
							</div>
						</div>

						{applicationRole ?
						<div className="flex-1 overflow-y-scroll mt-8 pb-8">
							<UbacManagementView userOrApplication={application} role={applicationRole} session={props.session} onUserOrApplicationChange={onUbacDefinitionsChange} />
						</div>:
						<></>}
					</div>

					<div className="border-l border-borderline dark:border-borderlinedark p-7 min-w-[22.5%] max-w-[30%]">
						<div className="mb-5">
							<label className="text-xs text-zinc-500 leading-4">{loc('Id')}</label>
							<span className="block text-sm font-medium text-gray-600 dark:text-gray-200">{application._id}</span>
						</div>

						<div className="mb-5">
							<label className={Styles.label.default}>{loc('Name')}</label>
							<span className={Styles.text.subtext}>{application.name}</span>
						</div>

						<div className="mb-5">
							<label className={Styles.label.default}>{loc('Role')}</label>
							<span className={Styles.text.subtext}>{application.role}</span>
						</div>

						<SysInfoPanel sys={application.sys} />
					</div>

					<RouteLeavingGuard 
						hasUnsavedChanges={hasUnsavedChanges} 
						title={gloc("Messages.UnsavedChanges")} 
						message={gloc("Messages.ThereAreUnsavedChanges")} 
						question={gloc("Messages.AreYouSureYouWantToContinue")}
						session={props.session} />
				</div>

				<DiffViewerPanel originalContent={initialData} changedContent={application} isVisible={diffViewerVisibility} onCloseRequest={openCloseDiffViewerPanel} />
			</PageWrapper.Content>
		</PageWrapper>
	)
}

export const getServerSideProps: GetServerSideProps<ApplicationDetailProps & PageProps> = async (context) => {
	let application: Application | undefined
	let roles: Role[] | undefined
	let membership: Membership | undefined
	let notFound: boolean = false

	const applicationId: string | null = exportIdFromContext(context)
	const session = getValidatedServerSession(context.req, context.res)
	if (applicationId) {
		const applicationService = Container.get(ApplicationService);
		const roleService = Container.get(RoleService);
		const membershipService = Container.get(MembershipService);

		const getApplicationResponse = await applicationService.getApplicationAsync(applicationId, BearerToken.fromSession(session))
		if (getApplicationResponse.IsSuccess) {
			application = getApplicationResponse.Data as Application
			
			const getRolesResponse = await roleService.getRolesAsync(BearerToken.fromSession(session))
			if (getRolesResponse.IsSuccess) {
				const paginatedRoles = getRolesResponse.Data as PaginatedResponse<Role>
				roles = paginatedRoles.items
			}

			const getMembershipResponse = await membershipService.getMembershipAsync(application.membership_id, BearerToken.fromSession(session))
			if (getMembershipResponse.IsSuccess) {
				membership = getMembershipResponse.Data as Membership
			}
		}
		else {
			notFound = true
		}
	}
	else {
		notFound = true
	}

	const props: ApplicationDetailProps & PageProps = {
		model: application ?? {} as Application,
		roles: roles,
		membership: membership ?? {} as Membership,
		session
	}

	return {
		props: props,
		notFound: notFound,
		redirect: await checkAuthorization(session, context.resolvedUrl) || ""
	}
};