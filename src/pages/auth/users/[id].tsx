import React, { useState, Fragment } from 'react'
import Router from 'next/router'
import ContentProperties from '../../../components/cms/content/ContentProperties'
import Panel from '../../../components/layouts/panels/Panel'
import Avatar from '../../../components/auth/users/Avatar'
import UbacManagementView from '../../../components/auth/users/UbacManagementView'
import UserSessions from '../../../components/auth/sessions/UserSessions'
import BottomPanel from '../../../components/layouts/panels/BottomPanel'
import DiffViewerPanel from '../../../components/utils/DiffViewerPanel'
import RouteLeavingGuard from '../../../components/modals/RouteLeavingGuard'
import UserEvents from '../../../components/auth/users/UserEvents'
import StaticTable from '../../../components/utils/StaticTable'
import SysInfoPanel from '../../../components/layouts/panels/SysInfoPanel'
import ProviderLogo from '../../../components/auth/providers/ProviderLogo'
import ChangePasswordModal from '../../../components/auth/users/ChangePasswordModal'
import Select from "../../../components/general/Select"
import Cookies from 'universal-cookie'
import { useDispatch } from 'react-redux'
import { setSession } from "../../../redux/reducers/SessionReducer"
import { ErtisAuthConfiguration } from '../../../configuration/ErtisAuthConfiguration'
import { PageProps } from '../../../models/PageProps'
import { GetServerSideProps } from "next"
import { Session } from '../../../models/auth/Session'
import { SessionUser } from '../../../models/auth/SessionUser'
import { SessionToken } from "../../../models/auth/SessionToken"
import { Tooltip, Spin, Space, Anchor, notification } from 'antd'
import { Tab, Transition } from '@headlessui/react'
import { LoadingOutlined } from '@ant-design/icons'
import { AlertErrorOutlined, ContentSave } from '../../../components/icons/google/MaterialIcons'
import { EyeIcon, ExclamationIcon } from '@heroicons/react/outline'
import { Container } from 'typedi'
import { Styles } from '../../../components/Styles'
import { getValidatedServerSession } from '../../../models/auth/Session'
import { checkAuthorization } from '../../../services/AuthorizationHandler'
import { BearerToken } from '../../../models/auth/BearerToken'
import { UserTypeService } from '../../../services/auth/UserTypeService'
import { UserType } from '../../../models/auth/user-types/UserType'
import { User } from "../../../models/auth/users/User"
import { Role } from "../../../models/auth/roles/Role"
import { IHasUbacs } from '../../../models/auth/users/IHasUbacs'
import { Membership } from "../../../models/auth/memberships/Membership"
import { MembershipService } from "../../../services/auth/MembershipService"
import { UserService } from "../../../services/auth/UserService"
import { RoleService } from "../../../services/auth/RoleService"
import { PaginatedResponse } from '../../../models/PaginatedResponse'
import { ErrorResponseModel, SchemaValidationErrorResponse } from '../../../models/ErrorResponseModel'
import { PageWrapper } from "../../../components/layouts/PageWrapper"
import { PublishedStorageFile } from '../../../models/media/StorageFile'
import { FooterToolboxProvider } from '../../../components/layouts/footer/FooterToolboxProvider'
import { FieldValidationResult } from '../../../schema/validation/FieldValidationResult'
import { deepEqual, deepCopy } from '../../../helpers/ObjectHelper'
import { sortRbacDefinitions } from '../../../helpers/RoleHelper'
import { toTimeSpan } from '../../../helpers/TimeSpanHelper'
import { isNullUndefinedOrEmpty } from '../../../helpers/StringHelper'
import { exportIdFromContext } from '../../../helpers/RouteHelper'
import { useTranslations } from 'next-intl'

import { 
	ExclamationCircleIcon, 
	ArrowCircleUpIcon, 
	ChevronDoubleDownIcon, 
	ChevronDoubleUpIcon, 
	FingerPrintIcon, 
	InformationCircleIcon, 
	PuzzleIcon, 
	TrashIcon
} 
from '@heroicons/react/solid'
import SafeDeleteModal from '../../../components/modals/SafeDeleteModal'

export type UserDetailProps = {
	model: User
	roles: Role[] | undefined
	membership: Membership
	userType: UserType
	otherUserTypes: UserType[]
};

