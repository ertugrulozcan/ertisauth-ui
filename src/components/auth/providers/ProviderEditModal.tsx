import React, { Fragment, useState } from "react"
import Container from "typedi"
import ProviderLogo from "./ProviderLogo"
import { Modal, Tooltip, Switch, Space, Spin, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { Listbox, Transition } from '@headlessui/react'
import { ExclamationCircleIcon, InformationCircleIcon, SelectorIcon, XIcon } from "@heroicons/react/solid"
import { ErrorResponseModel } from "../../../models/ErrorResponseModel"
import { ValidationState } from "../../../models/ValidationState"
import { ValidationRules } from "../../../schema/validation/ValidationRules"
import { ProviderService } from "../../../services/auth/ProviderService"
import { Session } from "../../../models/auth/Session"
import { BearerToken } from "../../../models/auth/BearerToken"
import { Provider } from "../../../models/auth/providers/Provider"
import { Role } from "../../../models/auth/roles/Role"
import { UserType } from "../../../models/auth/user-types/UserType"
import { Styles } from "../../Styles"
import { DateTimeHelper, FormatType } from "../../../helpers/DateTimeHelper"
import { useLang } from '../../../localization/LocalizationProvider'
import { deepCopy, deepEqual } from "../../../helpers/ObjectHelper"
import { useTranslations } from 'next-intl'

const labelClass = "text-xs font-semibold leading-none text-gray-800 dark:text-gray-200 pl-1"

type ProviderEditModalProps = {
	visibility: boolean
	provider: Provider
	roles: Role[]
	userTypes: UserType[]
	session: Session
	onCancel?(): void
	onConfirm?(provider: Provider): void
}

const ProviderEditModal = (props: ProviderEditModalProps) => {
	const [initialData, setInitialData] = useState<Provider>(deepCopy(props.provider))
	const [provider, setProvider] = useState<Provider>(props.provider)
	const [validationResults, setValidationResults] = useState<ValidationState[]>([]);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>()
	const [saving, setSaving] = useState<boolean>(false)
	
	const gloc = useTranslations()
	const vloc = useTranslations("Validations.Providers")
	const loc = useTranslations("Auth.Providers")

	const selectedLocale = useLang()

	React.useEffect(() => {
		validate()
	}, [provider]) // eslint-disable-line react-hooks/exhaustive-deps

	const checkChanges = (changedProvider?: Provider) => {
		setHasUnsavedChanges(!deepEqual(initialData, changedProvider || provider))
	}

	const validate = () => {
		const validationResults: ValidationState[] = []

		validationResults.push({
			isValid: !provider.isActive || (provider.isActive && provider.defaultRole !== undefined && provider.defaultRole !== null && provider.defaultRole.trim() !== ""),
			errorMessage: vloc(ValidationRules.ProviderRules.DefaultRoleRequired),
			rule: ValidationRules.ProviderRules.DefaultRoleRequired
		})

		validationResults.push({
			isValid: !provider.isActive || (provider.isActive && provider.defaultUserType !== undefined && provider.defaultUserType !== null && provider.defaultUserType.trim() !== ""),
			errorMessage: vloc(ValidationRules.ProviderRules.DefaultUserTypeRequired),
			rule: ValidationRules.ProviderRules.DefaultUserTypeRequired
		})

		validationResults.push({
			isValid: !provider.isActive || (provider.isActive && provider.appClientId !== undefined && provider.appClientId !== null && provider.appClientId.trim() !== ""),
			errorMessage: vloc(ValidationRules.ProviderRules.AppClientIDRequired),
			rule: ValidationRules.ProviderRules.AppClientIDRequired
		})

		setValidationResults(validationResults)
	}

	const onStateChange = (checked: boolean) => {
		setProvider(values => ({ ...values, ["isActive"]: checked }))
		checkChanges({ ...provider, ["isActive"]: checked })
	}

	const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
		const name = e.currentTarget.name;
		const value = e.currentTarget.value;
		setProvider(values => ({ ...values, [name]: value }))
		checkChanges({ ...provider, [name]: value })
	}

	const onSelectedRoleChange = (selectedRoleName: string) => {
		const selectedRole = props.roles.find(x => x.name === selectedRoleName)
		if (selectedRole) {
			setProvider(values => ({ ...values, ["defaultRole"]: selectedRoleName }))
			checkChanges({ ...provider, ["defaultRole"]: selectedRoleName })	
		}
	}

	const onSelectedUserTypeChange = (selectedUserTypeSlug: string) => {
		const selectedUserType = props.userTypes.find(x => x.slug === selectedUserTypeSlug)
		if (selectedUserType) {
			setProvider(values => ({ ...values, ["defaultUserType"]: selectedUserTypeSlug }))
			checkChanges({ ...provider, ["defaultUserType"]: selectedUserTypeSlug })
		}
	}

	const saveChanges = async () => {
		const key = 'updatable'
		setSaving(true)
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

		const providerService = Container.get(ProviderService);
		const updateProviderResponse = await providerService.updateProviderAsync(provider, BearerToken.fromSession(props.session))
		if (updateProviderResponse.IsSuccess) {
			const updatedProvider = updateProviderResponse.Data as Provider
			setInitialData(deepCopy(updatedProvider))
			setProvider(updatedProvider)
			setHasUnsavedChanges(false)

			notification.success({
				key,
				message: gloc('Messages.Saved'),
				description: loc('Messages.SavedSuccessfully'),
				className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl',
			})

			setSaving(false)

			if (props.onConfirm) {
				props.onConfirm(updatedProvider)
			}
		}
		else {
			const error = updateProviderResponse.Data as ErrorResponseModel
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

			setSaving(false)
		}
	}

	const onCancel = () => {
		if (props.onCancel) {
			props.onCancel()
		}
	};

	const renderCancelButton = () => {
		return (<button key="cancelButton" type="button" onClick={() => onCancel()} className={(saving ? "inline-flex items-center justify-center font-medium text-[0.8rem] leading-none text-gray-200 dark:text-zinc-400 fill-gray-200 dark:fill-zinc-400 transition-colors duration-150 bg-amber-600/[0.65] dark:bg-amber-700/[0.6] border border-white dark:border-gray-900 rounded h-11 pt-3.5 pb-3 " : Styles.button.warning) + "min-w-[7rem] py-1.5 px-8 ml-4"}>
			{gloc('Actions.Cancel')}
		</button>)
	}

	const renderConfirmButton = () => {
		if (!hasUnsavedChanges || validationResults.some(x => !x.isValid)) {
			return (
				<button key="saveButton" type="button" className={Styles.button.disabledSuccess + "min-w-[7rem] py-1.5 px-7 ml-4"} disabled={true}>
					<span className="indicator-label">{gloc('Actions.Save')}</span>
				</button>
			)
		}
		else {
			return (
				<button key="saveButton" type="button" onClick={(e) => { saveChanges() }} className={(saving ? Styles.button.disabledSuccess : Styles.button.success) + "min-w-[7rem] py-1.5 px-7 ml-4"} disabled={saving}>
					{!saving && <span className="indicator-label">{gloc('Actions.Save')}</span>}
					{saving && (
						<span className="flex items-center indicator-progress">
							<svg className="motion-reduce:hidden animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path className="fill-white opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							<span className="ml-3">{gloc('Messages.PleaseWait')}...</span>
						</span>
					)}
				</button>
			)
		}
	}
	
	return (
		<Modal
			open={props.visibility}
			className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700 rounded-lg overflow-hidden"
			onCancel={onCancel}
			width="56rem"
			closable={false}
			maskClosable={false}
			destroyOnClose={true}
			footer={[renderCancelButton(), renderConfirmButton()]}
			title={<div className="flex items-center justify-between w-full pt-2.5 pb-2 pl-6 pr-2.5">
				<div className="flex items-center gap-3.5 mr-4">
					<ProviderLogo provider={provider.name} isActive={provider.isActive} showDefaultLogo={true} />

					<span className="text-slate-600 dark:text-zinc-300">{provider.name}</span>
				</div>

				<div className="flex items-center">
					<div className="flex items-center pb-0.5">
						<span className="text-gray-700 dark:text-zinc-300 text-[0.8rem] mr-3.5">{provider.isActive ? loc("Enable") : loc("Disable")}</span>
						<Switch checked={provider.isActive} onChange={onStateChange} className={provider.isActive ? "bg-green-500" : "bg-red-500 dark:bg-red-600"} />
					</div>

					<Tooltip title={gloc("Actions.Close")} placement="bottom">
						<button type="button" onClick={onCancel} className="inline-flex justify-center text-gray-700 dark:text-zinc-400 hover:text-slate-500 hover:dark:text-zinc-300 bg-transparent dark:bg-transparent border border-transparent dark:border-transparent hover:bg-white hover:border-gray-400 hover:dark:bg-zinc-800 active:bg-white active:dark:bg-zinc-900 hover:dark:border-zinc-700 rounded-md focus:outline-none focus-visible:outline-indigo-500 disabled-inline-flex px-1.5 py-1.5 ml-5">
							<XIcon className="w-5 h-5 mb-px mr-px" />
						</button>
					</Tooltip>
				</div>
			</div>}>
			<div className="border-y border-borderline dark:border-borderlinedark max-h-[36rem]">
				<div className="flex flex-col h-full w-full">
					<div className="flex items-center justify-between bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-500 text-[0.7rem] border-b border-dashed border-borderline dark:border-borderlinedark gap-0.5 px-6 py-2">
						<div className="flex items-center gap-1.5">
							<span className="text-gray-600 dark:text-zinc-400">Id :</span>
							<span>{provider._id}</span>
						</div>
						
						<div className="flex items-center gap-1.5">
							<span className="text-gray-600 dark:text-zinc-400">{gloc("Sys.Created")} :</span>
							<span>{DateTimeHelper.format(provider.sys.created_at, FormatType.HrmDateTime, selectedLocale.languageCode)}</span>
							<span className="bg-gray-600 dark:bg-zinc-400 rounded-full w-1.5 h-1.5"></span>
							<span>{provider.sys.created_by}</span>
						</div>
						
						{provider.sys.modified_at || provider.sys.modified_by ?
						<div className="flex items-center gap-1.5">
							<span className="text-gray-600 dark:text-zinc-400">{gloc("Sys.LastModified")} :</span>
							<span>{DateTimeHelper.format(provider.sys.modified_at, FormatType.HrmDateTime, selectedLocale.languageCode)}</span>
							<span className="bg-gray-600 dark:bg-zinc-400 rounded-full w-1.5 h-1.5"></span>
							<span>{provider.sys.modified_by}</span>
						</div> :
						<></>}
					</div>

					<div className="flex flex-col flex-1 h-full w-full gap-6 px-9 pt-8 pb-12">
						<div className="grid grid-cols-2 gap-5">
							<div>
								<label className={labelClass}>
									{loc("DefaultRole")}
									<span className={Styles.input.required}>*</span>
								</label>
								<Listbox value={provider.defaultRole} onChange={onSelectedRoleChange}>
									<Listbox.Button className={`relative w-full cursor-default rounded text-left border border-gray-300 dark:border-zinc-700 hover:border-indigo-500 hover:dark:border-indigo-700 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm min-h-[2.4rem] py-2 pl-4 pr-10 mt-1`}>
										<div className="flex items-center">
											<span className="block truncate text-gray-700 dark:text-zinc-300">{provider.defaultRole}</span>
										</div>
										<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
											<SelectorIcon className="h-5 w-5 text-gray-400 dark:text-zinc-400" aria-hidden="true" />
										</span>
									</Listbox.Button>
									<Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
										<Listbox.Options className="absolute overflow-auto overflow-y-scroll max-h-80 rounded-md bg-neutral-50 dark:bg-[#232425] border border-gray-300 dark:border-zinc-700 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm min-w-[16rem] mt-1 py-1 z-10">
											{props.roles.map((role, index) => (
												<Listbox.Option 
													key={`${role._id}`} 
													value={role.name} 
													className={({ selected, active }) => `relative ${selected ? 'bg-orange-400 dark:bg-amber-600' : (active ? 'bg-gray-100 dark:bg-zinc-700' : '')} cursor-default select-none border-b border-dotted border-borderline dark:border-borderlinedark last:border-0 py-3 px-7`}>
													{({ selected, active }: any) => (
														<div className="flex flex-col">
															<span className={`text-xs leading-none font-medium ${selected ? 'text-neutral-50 dark:text-neutral-100' : (active ? 'dark:text-neutral-200' : 'dark:text-neutral-300')}`}>
																{role.name}
															</span>
														</div>
													)}
												</Listbox.Option>
											))}
										</Listbox.Options>
									</Transition>
								</Listbox>
								<div className="flex items-center mt-1.5">
									<InformationCircleIcon className="self-start w-4 h-4 fill-sky-600" />
									<span className="flex-1 text-gray-500 dark:text-zinc-500 text-xs leading-snug ml-1.5">
										{loc("DefaultRoleTips")}
									</span>
								</div>
							</div>

							<div>
								<label className={labelClass}>
									{loc("DefaultUserType")}
									<span className={Styles.input.required}>*</span>
								</label>
								<Listbox value={provider.defaultUserType} onChange={onSelectedUserTypeChange}>
									<Listbox.Button className={`relative w-full cursor-default rounded text-left border border-gray-300 dark:border-zinc-700 hover:border-indigo-500 hover:dark:border-indigo-700 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm min-h-[2.4rem] py-2 pl-4 pr-10 mt-1`}>
										<div className="flex items-center">
											<span className="block truncate text-gray-700 dark:text-zinc-300">{props.userTypes.find(x => x.slug === provider.defaultUserType)?.name || provider.defaultUserType}</span>
										</div>
										<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
											<SelectorIcon className="h-5 w-5 text-gray-400 dark:text-zinc-400" aria-hidden="true" />
										</span>
									</Listbox.Button>
									<Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
										<Listbox.Options className="absolute overflow-auto overflow-y-scroll max-h-80 rounded-md bg-neutral-50 dark:bg-[#232425] border border-gray-300 dark:border-zinc-700 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm min-w-[16rem] mt-1 py-1 z-10">
											{props.userTypes.map((userType, index) => (
												<Listbox.Option 
													key={`${userType._id}`} 
													value={userType.slug} 
													className={({ selected, active }) => `relative ${selected ? 'bg-orange-400 dark:bg-amber-600' : (active ? 'bg-gray-100 dark:bg-zinc-700' : '')} cursor-default select-none border-b border-dotted border-borderline dark:border-borderlinedark last:border-0 py-3 px-7`}>
													{({ selected, active }: any) => (
														<div className="flex flex-col">
															<span className={`text-xs leading-none font-medium ${selected ? 'text-neutral-50 dark:text-neutral-100' : (active ? 'dark:text-neutral-200' : 'dark:text-neutral-300')}`}>
																{userType.name}
															</span>
														</div>
													)}
												</Listbox.Option>
											))}
										</Listbox.Options>
									</Transition>
								</Listbox>
								<div className="flex items-center mt-1.5">
									<InformationCircleIcon className="self-start w-4 h-4 fill-sky-600" />
									<span className="flex-1 text-gray-500 dark:text-zinc-500 text-xs leading-snug ml-1.5">
										{loc("DefaultUserTypeTips")}
									</span>
								</div>
							</div>
						</div>

						<div>
							<label className={labelClass}>
								{loc("Description")}
							</label>
							<input type="text" name="description" autoComplete="off" className={Styles.input.default} value={provider.description || ""} onChange={handleInputChange} />
						</div>

						<div>
							<label className={labelClass}>
								{
									{
										"Facebook": "Facebook App ID",
										"Google": "Google Client ID",
										"Microsoft": "Microsoft Client ID"
									} [provider.name] || "App ID"
								}
								<span className={Styles.input.required}>*</span>
							</label>
							<input type="text" name="appClientId" autoComplete="off" className={Styles.input.default} value={provider.appClientId || ""} onChange={handleInputChange} />
							<div className="flex items-center mt-1.5">
								<InformationCircleIcon className="self-start w-4 h-4 fill-sky-600" />
								{
									{
										"Facebook": 
										<a href="https://developers.facebook.com/docs/facebook-login/" target="_blank" rel="noreferrer" className="flex-1 text-gray-500 dark:text-zinc-500 text-xs leading-snug ml-1.5">
											https://developers.facebook.com/docs/facebook-login/
										</a>,
										"Google": 
										<a href="https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid" rel="noreferrer" target="_blank" className="flex-1 text-gray-500 dark:text-zinc-500 text-xs leading-snug ml-1.5">
											https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
										</a>,
										"Microsoft": 
										<a href="https://learn.microsoft.com/en-us/azure/active-directory/develop/" target="_blank" rel="noreferrer" className="flex-1 text-gray-500 dark:text-zinc-500 text-xs leading-snug ml-1.5">
											https://learn.microsoft.com/en-us/azure/active-directory/develop/
										</a>
									} [provider.name] || "Application/Client ID"
								}
							</div>
						</div>

						{provider.name === "Microsoft" ?
						<div>
							<label className={labelClass}>
								Microsoft Tenant Id
							</label>
							<input type="text" name="tenantId" autoComplete="off" className={Styles.input.default} value={provider.tenantId || ""} onChange={handleInputChange} />
							<div className="flex items-center mt-1.5">
								<InformationCircleIcon className="self-start w-4 h-4 fill-sky-600" />
								<a href="https://learn.microsoft.com/en-us/azure/active-directory/develop/msal-client-application-configuration" target="_blank" rel="noreferrer" className="flex-1 text-gray-500 dark:text-zinc-500 text-xs leading-snug ml-1.5">
									https://learn.microsoft.com/en-us/azure/active-directory/develop/msal-client-application-configuration
								</a>
							</div>
						</div> :
						<></>}
					</div>
				</div>

				<div className="absolute w-min max-w-[35rem] h-12 bottom-1.5 left-1">
					{validationResults.some(x => !x.isValid) ?
						<span className="flex items-center px-6 py-2.5">
							<ExclamationCircleIcon className="w-5 h-5 text-red-600" />
							<span className="text-xs text-red-500 whitespace-nowrap ml-1.5 mt-1">{validationResults.find(x => !x.isValid && x.errorMessage)?.errorMessage}</span>
						</span>:
					<></>}
				</div>
			</div>
		</Modal>
	)
}

export default ProviderEditModal;