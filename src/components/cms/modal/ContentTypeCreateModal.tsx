import React, { Fragment, useState } from "react"
import SchemaProperties from "../SchemaProperties"
import ContentTypeCreateModalHeader from "./ContentTypeCreateModalHeader"
import RelativePanel from "../../layouts/panels/RelativePanel"
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'
import { Modal, Checkbox, Tooltip } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { Tab } from "@headlessui/react"
import { ExclamationCircleIcon } from '@heroicons/react/solid'
import { Styles } from "../../Styles"
import { Session } from "../../../models/auth/Session"
import { ContentType, createNewContentTypeInstance } from "../../../models/schema/ContentType"
import { FieldInfo } from "../../../models/schema/FieldInfo"
import { Slugifier } from "../../../helpers/Slugifier"
import { isNumber } from "../../../helpers/StringHelper"
import { ValidationState } from "../../../models/ValidationState"
import { ValidationRules } from "../../../schema/validation/ValidationRules"
import { Guid } from "../../../helpers/Guid"
import { useTranslations } from 'next-intl'

type ContentTypeCreateModalProps = {
	title: string
	contentTypes: ContentType[]
	visibility: boolean | undefined
	session: Session
	defaultBaseType?: string
	isLocalizable?: boolean
	onConfirm(contentType: ContentType): void
	onCancel(): void
};

