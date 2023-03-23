import React, { useState } from "react"
import QueryBuilder from "./QueryBuilder"
import { Modal, Popconfirm } from 'antd'
import { ClearOutlined } from '@ant-design/icons'
import { FilterProperty } from "./FilterProperty"
import { FilterIcon } from "@heroicons/react/outline"
import { Styles } from "../Styles"
import { deepCopy } from "../../helpers/ObjectHelper"
import { useTranslations } from 'next-intl'

export interface FilterButtonProps {
	schema: FilterProperty[]
	defaultQuery?: any
	onConfirm?(query: any): void
	onCancel?(): void
}

const FilterButton = (props: FilterButtonProps) => {
	const [query, setQuery] = useState<any>()
	const [defaultQuery, setDefaultQuery] = useState<any>(props.defaultQuery)
	const [isValid, setIsValid] = useState<boolean>(false)
	const [modalVisibility, setModalVisibility] = useState<boolean>(false)

	const gloc = useTranslations()

	React.useEffect(() => {
		setDefaultQuery(props.defaultQuery)
	}, [props.defaultQuery])

	const onQueryChange = (query: any) => {
		setQuery(query)
	}

	const clearAllFilters = () => {
		setQuery({})
		setDefaultQuery({})

		if (props.onConfirm) {
			props.onConfirm({})
		}

		setModalVisibility(false)
	}

	const onValidationStateChange = (isValid: boolean) => {
		setIsValid(isValid)
	}

	const openModal = () => {
		setQuery(props.defaultQuery)
		setModalVisibility(true)
	}

	const handleConfirm = () => {
		if (props.onConfirm) {
			props.onConfirm(query)
		}

		setModalVisibility(false)
	}

	const handleCancel = () => {
		if (props.onCancel) {
			props.onCancel()
		}

		setQuery(undefined)
		setDefaultQuery(deepCopy(props.defaultQuery))
		setModalVisibility(false)
	}

	const renderTitle = () => {
		return (
			<div className="flex items-center justify-between px-7 py-3.5">
				<span className="text-slate-600 dark:text-zinc-300">{gloc('QueryBuilder.Filter')}</span>

				<Popconfirm onConfirm={clearAllFilters} title={gloc("QueryBuilder.AreYouSureYouWantToClearAllFilters")} okText={gloc("Actions.Yes")} cancelText={gloc("Actions.No")} icon={<ClearOutlined style={{ color: '#d34356' }} />} placement="bottomRight">
					<button type="button" className="font-medium text-xs text-gray-500 dark:text-zinc-400 hover:text-gray-700 hover:dark:text-zinc-300 leading-none hover:cursor-pointer hover:underline">
						{gloc("Actions.Clear")}
					</button>
				</Popconfirm>
			</div>
		)
	}

	const renderApplyButton = () => {
		if (isValid) {
			return (<button key="applyButton" type="button" onClick={handleConfirm} className={Styles.button.success + "py-1.5 px-9 ml-4"}>
				{gloc('Actions.Apply')}
			</button>)
		}
		else {
			return (<button key="applyButton" type="button" className={Styles.button.disabledSuccess + "py-1.5 px-9 ml-4"}>
				{gloc('Actions.Apply')}
			</button>)
		}
	}

	const renderCancelButton = () => {
		return (<button key="cancelButton" type="button" onClick={handleCancel} className={Styles.button.warning + "py-1.5 px-10 ml-4"}>
			{gloc('Actions.Cancel')}
		</button>)
	}

	const isEmpty = 
		props.defaultQuery === undefined || 
		props.defaultQuery === null || 
		(props.defaultQuery && Object.keys(props.defaultQuery).length === 0 && Object.getPrototypeOf(props.defaultQuery) === Object.prototype)

	return (
		<>
		<button type="button" onClick={openModal} className={`${isEmpty ? Styles.button.classic : Styles.button.warning} text-[13px] leading-3 pl-6 pr-[1.55rem]`}>
			<FilterIcon className={`${isEmpty ? "stroke-neutral-700 dark:stroke-zinc-100" : "stroke-neutral-100 dark:stroke-zinc-100"} w-4 h-4 mr-2.5`} />
			{gloc('QueryBuilder.Filter')}
		</button>

		<Modal
			open={modalVisibility}
			className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700 rounded-md"
			onOk={handleConfirm}
			onCancel={handleCancel}
			width={"64rem"}
			closable={false}
			maskClosable={true}
			footer={[renderCancelButton(), renderApplyButton()]}
			title={renderTitle()}>
			<div className="border-y border-zinc-300 dark:border-zinc-700 max-h-[70vh] px-9 pt-4 pb-8">
				<QueryBuilder 
					schema={props.schema} 
					query={query} 
					defaultQuery={defaultQuery} 
					onQueryChange={onQueryChange} 
					onValidationStateChange={onValidationStateChange} />
			</div>
		</Modal>
		</>
	)
}

export default FilterButton;