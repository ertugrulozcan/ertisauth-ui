import React, { useState, Fragment } from 'react'
import RoleEditor from '../../../components/auth/roles/RoleEditor'
import DiffViewerPanel from '../../../components/utils/DiffViewerPanel'
import RouteLeavingGuard from '../../../components/modals/RouteLeavingGuard'
import SysInfoPanel from '../../../components/layouts/panels/SysInfoPanel'
import { ErtisAuthConfiguration } from '../../../configuration/ErtisAuthConfiguration'
import { PageProps } from '../../../models/PageProps'
import { GetServerSideProps } from "next"
import { Tooltip, Space, Spin, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { ContentSave } from '../../../components/icons/google/MaterialIcons'
import { EyeIcon } from '@heroicons/react/outline'
import { Container } from 'typedi'
import { Styles } from '../../../components/Styles'
import { getValidatedServerSession } from '../../../models/auth/Session'
import { checkAuthorization } from '../../../services/AuthorizationHandler'
import { BearerToken } from '../../../models/auth/BearerToken'
import { Role } from "../../../models/auth/roles/Role"
import { sortRbacDefinitions } from '../../../helpers/RoleHelper'
import { RoleService } from "../../../services/auth/RoleService"
import { ErrorResponseModel } from '../../../models/ErrorResponseModel'
import { PageWrapper } from "../../../components/layouts/PageWrapper"
import { FooterToolboxProvider } from '../../../components/layouts/footer/FooterToolboxProvider'
import { deepEqual, deepCopy } from '../../../helpers/ObjectHelper'
import { exportIdFromContext } from '../../../helpers/RouteHelper'
import { useTranslations } from 'next-intl'

export type RoleDetailProps = {
	model: Role
};

export default function RoleDetail(props: RoleDetailProps & PageProps) {
	const [initialData, setInitialData] = useState<Role>(deepCopy(props.model));
	const [role, setRole] = useState<Role>(props.model);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>();
	const [diffViewerVisibility, setDiffViewerVisibility] = useState<boolean>(false);

	const gloc = useTranslations()
	const loc = useTranslations('Auth.Roles')

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

		const roleService = Container.get(RoleService)
		const updateResponse = await roleService.updateRoleAsync(role, BearerToken.fromSession(props.session))
		if (updateResponse.IsSuccess) {
			const getRoleResponse = await roleService.getRoleAsync(role._id, BearerToken.fromSession(props.session))
			if (getRoleResponse.IsSuccess) {
				const updatedRole = getRoleResponse.Data as Role
				updatedRole.permissions = updatedRole.permissions ? sortRbacDefinitions(updatedRole.permissions, "rbac") : []
				updatedRole.forbidden = updatedRole.forbidden ? sortRbacDefinitions(updatedRole.forbidden, "rbac") : []

				setInitialData(deepCopy(updatedRole))
				setRole(updatedRole)
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

	const onRoleChange = (changedRole: Role) => {
		setRole(changedRole)
		setHasUnsavedChanges(!deepEqual(initialData, changedRole || role))
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

	const breadcrumb = [{title: gloc('Breadcrumb.Home'), link: '/'}, {title: gloc('Breadcrumb.Auth')}, {title: loc('Roles'), link: '/auth/roles'}]
	return (
		<PageWrapper title={role.name} breadcrumb={breadcrumb} session={props.session}>
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
				<div className="flex flex-1 justify-between overflow-y-hidden">
					<div className="relative w-full overflow-y-hidden">
						<div className="overflow-y-hidden h-full px-10 pt-8 pb-0">
							<RoleEditor role={role} onRoleChange={onRoleChange} session={props.session} />
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
							<span className={Styles.text.subtext}>{role._id}</span>
						</div>

						<SysInfoPanel sys={role.sys} />
					</div>
				</div>

				<DiffViewerPanel originalContent={initialData} changedContent={role} isVisible={diffViewerVisibility} onCloseRequest={openCloseDiffViewerPanel} />
			</PageWrapper.Content>
		</PageWrapper>
	)
}

export const getServerSideProps: GetServerSideProps<RoleDetailProps & PageProps> = async (context) => {
	let role: Role | undefined
	let notFound: boolean = false
	
	const roleId: string | null = exportIdFromContext(context)
	const session = getValidatedServerSession(context.req, context.res)
	if (roleId) {
		const roleService = Container.get(RoleService);
		const getRoleResponse = await roleService.getRoleAsync(roleId, BearerToken.fromSession(session))
		if (getRoleResponse.IsSuccess) {
			role = getRoleResponse.Data as Role
			role.permissions = role.permissions ? sortRbacDefinitions(role.permissions, "rbac") : []
			role.forbidden = role.forbidden ? sortRbacDefinitions(role.forbidden, "rbac") : []
		}
		else {
			notFound = true
		}
	}
	else {
		notFound = true
	}

	const props: RoleDetailProps & PageProps = {
		model: role ?? {} as Role,
		session
	}

	return {
		props: props,
		notFound: notFound,
		redirect: await checkAuthorization(session, context.resolvedUrl) || ""
	}
};