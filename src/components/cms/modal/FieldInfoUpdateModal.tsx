import React, { Fragment, useState } from "react"
import FieldInfoEditorModalHeader from "./FieldInfoEditorModalHeader"
import FieldInfoEditor, { FieldInfoEditorActions } from "./FieldInfoEditor"
import { Modal } from 'antd'
import { Tab } from "@headlessui/react"
import { ExclamationCircleIcon } from "@heroicons/react/solid"
import { Styles } from "../../Styles"
import { Session } from "../../../models/auth/Session"
import { FieldInfo } from "../../../models/schema/FieldInfo"
import { ContentType } from "../../../models/schema/ContentType"
import { FieldValidationResult } from "../../../schema/validation/FieldValidationResult"
import { validateAllFieldInfo } from "../../../schema/validation/FieldInfoEditorValidator"
import { useTranslations } from 'next-intl'

type FieldInfoUpdateModalProps = {
	title: string
	fieldInfo: FieldInfo | null
	ownerContentType: ContentType
	properties: FieldInfo[]
	visibility: boolean | undefined
	session: Session
	isIntertwined?: boolean
	onConfirm(fieldInfo: FieldInfo): void
	onCancel(): void
}

const FieldInfoUpdateModal = (props: FieldInfoUpdateModalProps) => {
	const [fieldInfo, setFieldInfo] = useState<FieldInfo | null>(props.fieldInfo);
	const [validationResults, setValidationResults] = useState<{ [key: string]: FieldValidationResult[] }>();
	const [selectedTab, setSelectedTab] = useState<number>(0);
	
	const gloc = useTranslations()

	React.useEffect(() => {
		setFieldInfo(props.fieldInfo)
		setValidationResults(undefined)
	}, [props])

	const onFieldInfoChange = (fieldInfo: FieldInfo) => {
		setValidationResults(validateAllFieldInfo(fieldInfo, props.properties))
		setFieldInfo(fieldInfo)
	}

	const isAllValid = (validationResults: { [key: string]: FieldValidationResult[] } | undefined): boolean => {
		if (validationResults) {
			for (let tab in validationResults) {
				if (validationResults[tab].some(x => !x.isValid)) {
					return false
				}
			}
		}

		return true
	}

	const getValidationErrorMessage = (validationResults: { [key: string]: FieldValidationResult[] } | undefined, selectedTabIndex: number): string | undefined => {
		if (validationResults) {
			let selectedTab: string | undefined
			switch (selectedTabIndex) {
				case 0:
					selectedTab = "options"
					break;
				case 1:
					selectedTab = "schema"
					break;
				case 2:
					selectedTab = "validation"
					break;
				case 3:
					selectedTab = "defaults"
					break;
			}

			if (selectedTab) {
				const validationResult = validationResults[selectedTab].find(x => !x.isValid)
				if (validationResult) {
					return validationResult.customErrorMessage ?? (validationResult.messageParameters ? gloc(`Validations.${validationResult.errorCode}`, validationResult.messageParameters) : gloc(`Validations.${validationResult.errorCode}`))
				}
			}

			for (let tab in validationResults) {
				const validationResult = validationResults[tab].find(x => !x.isValid)
				if (validationResult) {
					return validationResult.customErrorMessage ?? (validationResult.messageParameters ? gloc(`Validations.${validationResult.errorCode}`, validationResult.messageParameters) : gloc(`Validations.${validationResult.errorCode}`))
				}
			}
		}
	}

	const getInvalidTabs = (validationResults: { [key: string]: FieldValidationResult[] } | undefined) => {
		const invalidTabs: string[] = []
		if (validationResults) {
			for (let tab in validationResults) {
				if (validationResults[tab].some(x => !x.isValid)) {
					invalidTabs.push(tab)
				}
			}
		}

		return invalidTabs
	}

	const fieldInfoEditorActions: FieldInfoEditorActions = {}

	const handleSave = () => {
		if (fieldInfoEditorActions.onSave) {
			const savedFieldInfo = fieldInfoEditorActions.onSave()
			if (props.onConfirm && savedFieldInfo) {
				props.onConfirm(savedFieldInfo)
			}
		}

		setSelectedTab(0)
	}

	const handleCancel = () => {
		if (fieldInfoEditorActions.onCancel) {
			fieldInfoEditorActions.onCancel()
		}

		if (props.onCancel) {
			props.onCancel()
		}

		setSelectedTab(0)
	}

	const renderFooter = () => {
		const errorMessage = getValidationErrorMessage(validationResults, selectedTab)
		return (
			<div className="flex flex-1 items-center justify-between px-2">
				<div className="w-min max-w-[35rem] h-12">
					{errorMessage ?
					<span className="flex items-center px-1 py-2.5">
						<ExclamationCircleIcon className="w-5 h-5 text-red-600" />
						<span className="text-xs text-red-500 whitespace-nowrap ml-1.5 mt-1">{errorMessage}</span>
					</span>:
					<></>}
				</div>
				
				<div>
					<button key="cancelButton" type="button" onClick={handleCancel} className={Styles.button.warning + " min-w-[7rem] py-1.5 px-8 ml-4"}>
						{gloc('Actions.Cancel')}
					</button>
					{isAllValid(validationResults) ?
					<button key="saveButton" type="button" onClick={handleSave} className={Styles.button.success + " min-w-[7rem] py-1.5 px-7 ml-4"}>
						{gloc('Actions.Confirm')}
					</button>:
					<button key="saveButton" type="button" className={Styles.button.disabledSuccess + " min-w-[7rem] py-1.5 px-7 ml-4"} disabled>
						{gloc('Actions.Confirm')}
					</button>}
				</div>
			</div>
		)
	}

	return (
		<Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
			<Modal
				open={props.visibility}
				className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700"
				style={props.isIntertwined ? { top: "11rem" } : { top: "5rem" }}
				onOk={handleSave}
				onCancel={handleCancel}
				width={props.isIntertwined ? "60rem" : "56rem"}
				closable={false}
				maskClosable={false}
				destroyOnClose={true}
				footer={renderFooter()}
				title={<FieldInfoEditorModalHeader title={props.title} fieldInfo={fieldInfo} invalidTabs={getInvalidTabs(validationResults)} />}>
				<div className="border-y border-zinc-300 dark:border-zinc-700 max-h-[70vh] overflow-hidden overflow-y-scroll">
					<FieldInfoEditor 
						fieldInfo={fieldInfo!} 
						properties={props.properties}
						ownerContentType={props.ownerContentType}
						actions={fieldInfoEditorActions}
						session={props.session}
						onChange={onFieldInfoChange}
						mode="update" />
				</div>
			</Modal>
		</Tab.Group>
	);
}

export default FieldInfoUpdateModal;