const hiddenFields = [
	"avatar", 
	"firstname", 
	"lastname", 
	"username", 
	"email_address", 
	"role", 
	"user_type",
	"permissions",
	"forbidden",
	"sourceProvider",
	"connectedAccounts",
	"membership_id",
	"sys"
]

const getUserRole = (user: User, roles: Role[] | undefined): Role | undefined => {
	let role: Role | undefined = roles?.find(x => x.name === user.role)
	return role ? { 
		...role, 
		permissions: role.permissions ? sortRbacDefinitions(role.permissions, "rbac") : [], 
		forbidden: role.forbidden ? sortRbacDefinitions(role.forbidden, "rbac") : []
	} : role
}

export default function UserDetail(props: UserDetailProps & PageProps) {
	const [initialData, setInitialData] = useState<User>(deepCopy(props.model));
	const [user, setUser] = useState<User>(props.model);
	const [userRole, setUserRole] = useState<Role>();
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>();
	const [validationResults, setValidationResults] = useState<FieldValidationResult[]>();
	const [diffViewerVisibility, setDiffViewerVisibility] = useState<boolean>(false);
	const [errorsPanelVisibility, setErrorsPanelVisibility] = useState<boolean>(false);
	const [isBannerShowing, setIsBannerShowing] = useState<boolean>(true);
	const [showHidePanelButtonVisibility, setShowHidePanelButtonVisibility] = useState<boolean>();
	const [isFirstNameInvalid, setIsFirstNameInvalid] = useState<boolean>();
	const [isLastNameInvalid, setIsLastNameInvalid] = useState<boolean>();
	const [changePasswordModalVisibility, setChangePasswordModalVisibility] = useState<boolean>(false);
	const [deleteModalVisibility, setDeleteModalVisibility] = useState<boolean>(false)
	
	const baseUrl = "/auth"

	const dispatch = useDispatch()

	const gloc = useTranslations()
	const loc = useTranslations('Auth.Users')

	React.useEffect(() => {
		setUserRole(getUserRole(user, props.roles))
    }, [user, props.roles])

	React.useEffect(() => {
		setIsFirstNameInvalid(user.firstname === undefined || user.firstname === null || user.firstname.trim() === "")
		setIsLastNameInvalid(user.lastname === undefined || user.lastname === null || user.lastname.trim() === "")
    }, [user, props.userType])

	const overviewPanelScrollableArea: React.MutableRefObject<HTMLInputElement> = React.useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>
	React.useEffect(() => {
		const overviewPanel = overviewPanelScrollableArea.current
		if (overviewPanel) {
			const onOverviewPanelScrollChange = () => {
				const verticalOffset = overviewPanel.scrollTop
				if (verticalOffset && verticalOffset >= 300) {
					setIsBannerShowing(false)
					setShowHidePanelButtonVisibility(true)
				}
				else {
					setIsBannerShowing(true)
					setShowHidePanelButtonVisibility(false)
				}
			}

			overviewPanel.addEventListener('scroll', onOverviewPanelScrollChange)
			return () => overviewPanel.removeEventListener('scroll', onOverviewPanelScrollChange)
		}
    }, [isBannerShowing, overviewPanelScrollableArea.current]) // eslint-disable-line react-hooks/exhaustive-deps

	const checkChanges = (changedUser?: User) => {
		setHasUnsavedChanges(!deepEqual(initialData, changedUser || user))
	}

	const onContentChange = (user: User) => {
		setUser(user)
		checkChanges(user)
	}

	const onValidationResultsChanged = (validationResults: FieldValidationResult[]) => {
		setValidationResults(validationResults)
	}

	const onUbacDefinitionsChange = (userOrApplication: IHasUbacs) => {
		setUser(userOrApplication as User)
		checkChanges(userOrApplication as User)
	}
	
	const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
		const name = e.currentTarget.name;
		const value = e.currentTarget.value;
		setUser(values => ({ ...values, [name]: value }))
		checkChanges({ ...user, [name]: value })
	}

	const handleRoleChange = (e: React.FormEvent<HTMLSelectElement>) => {
		const value = e.currentTarget.value;
		setUser(values => ({ ...values, ["role"]: value }))
		checkChanges({ ...user, ["role"]: value })
	}
	
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

		const userService = Container.get(UserService)
		const updateResponse = await userService.updateUserAsync(user, BearerToken.fromSession(props.session))
		if (updateResponse.IsSuccess) {
			const getUserResponse = await userService.getUserAsync(user._id, BearerToken.fromSession(props.session))
			if (getUserResponse.IsSuccess) {
				const updatedUser = getUserResponse.Data as User
				setInitialData(deepCopy(updatedUser))
				setUser(updatedUser)
				setHasUnsavedChanges(false)

				checkSessionUser(updatedUser)
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
				if (error.Message === "ValidationException") {
					const schemaValidationError = updateResponse.Data as SchemaValidationErrorResponse
					notification.error({
						key,
						message: gloc('ErtisAuth.Messages.ValidationException'),
						duration: 10,
						description: (
						<div>
							<ol>
								{schemaValidationError.Errors.map((error, index) => (
									<li key={index} className="mt-3">
										<div className="flex flex-col border-l-2 border-borderline dark:border-borderlinedark pl-4 pt-0.5 pb-1">
											<span className="font-bold">{error.Message}</span>
											<span className="text-gray-400 dark:text-zinc-400 text-xs leading-1">{error.FieldName}</span>
											<span className="text-gray-400 dark:text-zinc-400 text-xs leading-1">{error.FieldPath}</span>
										</div>
									</li>
								))}
							</ol>
						</div>),
						className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl'
					})
				}
				else {
					notification.error({
						key,
						message: gloc('Messages.Failed'),
						description: gloc(`Messages.${error.ErrorCode}`) || error.Message,
						className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl',
					});
				}
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

	const checkSessionUser = (updatedUser: User) => {
		const sessionUser = props.session.user
		if (sessionUser._id === updatedUser._id) {
			const updatedSessionUser = { 
				...sessionUser, 
				["firstname"]: updatedUser.firstname,
				["lastname"]: updatedUser.lastname,
				["fullname"]: `${updatedUser.firstname} ${updatedUser.lastname}`,
				["username"]: updatedUser.username,
				["email_address"]: updatedUser.email_address,
				["role"]: updatedUser.role,
				["avatar"]: (updatedUser as any).avatar?.url || null
			}

			reloadSessionUser(updatedSessionUser, props.session.token)
		}
	}

	const reloadSessionUser = (sessionUser: SessionUser, sessionToken: SessionToken) => {
		const cookies = new Cookies()
		const newSession: Session = { token: sessionToken, user: sessionUser }

		cookies.set('session', JSON.stringify(newSession), {
			// httpOnly: true, // Refresh token özelliğinin çalışabilmesi için kapatılması gerekti
			httpOnly: false,
			sameSite: 'lax', // CSRF protection
			maxAge: sessionToken.expires_in * 1000,
			path: '/'
		})

		dispatch(setSession(newSession))
	}

	const onAvatarChange = (avatar: PublishedStorageFile) => {
		setUser(values => ({ ...values, ["avatar"]: avatar }))
		const updatedUser = { ...user, ["avatar"]: avatar }
		checkChanges(updatedUser)
	}

	const onChangePasswordClick = () => {
		setChangePasswordModalVisibility(true)
	}

	const onChangePasswordConfirm = () => {
		setChangePasswordModalVisibility(false)
	}

	const onChangePasswordCancel = () => {
		setChangePasswordModalVisibility(false)
	}

	const onDeleteUserClick = () => {
		setDeleteModalVisibility(true)
	}

	const handleUserDeleteConfirm = async (isAuthorized: boolean) => {
		const key = 'deletable'
		if (props.model && isAuthorized) {
			const userService = Container.get(UserService)
			const deleteResponse = await userService.deleteUserAsync(props.model._id, BearerToken.fromSession(props.session))
			if (deleteResponse.IsSuccess) {
				notification.success({
					key,
					message: gloc('Messages.Deleted'),
					description: loc('Messages.DeletedSuccessfully'),
					className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl',
				})

				setDeleteModalVisibility(false)

				Router.push(`/auth/users`)
			}
			else {
				const error = deleteResponse.Data as SchemaValidationErrorResponse
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

		setDeleteModalVisibility(false)
	};

	const handleUserDeleteCancel = () => {
		setDeleteModalVisibility(false)
	};

	const openCloseErrorsPanel = () => {
		setErrorsPanelVisibility(!errorsPanelVisibility)
	}

	const openCloseDiffViewerPanel = () => {
		setDiffViewerVisibility(!diffViewerVisibility)
	}

	const renderFooterToolbox = () => {
		return (
			<Fragment>
				<Tooltip title={gloc("Validations.Errors")} placement="top">
					<button type="button" onClick={openCloseErrorsPanel} className={Styles.button.footer}>
						<ExclamationIcon className="w-5 h-5" strokeWidth={1} />
					</button>
				</Tooltip>

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

	const labelClass: string = "flex items-end text-[0.9rem] font-semibold text-gray-900 dark:text-zinc-300 leading-none self-center mb-2"

	const breadcrumb = [{title: gloc('Breadcrumb.Home'), link: '/'}, {title: gloc('Breadcrumb.Auth')}, {title: loc('Users'), link: '/auth/users'}]
	return (
		<PageWrapper title={user.firstname + " " + user.lastname} breadcrumb={breadcrumb} session={props.session}>
			<PageWrapper.Menu>
				{props.userType?._id && props.userType?._id !== "base-user" ?
				<a href={`${baseUrl}/user-types/${props.userType?._id}`} target="_blank" rel="noreferrer" className={"hover:bg-zinc-200 dark:hover:bg-zinc-600 " + `${Styles.menu.menuItemIdle} ${Styles.menu.menuItem}`}>
					<PuzzleIcon className="w-4 h-4 fill-slate-700 dark:fill-zinc-200 mr-4" />
					{loc('Detail.UserTypeSettings')}
				</a>:
				<></>}
				
				<button type="button" onClick={(e) => onChangePasswordClick()} className={"hover:bg-orange-300 dark:hover:bg-orange-600 " + `${Styles.menu.menuItemIdle} ${Styles.menu.menuItem}`}>
					<FingerPrintIcon className="w-4 h-4 fill-slate-700 dark:fill-zinc-200 mr-4" />
					{loc('Detail.ChangePassword')}
				</button>

				<button type="button" onClick={(e) => onDeleteUserClick()} className={"hover:bg-red-600 hover:text-white dark:hover:bg-red-600 " + `${Styles.menu.menuItemIdle} ${Styles.menu.menuItem}`}>
					<TrashIcon className="w-4 h-4 fill-slate-700 dark:fill-zinc-200 mr-4" />
					{loc('Detail.DeleteUser')}
				</button>
			</PageWrapper.Menu>

			<PageWrapper.Toolbox>
				{validationResults && validationResults.some(x => !x.isValid) ? 
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
				<div className="relative flex flex-col h-full overflow-y-hidden">
					<Tab.Group>
						<Transition
							as={Fragment}
							show={isBannerShowing}
							enter="transition duration-300 ease-out"
							enterFrom="transform -translate-y-32 opacity-0"
							enterTo="transform translate-y-0 opacity-100"
							leave="transition duration-300 ease-out"
							leaveFrom="transform translate-y-0 opacity-100"
							leaveTo="transform -translate-y-32 opacity-0">
							<div className="absolute w-full bg-white/[0.6] dark:bg-zinc-900/[0.85] glass-blur border-b border-zinc-300 dark:border-zinc-700 pt-1 z-[999]">
								<div className="flex items-start max-w-7xl 4xl:max-w-8xl mx-auto pt-8 pb-6 px-2">
									<Avatar user={user} userType={props.userType} session={props.session} onChange={onAvatarChange} />
									
									<div className="w-full ml-8 mt-2 pr-32">
										<div className="flex items-center justify-between mb-1.5">
											<div className="flex items-center gap-4">
												<h2 className="font-extrabold text-gray-900 text-xl dark:text-skin-white leading-none mb-0">{user.firstname} {user.lastname}</h2>
												<span className="items-center justify-center text-xs font-bold leading-none text-indigo-100 bg-indigo-700 rounded px-2 py-1.5">{user.role}</span>

												{user.connectedAccounts && user.connectedAccounts.length > 0 ?
												<div className="flex items-center gap-2">
													{user.connectedAccounts.map((account) => {
														return (
															<Tooltip key={account.Provider} title={account.Provider} placement="bottom">
																<ProviderLogo provider={account.Provider} isActive={!isNullUndefinedOrEmpty(account.Token)} showDefaultLogo={true} className="w-5 h-5" />
															</Tooltip>
														)
													})}
												</div> :
												<></>}
											</div>
										</div>

										<span className="block text-skin-base font-extrabold text-sm">{user.username}</span>
										<span className="block text-gray-500 font-extrabold text-sm leading-tight">{user.email_address}</span>
									</div>
								</div>
								
								<Tab.List className="max-w-7xl 4xl:max-w-8xl mx-auto">
									<Tab className={({ selected }: any) => selected ? Styles.tab.default + " " + Styles.tab.active : Styles.tab.default + " " + Styles.tab.inactive}>{loc('Detail.Overview')}</Tab>
									<Tab className={({ selected }: any) => selected ? Styles.tab.default + " " + Styles.tab.active : Styles.tab.default + " " + Styles.tab.inactive}>{loc('Detail.Permissions')}</Tab>
									<Tab className={({ selected }: any) => selected ? Styles.tab.default + " " + Styles.tab.active : Styles.tab.default + " " + Styles.tab.inactive}>{loc('Detail.Sessions')}</Tab>
								</Tab.List>
							</div>
						</Transition>

						<div className="absolute top-4 right-4 z-[999]">
							{showHidePanelButtonVisibility ?
							<button type="button" onClick={() => {setIsBannerShowing(!isBannerShowing); }} className="backface-visibility-hidden flex transform items-center justify-center rounded-full bg-slate-400 dark:bg-black bg-opacity-20 dark:bg-opacity-20 text-xs font-medium text-slate-500 dark:text-white leading-none transition hover:scale-105 hover:bg-opacity-30 focus:outline-none active:bg-opacity-40 w-40 px-2 py-2.5">
								<span>{isBannerShowing ? <ChevronDoubleUpIcon className="h-4 w-4 opacity-70" /> : <ChevronDoubleDownIcon className="h-4 w-4 opacity-70" />}</span>
								<span className="ml-2">{isBannerShowing ? loc("Detail.HidePanel") : loc("Detail.ShowPanel")}</span>
							</button>:
							<></>}
						</div>

						<div className="h-full text-gray-600 dark:text-zinc-50 overflow-y-hidden">
							<Tab.Panels as={Panel} className="h-full overflow-y-hidden">
								<Tab.Panel ref={overviewPanelScrollableArea} className="h-full overflow-y-scroll scroll-smooth snap-y py-8 pt-[9rem]">
									<div className="max-w-7xl 4xl:max-w-8xl mx-auto">
										<div className="grid grid-cols-12 gap-8 mt-12">
											<div className="grid grid-cols-6 gap-x-6 gap-y-8 col-span-9 h-fit pt-10">
												<div id={props.userType?.properties.find(x => x.name === "firstname")?.guid} className="col-span-3">
													<label htmlFor="firstNameInput" className={labelClass}>
														{loc('FirstName')}
														<span className={Styles.input.required}>*</span>
													</label>
													<div className="relative">
														<input id="firstNameInput" type="text" name="firstname" autoComplete="given-name" className={Styles.input.default} value={user.firstname || ""} onChange={handleChange} />
														{isFirstNameInvalid ?
														<span className={Styles.input.errorIndicator}>
															<ExclamationCircleIcon className="w-5 h-5 text-red-600" />
															<span className="text-xs text-red-500 ml-2">{loc("FirstNameIsRequired")}</span>
														</span>:
														<></>}
													</div>
												</div>

												<div id={props.userType?.properties.find(x => x.name === "lastname")?.guid} className="col-span-3">
													<label htmlFor="lastNameInput" className={labelClass}>
														{loc('LastName')}
														<span className={Styles.input.required}>*</span>
													</label>
													<div className="relative">
														<input id="lastNameInput" type="text" name="lastname" autoComplete="family-name" className={Styles.input.default} value={user.lastname || ""} onChange={handleChange} />
														{isLastNameInvalid ?
														<span className={Styles.input.errorIndicator}>
															<ExclamationCircleIcon className="w-5 h-5 text-red-600" />
															<span className="text-xs text-red-500 ml-2">{loc("LastNameIsRequired")}</span>
														</span>:
														<></>}
													</div>
												</div>

												<div id={props.userType?.properties.find(x => x.name === "email_address")?.guid} className="col-span-4">
													<label htmlFor="emailAddressInput" className={labelClass}>
														{loc('EmailAddress')}
														<span className={Styles.input.required}>*</span>
														<Tooltip title={loc('EmailAddress') + " " + loc('Detail.IsImmutable')} placement="right">
															<div>
																<AlertErrorOutlined className="fill-orange-500 w-4 h-4 ml-2" />
															</div>
														</Tooltip>
													</label>
													<div className="flex rounded-md shadow-sm">
														<span className={Styles.input.group.icon + Styles.input.disabled + " text-sm"}>
															@
														</span>
														<input id="emailAddressInput" type="email" name="email_address" className={Styles.input.group.input + Styles.input.disabled} autoComplete="email" placeholder="Email Address" defaultValue={user.email_address || ""} readOnly={true} />
													</div>
												</div>

												<div id={props.userType?.properties.find(x => x.name === "username")?.guid} className="col-span-2">
													<label htmlFor="usernameInput" className={labelClass}>
														{loc('Username')}
														<span className={Styles.input.required}>*</span>
														<Tooltip title={loc('Username') + " " + loc('Detail.IsImmutable')} placement="right">
															<div>
																<AlertErrorOutlined className="fill-orange-500 w-4 h-4 ml-2" />
															</div>
														</Tooltip>
													</label>
													<input id="usernameInput" type="text" name="username" autoComplete="username" className={Styles.input.default + Styles.input.disabled} defaultValue={user.username || ""} readOnly={true} />
												</div>

												<div id={props.userType?.properties.find(x => x.name === "role")?.guid} className="col-span-2">
													<label htmlFor="roleDropdown" className={labelClass}>
														{loc('Role')}
														<span className={Styles.input.required}>*</span>
													</label>
													<Select id="roleDropdown" name="roleDropdown" value={user.role} onChange={handleRoleChange}>
														{props.roles?.map(role => <option value={role.name} key={role._id}>{role.name}</option>)}
													</Select>
												</div>

												<div className="col-span-6">
													{props.userType ? 
													<ContentProperties 
														content={user} 
														contentType={props.userType} 
														session={props.session}
														hiddenFields={hiddenFields} 
														trackLineVisibility={true}
														onContentChange={onContentChange} 
														onValidationResultsChange={onValidationResultsChanged}
														mode={"unspecified"} /> :
													<></>}
												</div>
											</div>

											<div className="col-span-3 border-l border-stone-300 dark:border-zinc-600 pl-7 pt-10">
												<div className="mb-5">
													<label className={Styles.label.default}>{loc('Detail.AccountID')}</label>
													<span className={Styles.text.subtext}>{user._id}</span>
												</div>

												<div className="mb-5">
													<label className={Styles.label.default}>{loc('Detail.UserType')}</label>
													<span className={Styles.text.subtext}>{user.user_type}</span>
												</div>

												{user.sourceProvider ?
												<div className="mb-5">
													<label className={Styles.label.default}>{loc('Detail.SourceProvider')}</label>
													<span className={Styles.text.subtext}>{user.sourceProvider}</span>
												</div> :
												<></>}

												<SysInfoPanel sys={user.sys} />

												{props.session?.token?.access_token && props.session?.user?._id === user._id ?
													<div className="mb-5">
														<label className={Styles.label.default}>{loc('Detail.Token')}</label>
														<textarea className={Styles.input.textarea + " font-['RobotoMono'] text-xs text-gray-700 bg-white border rounded-md dark:bg-neutral-900 dark:text-gray-300 h-[16rem]"} readOnly={true} value={props.session?.token?.access_token} />
													</div> :
													<></>}

												<div className="mt-16">
													<label className="flex items-center text-sm font-medium leading-none text-gray-800 dark:text-gray-200">{loc('Detail.EventsAndLogs')}</label>
													<UserEvents user={props.model} session={props.session} className="mt-3 pl-4" />
												</div>
											</div>
										</div>
									</div>
								</Tab.Panel>

								<Tab.Panel className={"h-full overflow-y-scroll py-8 " + (isBannerShowing ? "pt-[13rem]" : "pt-0")}>
									<div className="max-w-7xl 4xl:max-w-8xl mx-auto">
										{userRole ?
										<div>
											<div className="flex flex-shrink justify-between items-center bg-gray-50 dark:bg-zinc-900/[0.5] border border-dashed border-gray-400 dark:border-zinc-700 rounded-lg px-6 py-4 mb-6">
												<div className="flex items-center">
													<InformationCircleIcon className="w-6 h-6 fill-sky-600" />
													<div className="flex-1 ml-4 mr-8">
														<span className="text-gray-500 dark:text-zinc-500 text-justify text-sm">
															{loc("Detail.PermissionsTabMainTips", { role: userRole.name })}
														</span>
													</div>
												</div>
												<a href={`${baseUrl}/roles/${userRole._id}`} target="_blank" rel="noreferrer" className="flex items-center justify-center text-xs font-medium leading-none text-gray-900 bg-white rounded border border-gray-400 focus:outline-none hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-gray-300 dark:focus:ring-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-600 dark:hover:text-white dark:hover:bg-zinc-700 min-w-[6rem] py-2 pl-4 pr-5">
													<span className="text-inherit pt-0.5">{loc("Detail.GoToTheRole", { role: userRole.name })}</span>
												</a>
											</div>

											<UbacManagementView userOrApplication={user} role={userRole} session={props.session} onUserOrApplicationChange={onUbacDefinitionsChange} />
										</div>:
										<></>}
									</div>
								</Tab.Panel>

								<Tab.Panel className={"h-full overflow-y-scroll py-8 " + (isBannerShowing ? "pt-[14rem]" : "pt-0")}>
									<div className="max-w-7xl 4xl:max-w-8xl mx-auto">
										<div className="flex flex-shrink justify-between items-center bg-gray-50 dark:bg-zinc-900/[0.5] border border-dashed border-gray-400 dark:border-zinc-700 rounded-lg px-6 py-4 mb-6">
											<div className="flex items-center">
												<InformationCircleIcon className="w-6 h-6 fill-sky-600" />
												<div className="flex-1 ml-4 mr-8">
													<span className="text-gray-500 dark:text-zinc-500 text-justify text-sm">
														{loc("Detail.SessionsTabMainTips", { tokenCleanerJobSchedulePeriod: `${toTimeSpan(props.membership.expires_in * 1000)?.totalHours} ${gloc("Time.Hour").toLowerCase()}` })}
													</span>
												</div>
											</div>
										</div>

										<UserSessions session={props.session} user={user} />
									</div>
								</Tab.Panel>
							</Tab.Panels>
						</div>
					</Tab.Group>
					
					<ChangePasswordModal user={user} session={props.session} visibility={changePasswordModalVisibility} onConfirm={onChangePasswordConfirm} onCancel={onChangePasswordCancel} />

					<SafeDeleteModal
						title={loc('DeleteUser')}
						itemId={props.model?._id || ""}
						resourceName={`${props.model?.firstname} ${props.model?.lastname}` || "-"}
						resourceCollection={"users"}
						resourceTypeName={loc("User")}
						resourceTypeNameDeclarativeSuffix={loc("UserDeclarativeSuffix")}
						visibility={deleteModalVisibility} 
						session={props.session}
						onConfirm={handleUserDeleteConfirm} 
						onCancel={handleUserDeleteCancel}>
					</SafeDeleteModal>

					<RouteLeavingGuard 
						hasUnsavedChanges={hasUnsavedChanges} 
						title={gloc("Messages.UnsavedChanges")} 
						message={gloc("Messages.ThereAreUnsavedChanges")} 
						question={gloc("Messages.AreYouSureYouWantToContinue")}
						session={props.session} />
				</div>

				<BottomPanel title={gloc("Validations.ValidationErrors")} isVisible={errorsPanelVisibility} onCloseRequest={openCloseErrorsPanel} scrollable={true}>
					<BottomPanel.Content>
						{validationResults ?
						<Anchor getContainer={() => overviewPanelScrollableArea.current} showInkInFixed={true} affix={true}>
							<StaticTable 
								data={validationResults.filter(x => !x.isValid)} 
								columns={[
									{ 
										header: gloc("Validations.FieldName"), 
										field: "fieldInfo", 
										converter: (x) => { return x.displayName },
										className: "w-96" 
									},
									{ 
										header: gloc("Validations.Description"), 
										field: "fieldInfo", 
										converter: (x) => { return x.description },
										className: "w-96" 
									},
									{ 
										header: gloc("Validations.FieldType"), 
										field: "fieldInfo", 
										converter: (x) => { return x.type },
										className: "w-32" 
									},
									{ 
										header: gloc("Validations.ErrorMessage"), 
										field: "", 
										converter: (x) => { return x.customErrorMessage ?? (x.messageParameters ? gloc(`Validations.${x.errorCode}`, x.messageParameters) : gloc(`Validations.${x.errorCode}`)) } 
									},
									{ 
										header: gloc("Validations.Required"), 
										field: "fieldInfo", 
										converter: (x) => { return x.isRequired ? gloc("Validations.Yes") : gloc("Validations.No") },
										className: "w-32" 
									},
									{ 
										header: gloc("Validations.Hidden"), 
										field: "fieldInfo", 
										converter: (x) => { return x.isHidden ? gloc("Validations.Yes") : gloc("Validations.No") },
										className: "w-32" 
									},
									{ 
										header: gloc("Validations.Readonly"), 
										field: "fieldInfo", 
										converter: (x) => { return x.isReadonly ? gloc("Validations.Yes") : gloc("Validations.No") },
										className: "w-32" 
									},
									{ 
										header: "Guid", 
										field: "fieldInfo", 
										converter: (x) => { return x.guid },
										className: "w-96" 
									},
									{ 
										header: "", 
										field: "", 
										converter: (x) => { return (<a href={"#" + x.fieldInfo.guid}><div className="px-4"><ArrowCircleUpIcon className="w-5 h-5 fill-orange-500 hover:fill-orange-600" /></div></a>) },
										className: "w-16" 
									}
								]} 
								rowKey={(item, rowIndex) => `${item.fieldInfo.name}_${item.errorCode}_${rowIndex}`}
							/>
						</Anchor> :
						<></>}
					</BottomPanel.Content>
				</BottomPanel>

				<DiffViewerPanel originalContent={initialData} changedContent={user} isVisible={diffViewerVisibility} onCloseRequest={openCloseDiffViewerPanel} />
			</PageWrapper.Content>
		</PageWrapper>
	)
}

export const getServerSideProps: GetServerSideProps<UserDetailProps & PageProps> = async (context) => {
	let user: User | undefined
	let roles: Role[] | undefined
	let membership: Membership | undefined
	let userType: UserType | undefined
	let otherUserTypes: UserType[] | undefined
	let notFound: boolean = false
	
	const userId: string | null = exportIdFromContext(context)
	const session = getValidatedServerSession(context.req, context.res)
	if (userId) {
		const bearerToken = BearerToken.fromSession(session)
		const userService = Container.get(UserService);
		const roleService = Container.get(RoleService);
		const membershipService = Container.get(MembershipService);

		const getUserResponse = await userService.getUserAsync(userId, bearerToken)
		if (getUserResponse.IsSuccess) {
			user = getUserResponse.Data as User

			const getRolesResponse = await roleService.getRolesAsync(bearerToken)
			if (getRolesResponse.IsSuccess) {
				const paginatedRoles = getRolesResponse.Data as PaginatedResponse<Role>
				roles = paginatedRoles.items
			}

			const getMembershipResponse = await membershipService.getMembershipAsync(user.membership_id, bearerToken)
			if (getMembershipResponse.IsSuccess) {
				membership = getMembershipResponse.Data as Membership
			}
			else {
				notFound = true
			}

			if (user) {
				const userTypeService = Container.get(UserTypeService);
				const getUserTypesResponse = await userTypeService.getAllUserTypesAsync(bearerToken)
				if (getUserTypesResponse.IsSuccess) {
					const userTypesResult = getUserTypesResponse.Data as PaginatedResponse<UserType>
					userType = userTypesResult.items.find(x => x.slug === user?.user_type)
					otherUserTypes = userTypesResult.items.filter(x => x.slug !== user?.user_type)

					if (!userType) {
						notFound = true
					}
				}
				else {
					
				}
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

	const props: UserDetailProps & PageProps = {
		model: user ?? {} as User,
		roles: roles,
		membership: membership ?? {} as Membership,
		userType: userType ?? {} as UserType,
		otherUserTypes: otherUserTypes || [],
		session
	}

	return {
		props: props,
		notFound: notFound,
		redirect: await checkAuthorization(session, context.resolvedUrl) || ""
	}
};