import React, { useState, Fragment } from 'react'
import SchemaProperties from '../../../components/cms/SchemaProperties'
import DiffViewerPanel from '../../../components/utils/DiffViewerPanel'
import RouteLeavingGuard from '../../../components/modals/RouteLeavingGuard'
import SysInfoPanel from '../../../components/layouts/panels/SysInfoPanel'
import Select from "../../../components/general/Select"
import { ErtisAuthConfiguration } from '../../../configuration/ErtisAuthConfiguration'
import { PageProps } from '../../../models/PageProps'
import { getValidatedServerSession } from '../../../models/auth/Session'
import { checkAuthorization } from '../../../services/AuthorizationHandler'
import { BearerToken } from '../../../models/auth/BearerToken'
import { GetServerSideProps } from "next"
import { ContentSave } from '../../../components/icons/google/MaterialIcons'
import { EyeIcon } from '@heroicons/react/outline'
import { Container } from 'typedi'
import { UserType } from "../../../models/auth/user-types/UserType"
import { UserTypeService } from "../../../services/auth/UserTypeService"
import { PageWrapper } from "../../../components/layouts/PageWrapper"
import { FieldInfo } from '../../../models/schema/FieldInfo'
import { LoadingOutlined } from '@ant-design/icons'
import { Styles } from '../../../components/Styles'
import { Checkbox, notification, Space, Spin, Tooltip } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { ErrorResponseModel } from '../../../models/ErrorResponseModel'
import { PaginatedResponse } from '../../../models/PaginatedResponse'
import { FooterToolboxProvider } from '../../../components/layouts/footer/FooterToolboxProvider'
import { deepEqual, deepCopy } from '../../../helpers/ObjectHelper'
import { exportIdFromContext } from '../../../helpers/RouteHelper'
import { useTranslations } from 'next-intl'

export type UserTypeDetailProps = {
	model: UserType,
	userTypes: UserType[]
};

const getReadonlyProperties = (model: UserType): FieldInfo[] | undefined => {
	return model.properties?.filter(x => x.isReadonly)
}

const getUnreadonlyProperties = (model: UserType): FieldInfo[] | undefined => {
	return model.properties?.filter(x => !x.isReadonly)
}