const ContentTypeCreateModal = (props: ContentTypeCreateModalProps) => {
	const [contentType, setContentType] = useState<ContentType>(createNewContentTypeInstance(props.defaultBaseType ? props.defaultBaseType : props.contentTypes[0]?.slug));
	const [selectedBaseType, setSelectedBaseType] = useState<ContentType>();
	const [validationResults, setValidationResults] = useState<ValidationState[]>([]);
	const [isSlugSelfModifiedEver, setIsSlugSelfModifiedEver] = useState<boolean>(false);
	const [selectedTab, setSelectedTab] = useState<number>();

	const gloc = useTranslations()
	const loc = useTranslations('Cms.ContentTypes')
	const vloc = useTranslations('Validations')

	React.useEffect(() => {
		const defaultBaseType = props.defaultBaseType ? props.defaultBaseType : props.contentTypes[0]?.slug
		const baseContentType = props.contentTypes.find(x => x.slug === defaultBaseType)
		if (baseContentType) {
			setContentType(values => ({ ...values, ["baseType"]: defaultBaseType, ["properties"]: baseContentType.properties }))
		}
		
		onFieldValidationStateChange(validateAll(["name", "slug", "baseType", "isAbstract", "isSealed"], contentType))
	}, [props]); // eslint-disable-line react-hooks/exhaustive-deps

	React.useEffect(() => {
		setSelectedBaseType(props.contentTypes.find(x => x.slug === contentType.baseType))
	}, [props, contentType]); // eslint-disable-line react-hooks/exhaustive-deps

	const handleSave = () => {
		if (props.onConfirm) {
			props.onConfirm(contentType)
		}

		reset()
	}

	const handleCancel = () => {
		if (props.onCancel) {
			props.onCancel()
		}

		reset()
	}

	const renderCancelButton = () => {
		return (<button key="cancelButton" type="button" onClick={handleCancel} className={Styles.button.warning + "py-1.5 px-8 ml-4"}>
			{gloc('Actions.Cancel')}
		</button>)
	}

	const renderSaveButton = () => {
		const isValid = !validationResults?.some(x => !x.isValid)

		if (isValid) {
			return (<button key="saveButton" type="button" onClick={handleSave} className={Styles.button.success + "py-1.5 px-7 ml-4"}>
				{gloc('Actions.Create')}
			</button>)
		}
		else if (validationResults) {
			return (<Tooltip key="saveButton" title={validationResults.find(x => !x.isValid && x.errorMessage)?.errorMessage} placement="top" overlayClassName="z-1000">
				<button type="button" className={Styles.button.disabledSuccess + "py-1.5 px-7 ml-4"} disabled>
					{gloc('Actions.Create')}
				</button>
			</Tooltip>)
		}
		else {
			return (<button key="saveButton" type="button" className={Styles.button.disabledSuccess + "py-1.5 px-7 ml-4"} disabled>
				{gloc('Actions.Create')}
			</button>)
		}
	}

	const onFieldValidationStateChange = (results: ValidationState[]) => {
		const validationResultsCopy: ValidationState[] = validationResults.concat([])
		for (let validationResult of results) {
			const index = validationResultsCopy.findIndex(x => x.rule === validationResult.rule)
			if (index >= 0) {
				validationResultsCopy[index] = {
					rule: validationResult.rule,
					isValid: validationResult.isValid,
					errorMessage: validationResult.errorMessage
				}
			}
			else {
				validationResultsCopy.push({
					rule: validationResult.rule,
					isValid: validationResult.isValid,
					errorMessage: validationResult.errorMessage
				})
			}
		}

		setValidationResults(validationResultsCopy)
	}

	const onSlugChanged = (oldSlug: string, newSlug: string) => {
		let anyChanged = false
		const properties = contentType.properties?.concat([])
		for (let fieldInfo of properties) {
			if (fieldInfo.declaringType === oldSlug) {
				fieldInfo.declaringType = newSlug
				anyChanged = true
			}
		}

		if (anyChanged) {
			setContentType(values => ({ ...values, ["properties"]: properties }))
		}
	}

	const validate = (fieldName: string, value: string | boolean): ValidationState[] => {
		const validationResults: ValidationState[] = []

		if (typeof value === "string") {
			if (fieldName === "name") {
				validationResults.push({
					isValid: !(!value || value.trim() === ""),
					errorMessage: vloc(ValidationRules.ContentTypeRules.NameRequired),
					rule: ValidationRules.ContentTypeRules.NameRequired
				})

				validationResults.push({
					isValid: !props.contentTypes.some(x => x.name === value && x._id !== contentType._id),
					errorMessage: vloc(ValidationRules.ContentTypeRules.NameAlreadyExist),
					rule: ValidationRules.ContentTypeRules.NameAlreadyExist
				})
			}
			
			if (fieldName === "slug") {
				validationResults.push({
					isValid: !(!value || value.trim() === ""),
					errorMessage: vloc(ValidationRules.ContentTypeRules.SlugRequired),
					rule: ValidationRules.ContentTypeRules.SlugRequired
				})
				
				validationResults.push({
					isValid: !(isNumber(value[0])),
					errorMessage: vloc(ValidationRules.ContentTypeRules.SlugCannotStartWithNumber),
					rule: ValidationRules.ContentTypeRules.SlugCannotStartWithNumber
				})

				validationResults.push({
					isValid: !(value.includes(' ')),
					errorMessage: vloc(ValidationRules.ContentTypeRules.SlugCannotContainBlankSpace),
					rule: ValidationRules.ContentTypeRules.SlugCannotContainBlankSpace
				})

				validationResults.push({
					isValid: Slugifier.IsValid(value),
					errorMessage: vloc(ValidationRules.ContentTypeRules.SlugCannotContainSpecialCharacter),
					rule: ValidationRules.ContentTypeRules.SlugCannotContainSpecialCharacter
				})

				validationResults.push({
					isValid: !props.contentTypes.some(x => x.slug === value && x._id !== contentType._id),
					errorMessage: vloc(ValidationRules.ContentTypeRules.SlugAlreadyExist),
					rule: ValidationRules.ContentTypeRules.SlugAlreadyExist
				})
			}

			if (fieldName === "baseType") {
				validationResults.push({
					isValid: !(!value || value.trim() === ""),
					errorMessage: vloc(ValidationRules.ContentTypeRules.BaseTypeRequired),
					rule: ValidationRules.ContentTypeRules.BaseTypeRequired
				})
			}
		}
		else if (typeof value === "boolean") {
			if (fieldName === "isAbstract") {
				validationResults.push({
					isValid: !value || !contentType.isSealed,
					errorMessage: vloc(ValidationRules.ContentTypeRules.SealedAndAbstractConflict),
					rule: ValidationRules.ContentTypeRules.SealedAndAbstractConflict
				})
			}

			if (fieldName === "isSealed") {
				validationResults.push({
					isValid: !value || !contentType.isAbstract,
					errorMessage: vloc(ValidationRules.ContentTypeRules.SealedAndAbstractConflict),
					rule: ValidationRules.ContentTypeRules.SealedAndAbstractConflict
				})
			}
		}

		return validationResults
	}

	const validateAll = (fieldNames: string[], contentType: any): ValidationState[] => {
		const validationResults: ValidationState[] = []

		for (let fieldName of fieldNames) {
			const value = contentType[fieldName]

			const results = validate(fieldName, value)
			for (let result of results) {
				validationResults.push(result)
			}
		}

		return validationResults
	}

	const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
		const name = e.currentTarget.name;
		const value = e.currentTarget.value;

		let validationResults: ValidationState[] = []

		let updatedContentType: ContentType | null = null
		if (contentType) {
			updatedContentType = { ...contentType, [name]: value }
			validationResults = validationResults.concat(validate(name, value))
		}

		if (name === "name" && !isSlugSelfModifiedEver && updatedContentType) {
			const oldSlug = updatedContentType.slug
			const slug = Slugifier.Slugify(value)
			updatedContentType = { ...updatedContentType, ["slug"]: slug }
			validationResults = validationResults.concat(validate("slug", slug))
			onSlugChanged(oldSlug, slug)
		}

		if (name === "slug") {
			setIsSlugSelfModifiedEver(value !== "")
			
			if (updatedContentType) {
				onSlugChanged(updatedContentType.slug, value)
			}
		}

		onFieldValidationStateChange(validationResults)

		if (updatedContentType) {
			setContentType(updatedContentType)
		}
	}

	const handleBaseTypeChange = (selectedContentTypeSlug: string) => {
		const baseContentType = props.contentTypes.find(x => x.slug === selectedContentTypeSlug)
		if (baseContentType) {
			const newProperties = contentType.properties?.filter(x => x.declaringType === contentType.slug) || []
			setContentType(values => ({ ...values, ["baseType"]: selectedContentTypeSlug, ["properties"]: newProperties.concat(baseContentType.properties || []) }))
			onFieldValidationStateChange(validate("baseType", selectedContentTypeSlug))
		}
	}

	const handleCheckBoxChange = (e: CheckboxChangeEvent) => {
		const name = e.target.name;
		if (name) {
			const value = e.target.checked;
			setContentType(values => ({ ...values, [name]: value }))
			onFieldValidationStateChange(validate(name, value))
		}
	}

	const onPropertiesChange = function(properties: FieldInfo[]) {
		let updatedContentType: ContentType | null = null
		if (contentType) {
			updatedContentType = { ...contentType, ["properties"]: properties }
		}

		if (updatedContentType) {
			setContentType(updatedContentType)
		}
	}
	
	const onOrderChange = function(orderedProperties: FieldInfo[]) {
		onPropertiesChange(orderedProperties)
	}

	const reset = () => {
		const newContentType = createNewContentTypeInstance(props.defaultBaseType ? props.defaultBaseType : props.contentTypes[0]?.slug)
		setContentType(newContentType)
		onFieldValidationStateChange(validateAll(["name", "slug", "baseType", "isAbstract", "isSealed"], newContentType))
		setSelectedTab(0)
		setIsSlugSelfModifiedEver(false)
	}

	return (
		<Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
			<Modal
				open={props.visibility}
				className="relative bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700"
				width={"72rem"}
				onOk={handleSave}
				onCancel={handleCancel}
				closable={false}
				maskClosable={false}
				destroyOnClose={true}
				footer={[renderCancelButton(), renderSaveButton()]}
				title={<ContentTypeCreateModalHeader title={props.title} isPropertiesTabEnabled={validationResults.every(x => x.isValid)} />}>
				<div className="flex flex-col bg-[#f7f7f7] dark:bg-zinc-900 border-y border-zinc-300 dark:border-zinc-700 max-h-[70vh] overflow-hidden h-full">
					<Tab.Panels className="flex flex-col flex-1 overflow-hidden h-full">
						<Tab.Panel>
							<div className="p-10 pb-14">
								<div className="grid grid-cols-3 gap-5 mb-6">
									<div>
										<label htmlFor="nameInput" className={Styles.label.default}>
											{loc('Name')}
											<span className={Styles.input.required}>*</span>
										</label>
										<input id="nameInput" type="text" name="name" autoComplete="off" className={Styles.input.default} value={contentType.name || ""} onChange={handleInputChange} />
									</div>

									<div>
										<label htmlFor="slugInput" className={Styles.label.default}>
											{loc('Slug')}
											<span className={Styles.input.required}>*</span>
										</label>
										<input id="slugInput" type="text" name="slug" autoComplete="off" className={Styles.input.default} value={contentType.slug || ""} onChange={handleInputChange} />
									</div>

									<div>
										<label htmlFor="baseTypeDropdown" className={Styles.label.default}>
											{loc('BaseType')}
											<span className={Styles.input.required}>*</span>
										</label>
										<Listbox name="baseTypeDropdown" value={selectedBaseType?.slug} onChange={handleBaseTypeChange}>
											<Listbox.Button className="relative w-full cursor-default rounded-md text-left shadow border border-gray-300 dark:border-zinc-700 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm py-2 pl-4 pr-10 h-[2.55rem]">
												<span className="block truncate text-gray-700 dark:text-zinc-300">{selectedBaseType?.name}</span>
												<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
													<SelectorIcon className="h-5 w-5 text-gray-400 dark:text-zinc-400" aria-hidden="true" />
												</span>
											</Listbox.Button>
											
											<Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
												<Listbox.Options className="absolute overflow-auto rounded-md bg-neutral-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm min-w-[20rem] mt-1 py-1 z-10">
													{props.contentTypes.filter(x => !x.isSealed).map((item, index) => (
														<Listbox.Option key={item.slug} value={item.slug} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-orange-400 dark:bg-orange-500/[0.75] text-amber-100 dark:text-zinc-100' : 'text-gray-900 dark:text-zinc-100'}`}>
															{({ active, selected }) => (
																<>
																	<span className={`flex items-center justify-between truncate ${selected ? 'font-medium' : 'font-normal'}`}>
																		<span>{item.name}</span>
																		{!item.baseType ? <span className={"text-xs pt-[3px] " + (active ? "text-gray-100 dark:text-zinc-300" : "text-gray-400 dark:text-zinc-400")}>{`(${gloc("Schema.OriginType")})`}</span> : <></>}
																	</span>
																	{selected ? (
																		<span className={"absolute inset-y-0 left-0 flex items-center pl-3 " + (active ? "text-orange-100 dark:text-orange-100" : "text-orange-700 dark:text-orange-600")}>
																			<CheckIcon className="h-5 w-5" aria-hidden="true" />
																		</span>
																	) : null}
																</>
															)}
														</Listbox.Option>
													))}
												</Listbox.Options>
											</Transition>
										</Listbox>
									</div>
								</div>

								<div className="mb-12">
									<label htmlFor="descriptionInput" className={Styles.label.default}>
										{loc('Description')}
									</label>
									<input id="descriptionInput" type="text" name="description" autoComplete="off" className={Styles.input.default} value={contentType.description || ""} onChange={handleInputChange} />
								</div>

								<div className="flex gap-8 pl-3">
									<div className="flex flex-col">
										<Checkbox name="isAbstract" className="text-gray-700 dark:text-zinc-300" checked={contentType.isAbstract} onChange={handleCheckBoxChange}>{loc('Detail.IsAbstract')}</Checkbox>
										<span className={Styles.text.helptext + " ml-6"}>{loc('Detail.IsAbstractTips')}</span>
									</div>
									<div className="flex flex-col">
										<Checkbox name="isSealed" className="text-gray-700 dark:text-zinc-300" checked={contentType.isSealed} onChange={handleCheckBoxChange}>{loc('Detail.IsSealed')}</Checkbox>
										<span className={Styles.text.helptext + " ml-6"}>{loc('Detail.IsSealedTips')}</span>
									</div>
									<div className="flex flex-col">
										<Checkbox name="allowAdditionalProperties" className="text-gray-700 dark:text-zinc-300" checked={contentType.allowAdditionalProperties} onChange={handleCheckBoxChange}>{loc('Detail.AllowAdditionalProperties')}</Checkbox>
										<span className={Styles.text.helptext + " ml-6"}>{loc('Detail.AllowAdditionalPropertiesTips')}</span>
									</div>
									{props.isLocalizable ?
									<div className="flex flex-col flex-1 min-w-[13rem]">
										<Checkbox name="isLocalizable" className="text-gray-700 dark:text-zinc-300" checked={contentType.isLocalizable} onChange={handleCheckBoxChange}>{loc('Detail.IsLocalized')}</Checkbox>
										<span className={Styles.text.helptext + " ml-6"}>{loc('Detail.IsLocalizedTips')}</span>
									</div>:
									<></>}
								</div>
							</div>
						</Tab.Panel>

						<Tab.Panel as={RelativePanel}>
							<SchemaProperties 
								guid={contentType._id || Guid.Generate()}
								ownerContentType={contentType}
								properties={contentType.properties} 
								onPropertiesChange={onPropertiesChange} 
								onOrderChange={onOrderChange} 
								session={props.session}
								ownerType={contentType.slug} 
								className="flex-1" 
								containerClass="px-9" 
								itemClassIdle=" bg-neutral-100 dark:bg-[#272727] hover:bg-neutral-50 hover:dark:bg-zinc-700/[0.3] border-slate-300 dark:border-[#303132] hover:border-orange-600 hover:dark:border-orange-500"
								headerClass="px-9 pt-7" />
						</Tab.Panel>
					</Tab.Panels>

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
		</Tab.Group>
	)
}

export default ContentTypeCreateModal;