import React, { useState, ReactNode } from "react"
import FieldInfoPicker from "../FieldInfoPicker"
import FieldInfoSummaryInfo from "../FieldInfoSummaryInfo"
import FieldInfoEditor, { FieldInfoEditorActions } from "./FieldInfoEditor"
import FieldInfoEditorModalHeader from "./FieldInfoEditorModalHeader"
import { Modal, Tooltip } from 'antd'
import { Tab } from "@headlessui/react"
import { ExclamationCircleIcon } from "@heroicons/react/solid"
import { Styles } from "../../Styles"
import { Session } from "../../../models/auth/Session"
import { FieldInfo } from "../../../models/schema/FieldInfo"
import { ContentType } from "../../../models/schema/ContentType"
import { FieldValidationResult } from "../../../schema/validation/FieldValidationResult"
import { validateAllFieldInfo } from "../../../schema/validation/FieldInfoEditorValidator"
import { useTranslations } from 'next-intl'

type FieldInfoCreateModalProps = {
	title: string
	properties: FieldInfo[]
	visibility: boolean | undefined
	ownerContentType: ContentType
	session: Session
	isIntertwined?: boolean
	onConfirm(fieldInfo: FieldInfo): void
	onCancel(): void
};

type Step = {
	title: string | ReactNode,
	content: ReactNode,
	width: string | number
};

const FIELD_TYPE_PICKER_STEP = 0
const FIELD_INFO_EDITOR_STEP = 1

const FieldInfoCreateModal = (props: FieldInfoCreateModalProps) => {
	const [selectedFieldInfo, setSelectedFieldInfo] = useState<FieldInfo | null>(null);
	const [validationResults, setValidationResults] = useState<{ [key: string]: FieldValidationResult[] }>();
	const [activeStep, setActiveStep] = useState<number>(0);
	const [selectedTab, setSelectedTab] = useState<number>(0);

	const gloc = useTranslations()
	const loc = useTranslations('Schema')

	const fieldInfoEditorActions: FieldInfoEditorActions = {}

	const handleFieldInfoChanged = (fieldInfo: FieldInfo | null) => {
		if (fieldInfo) {
			setValidationResults(validateAllFieldInfo(fieldInfo, props.properties))
		}
		
		setSelectedFieldInfo(fieldInfo)
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
					{getFooterButtons()}
				</div>
			</div>
		)
	}

	const getSteps = (): Step[] => {
		return [
			{
				title: <div className="px-6 py-3"><span className="text-[0.88rem] text-slate-600 dark:text-zinc-300">{loc('SelectFieldType')}</span></div>,
				content: <div className="flex justify-between overflow-hidden">
					<FieldInfoPicker onSelectedChanged={setSelectedFieldInfo} />
					<FieldInfoSummaryInfo fieldInfo={selectedFieldInfo} className="border-l dark:bg-[#161619] border-borderline dark:border-borderlinedark w-7/12 mb-px mr-px" />
				</div>,
				width: "56rem"
			},
			{
				title: <FieldInfoEditorModalHeader title={props.title} fieldInfo={selectedFieldInfo} invalidTabs={getInvalidTabs(validationResults)} />,
				content: <FieldInfoEditor 
					fieldInfo={selectedFieldInfo!} 
					properties={props.properties}
					ownerContentType={props.ownerContentType}
					actions={fieldInfoEditorActions} 
					session={props.session}
					onChange={handleFieldInfoChanged} 
					mode="create" />,
				width: props.isIntertwined ? "60rem" : "56rem"
			}
		]
	}

	const onStepChanged = (stepIndex: number) => {
		if (stepIndex === FIELD_TYPE_PICKER_STEP) {
			reset()
		}
		else if (stepIndex === FIELD_INFO_EDITOR_STEP) {
			setSelectedTab(0)
			if (selectedFieldInfo) {
				setValidationResults(validateAllFieldInfo(selectedFieldInfo, props.properties))
			}
		}
	}

	const handleNext = () => {
		const totalStepCount = getSteps().length
		if (activeStep < totalStepCount - 1) {
			const nextStepIndex = activeStep + 1
			setActiveStep(nextStepIndex)
			onStepChanged(nextStepIndex)
		}
	}

	const handlePrevious = () => {
		if (activeStep > 0) {
			const previousStepIndex = activeStep - 1
			setActiveStep(previousStepIndex)
			onStepChanged(previousStepIndex)
		}
	}

	const renderPreviousButton = () => {
		return (<button key="previousButton" type="button" onClick={handlePrevious} className={Styles.button.classic + "py-1.5 px-[2.4rem] ml-4"}>
			{gloc("Actions.Back")}
		</button>)
	}

	const renderNextButton = () => {
		const isDisabled = activeStep === FIELD_TYPE_PICKER_STEP && !selectedFieldInfo
		if (isDisabled) {
			return (<Tooltip key="nextButton" title={loc("SelectFieldType")} placement="top" overlayClassName="z-1000">
				<button type="button" className={Styles.button.disabledClassic + "py-1.5 px-[2.4rem] ml-4"}>
					{gloc("Actions.Next")}
				</button>
			</Tooltip>)
		}
		else {
			return (<button key="nextButton" type="button" onClick={handleNext} className={Styles.button.classic + "py-1.5 px-[2.4rem] ml-4"}>
				{gloc("Actions.Next")}
			</button>)
		}
	}

	const handleSave = () => {
		if (fieldInfoEditorActions.onSave) {
			const fieldInfo = fieldInfoEditorActions.onSave()
			
			if (fieldInfo && props.onConfirm) {
				props.onConfirm(fieldInfo)
			}	
		}

		reset()
	}

	const handleCancel = () => {
		if (fieldInfoEditorActions.onCancel) {
			fieldInfoEditorActions.onCancel()
		}

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
		const isValid = isAllValid(validationResults)

		if (isValid) {
			return (<button key="saveButton" type="button" onClick={handleSave} className={Styles.button.success + "py-1.5 px-7 ml-4"}>
				{gloc('Actions.Confirm')}
			</button>)
		}
		else {
			return (<button key="saveButton" type="button" className={Styles.button.disabledSuccess + "py-1.5 px-7 ml-4"} disabled>
				{gloc('Actions.Confirm')}
			</button>)
		}
	}

	const getFooterButtons = () => {
		const buttons: ReactNode[] = []

		if (activeStep > 0) {
			buttons.push(renderPreviousButton())
		}

		buttons.push(renderCancelButton())

		const totalStepCount = getSteps().length
		if (activeStep < totalStepCount - 1) {
			buttons.push(renderNextButton())
		}

		if (activeStep === totalStepCount - 1) {
			buttons.push(renderSaveButton())
		}

		return buttons
	}

	const reset = () => {
		setSelectedFieldInfo(null)
		setActiveStep(0)
		setSelectedTab(0)
		setValidationResults(undefined)
	}

	return (
		<Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
			<Modal
				open={props.visibility}
				className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700"
				style={props.isIntertwined ? { top: "11rem" } : { top: "5rem" }}
				onOk={handleSave}
				onCancel={handleCancel}
				width={getSteps()[activeStep].width}
				closable={false}
				maskClosable={false}
				destroyOnClose={true}
				footer={renderFooter()}
				title={getSteps()[activeStep].title}>
				<div className="bg-[#f7f7f7] dark:bg-zinc-900 border-y border-zinc-300 dark:border-zinc-700 max-h-[70vh]">
					{getSteps()[activeStep].content}
				</div>
			</Modal>
		</Tab.Group>
	)
}

export default FieldInfoCreateModal;