export default function UserTypeDetail(props: UserTypeDetailProps & PageProps) {
	const [initialData, setInitialData] = useState<UserType>(deepCopy(props.model));
	const [userType, setUserType] = useState<UserType>(props.model);
	const [properties, setProperties] = useState<FieldInfo[]>(props.model.properties?.filter(x => x) ?? []);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>();
	const [diffViewerVisibility, setDiffViewerVisibility] = useState<boolean>(false);

	const gloc = useTranslations()
	const loc = useTranslations('Auth.UserTypes')
	
	const checkChanges = (changedUserType?: UserType) => {
		setHasUnsavedChanges(!deepEqual(initialData, changedUserType || userType))
	}

	const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
		const name = e.currentTarget.name;
		const value = e.currentTarget.value;
		setUserType(values => ({ ...values, [name]: value }))
		checkChanges({ ...userType, [name]: value })
	}

	const handleBaseTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setUserType(values => ({ ...values, ["baseType"]: e.target.value }))
		checkChanges({ ...userType, ["baseType"]: e.target.value })
	}

	const handleCheckBoxChange = (e: CheckboxChangeEvent) => {
		const name = e.target.name;
		if (name) {
			const value = e.target.checked;
			setUserType(values => ({ ...values, [name]: value }))
			checkChanges({ ...userType, [name]: value })
		}
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

		const userTypeService = Container.get(UserTypeService)
		const updateResponse = await userTypeService.updateUserTypeAsync(userType, BearerToken.fromSession(props.session))
		if (updateResponse.IsSuccess) {
			const getUserTypeResponse = await userTypeService.getUserTypeAsync(userType._id, BearerToken.fromSession(props.session))
			if (getUserTypeResponse.IsSuccess) {
				const updatedUserType = getUserTypeResponse.Data as UserType
				setInitialData(deepCopy(updatedUserType))
				setUserType(updatedUserType)
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

	const onPropertiesChange = function(properties: FieldInfo[]) {
		setProperties(properties)

		let updatedUserType: UserType | null = null
		if (userType) {
			updatedUserType = { ...userType, ["properties"]: properties }
		}

		if (updatedUserType) {
			setUserType(updatedUserType)
			checkChanges(updatedUserType)
		}
	}
	
	const onOrderChange = function(orderedProperties: FieldInfo[]) {
		onPropertiesChange(orderedProperties)
	}

	const openCloseDiffViewerPanel = () => {
		setDiffViewerVisibility(!diffViewerVisibility)
	}

	const footerToolboxProvider = Container.get(FooterToolboxProvider)
	if (footerToolboxProvider) {
		footerToolboxProvider.setToolbox(
			<Fragment>
				<Tooltip title="Diff Viewer" placement="top">
					<button type="button" onClick={openCloseDiffViewerPanel} className={Styles.button.footer}>
						<EyeIcon className="w-5 h-5" strokeWidth={1} />
					</button>
				</Tooltip>
			</Fragment>
		)
	}

	const breadcrumb = [{title: gloc('Breadcrumb.Home'), link: '/'}, {title: gloc('Breadcrumb.Auth')}, {title: loc('UserTypes'), link: '/auth/user-types'}]
	return (
		<PageWrapper title={userType.name} breadcrumb={breadcrumb} session={props.session}>
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
					<div className="flex flex-col w-full">
						<div className="pt-8 px-10">
							<div className="grid grid-cols-3 gap-5 mb-4">
								<div>
									<label htmlFor="nameInput" className={Styles.label.default}>
										{loc('Name')}
										<span className={Styles.input.required}>*</span>
									</label>
									<input id="nameInput" type="text" name="name" autoComplete="off" className={Styles.input.default} value={userType.name || ""} onChange={handleInputChange} />
								</div>

								<div>
									<label htmlFor="slugInput" className={Styles.label.default}>
										{loc('Slug')}
										<span className={Styles.input.required}>*</span>
									</label>
									<input id="slugInput" type="text" name="slug" autoComplete="off" className={Styles.input.default + Styles.input.disabled} defaultValue={userType.slug || ""} readOnly={true} />
								</div>

								<div>
									<label htmlFor="baseTypeDropdown" className={Styles.label.default}>
										{loc('BaseType')}
										<span className={Styles.input.required}>*</span>
									</label>
									<Select id="baseTypeDropdown" name="baseType" value={userType.baseType} onChange={handleBaseTypeChange}>
										{props.userTypes.filter(x => !x.isSealed).map(x => <option value={x.slug} key={x.slug}>{x.name}</option>)}
									</Select>
								</div>
							</div>

							<div className="mb-6">
								<label htmlFor="descriptionInput" className={Styles.label.default}>
									{loc('Description')}
								</label>
								<input id="descriptionInput" type="text" name="description" autoComplete="off" className={Styles.input.default} value={userType.description || ""} onChange={handleInputChange} />
							</div>

							<div className="flex">
								<div className="flex flex-col mr-5 ml-2">
									<Checkbox name="isAbstract" className="text-gray-700 dark:text-zinc-300" checked={userType.isAbstract} onChange={handleCheckBoxChange}>{loc('Detail.IsAbstract')}</Checkbox>
									<span className={Styles.text.helptext + " ml-6"}>{loc('Detail.IsAbstractTips')}</span>
								</div>
								<div className="flex flex-col mr-5">
									<Checkbox name="isSealed" className="text-gray-700 dark:text-zinc-300" checked={userType.isSealed} onChange={handleCheckBoxChange}>{loc('Detail.IsSealed')}</Checkbox>
									<span className={Styles.text.helptext + " ml-6"}>{loc('Detail.IsSealedTips')}</span>
								</div>
								<div className="flex flex-col mr-5">
									<Checkbox name="allowAdditionalProperties" className="text-gray-700 dark:text-zinc-300" checked={userType.allowAdditionalProperties} onChange={handleCheckBoxChange}>{loc('Detail.AllowAdditionalProperties')}</Checkbox>
									<span className={Styles.text.helptext + " ml-6"}>{loc('Detail.AllowAdditionalPropertiesTips')}</span>
								</div>
							</div>
						</div>

						<SchemaProperties 
							guid={userType._id}
							properties={properties} 
							ownerContentType={userType}
							session={props.session}
							onPropertiesChange={onPropertiesChange} 
							onOrderChange={onOrderChange} 
							ownerType={userType.slug} 
							className="mt-5" 
							containerClass="px-10" 
							headerClass="pl-12 pr-14" />

						<RouteLeavingGuard 
							hasUnsavedChanges={hasUnsavedChanges} 
							title={gloc("Messages.UnsavedChanges")} 
							message={gloc("Messages.ThereAreUnsavedChanges")} 
							question={gloc("Messages.AreYouSureYouWantToContinue")}
							session={props.session} />
					</div>

					<div className="border-l border-borderline dark:border-borderlinedark p-7 min-w-[22.5%] max-w-[30%]">
						<div className="mb-5">
							<label className={Styles.label.default}>{loc('Detail.ID')}</label>
							<span className={Styles.text.subtext}>{userType._id}</span>
						</div>

						<SysInfoPanel sys={userType.sys} />
					</div>
				</div>

				<DiffViewerPanel originalContent={initialData} changedContent={userType} isVisible={diffViewerVisibility} onCloseRequest={openCloseDiffViewerPanel} />
			</PageWrapper.Content>
		</PageWrapper>
	)
}

export const getServerSideProps: GetServerSideProps<UserTypeDetailProps & PageProps> = async (context) => {
	let userType: UserType | undefined
	let userTypes: UserType[] = []
	let notFound: boolean = false
	
	const userTypeId: string | null = exportIdFromContext(context)
	const session = getValidatedServerSession(context.req, context.res)
	if (userTypeId) {
		const userTypeService = Container.get(UserTypeService);
		const getUserTypeResponse = await userTypeService.getUserTypeAsync(userTypeId, BearerToken.fromSession(session))
		if (getUserTypeResponse.IsSuccess) {
			userType = getUserTypeResponse.Data as UserType

			const getAllUserTypesResponse = await userTypeService.getAllUserTypesAsync(BearerToken.fromSession(session))
			if (getAllUserTypesResponse.IsSuccess) {
				const userTypesResult = getAllUserTypesResponse.Data as PaginatedResponse<UserType>
				userTypes = userTypesResult.items.filter(x => x.slug !== userType?.slug)
			}
		}
		else {
			notFound = true
		}
	}
	else {
		notFound = true
	}

	const props: UserTypeDetailProps & PageProps = {
		model: userType ?? {} as UserType,
		userTypes: userTypes,
		session
	}

	return {
		props: props,
		notFound: notFound,
		redirect: await checkAuthorization(session, context.resolvedUrl) || ""
	}
};