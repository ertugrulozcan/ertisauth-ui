import React, { useState, useEffect } from "react"
import PaginationBar from "./PaginationBar"
import SelectLimit from './SelectLimit'
import ProgressRing from "../../utils/ProgressRing"
import NoData from "../../utils/NoData"
import { NextRouter, useRouter } from 'next/router'
import { fetchPaginationData } from "../../../services/RestService"
import { RequestModel } from "../../../models/RequestModel"
import { PaginatedCollection } from "./PaginatedCollection"
import { ErrorResponseModel } from "../../../models/ErrorResponseModel"
import { SortDirection } from "./SortDirection"
import { Checkbox, Drawer, notification } from 'antd'
import { EditorVerticalAlignTop, EditorVerticalAlignBottom } from "../../icons/google/MaterialIcons"
import { ExclamationCircleIcon } from "@heroicons/react/outline"
import { PaginatedTableProps } from "./paginated-table/PaginatedTable"
import { PaginatedListProps } from "./paginated-list/PaginatedList"
import { PaginatedGridProps } from "./paginated-grid/PaginatedGrid"
import { getValue } from "../../../helpers/ObjectHelper"
import { useTranslations } from 'next-intl'

export enum ViewType {
	Table,
	List,
	Grid
}

export type PaginatedViewActions = {
	refresh: Function,
	closeDetailPanel?: Function,
}

interface PaginationViewModel<T> {
	paginationResult: PaginatedCollection<T>
	error?: ErrorResponseModel
	checkedItems?: T[]
}

interface SubComponentProps {
	children?: React.ReactNode
}

interface PaginationViewProps<T> extends PaginatedViewProps<T>, SubComponentProps {
	viewType: ViewType,
}

export interface PaginatedViewProps<T> extends SubComponentProps{
	cid: string,
	pageSize: number,
	buttonCount?: number,
	api: RequestModel | undefined,
	initialPage?: number,
	orderBy?: string | undefined,
	sortDirection?: SortDirection | undefined,
	checkboxSelection?: boolean | undefined,
	paginationBarMode?: undefined | "simplified"
	unique(item: T): number | string,
	checkBoxEnable?(item: T): boolean,
	onLoad?(result: PaginatedCollection<T>): void,
	onError?(error: ErrorResponseModel): void,
	onItemSelected?(item: T | null): void,
	onSelectedItemChanged?(item: T | null): void,
	onCheckedItemsChanged?(checkedItems: T[]): void,
	onSelectedPageChanged?(page: number): void,
	actions?(actions: PaginatedViewActions): void
}

export const DetailPanel: React.FC<SubComponentProps> = props => {
	return (<>{props.children}</>)
};

export interface PaginatedViewSubComponents {
	DetailPanel: React.FC<SubComponentProps>
}

const getParentsUntilRow = (element: HTMLElement, parentList?: HTMLElement[]): HTMLElement[] | undefined => {
	const parents = parentList ? parentList.concat([element]) : [element]
	if (element.getAttribute("data-selectable") === "true") {
		return parents
	}
	else if (element.parentElement) {
		return getParentsUntilRow(element.parentElement, parents)
	}
}

const justClickedOnTheRow = function (e: React.MouseEvent<HTMLDivElement | HTMLTableRowElement>, clickableElements: string[] = [ 'BUTTON', 'A', 'INPUT' ], clickableResult: boolean = true): boolean {
	const element = e.target as HTMLElement;
	const parents = getParentsUntilRow(element)
	if (parents === undefined) {
		return true;
	}

	if (parents.some(x => x.getAttribute("data-clickable") === "true")) {
		return clickableResult;
	}

	for (let clickableElement of clickableElements) {
		if (parents.some(x => x.nodeName.toUpperCase() === clickableElement.toUpperCase())) {
			return false;
		}
	}

	return true;
}

const isTargetOnDrawer = function(element: HTMLElement): boolean {
	if (element.classList.contains('detail-panel-drawer')) {
		return true
	}
	else if (element.parentElement) {
		return isTargetOnDrawer(element.parentElement)
	}
	else {
		return false
	}
}

const extractSelectedPageFromQuery = (router: NextRouter): number | undefined => {
	if (router.query.page) {
		const page = Number.parseInt(router.query.page.toString())
		return page
	}
}

const LocalizedErrorCodes: string[] = [ "InternalClientError", "RequestWasAbortedByUser" ]

const PaginationView = <T extends unknown & Record<string, any>>(props: PaginationViewProps<T> & (PaginatedTableProps<T> | PaginatedListProps<T> | PaginatedGridProps<T>)) => {
	const [api, setApi] = useState<RequestModel | undefined>(props.api)
	const [viewModel, setViewModel] = useState<PaginationViewModel<T>>()
	const [selectedItem, setSelectedItem] = useState<T | null>()
	const [detailPanelVisibility, setDetailPanelVisibility] = useState(false)
	const [selectedPage, setSelectedPage] = useState<number>(extractSelectedPageFromQuery(useRouter()) || viewModel?.paginationResult.selectedPage || 0)
	const [selectedLimit, setSelectedLimit] = useState<number>(props.pageSize)
	const [isLoading, setIsLoading] = useState<boolean>();

	const gloc = useTranslations()
	const loc = useTranslations("Pagination")

	useEffect(() => {
		const abortController = new AbortController()
		loadPage(abortController.signal, selectedPage)
	
		return () => {
			if (isLoading) {
				abortController.abort()
			}
		}
	}, [api]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (!props.checkboxSelection) {
			clearAllChecks()
		}
	}, [props.checkboxSelection]); // eslint-disable-line react-hooks/exhaustive-deps

	const loadData = React.useCallback(async (request: RequestModel | undefined, skip: number, limit: number, orderBy?: string | undefined, sortDirection?: SortDirection | undefined, abortSignal?: AbortSignal | null | undefined) => {
        if (!request) {
			return
		}
		
		setViewModel(undefined)
		setIsLoading(true)

		try {
			const paginationResponse = await fetchPaginationData(request, skip, limit, orderBy, sortDirection, abortSignal)
			if (paginationResponse.IsSuccess) {
				const collection = paginationResponse.Data as PaginatedCollection<T>

				setViewModel(values => ({ ...values, paginationResult: collection }))
				setSelectedLimit(limit)
				onSelectedPageChange(collection.selectedPage)

				if (props.onLoad) {
					props.onLoad(collection)
				}
			}
			else {
				const error = paginationResponse.Data as ErrorResponseModel
				setViewModel(values => ({ ...values, paginationResult: {
					skip: skip,
					limit: limit,
					items: [],
					totalCount: 0,
					totalPageCount: 0,
					selectedPage: 0,
					orderBy: orderBy,
					sortDirection: sortDirection
				} as PaginatedCollection<T>, error: error }))
				
				const errorMessage = LocalizedErrorCodes.includes(error.ErrorCode) ? gloc(`ErrorCodes.${error.ErrorCode}`) : error.Message
				openErrorNotification("Error", errorMessage)

				if (props.onError) {
					props.onError(error)
				}
			}		
		}
		catch (ex) {
			let message: string
			if (ex instanceof Error) {
				if (ex.name === 'AbortError') {
					return
				}

				message = ex.message
			}
			else {
				message = String(ex)
			}

			const error: ErrorResponseModel = {
				Message: message,
				ErrorCode: "InternalClientError",
				StatusCode: 500
			}

			setViewModel(values => ({ ...values, paginationResult: {
				skip: skip,
				limit: limit,
				items: [],
				totalCount: 0,
				totalPageCount: 0,
				selectedPage: 0,
				orderBy: orderBy,
				sortDirection: sortDirection
			} as PaginatedCollection<T>, error: error }))
			openErrorNotification("Error", message)

			if (props.onError) {
				props.onError(error)
			}
		}
		finally {
			setIsLoading(false)
		}
    }, [api]) // eslint-disable-line react-hooks/exhaustive-deps

	const loadPage = function (abortSignal?: AbortSignal | null | undefined, page?: number, limit?: number, orderBy?: string, sortDirection?: SortDirection) {
		const skip: number = page ? ((page - 1) * selectedLimit) : (viewModel ? viewModel.paginationResult.skip : 0)
		const limit_: number = limit || (viewModel ? viewModel.paginationResult.limit : selectedLimit)
		const orderBy_: string | undefined = orderBy || (viewModel ? viewModel.paginationResult.orderBy : props.orderBy)
		const sortDirection_: SortDirection | undefined = sortDirection || (viewModel ? viewModel.paginationResult.sortDirection : props.sortDirection)
		loadData(api, skip, limit_, orderBy_, sortDirection_, abortSignal)
	}

	const refresh = function (api?: RequestModel, page?: number) {
		if (api) {
			if (page) {
				onSelectedPageChange(page)
			}

			setApi(api)
		}
		else {
			if (page) {
				loadPage(undefined, page)
			}
			else {
				loadPage()
			}
		}
	}

	const onPageChange = function (page: number) {
		loadPage(undefined, page)
	}

	const onSelectedPageChange = function (page: number) {
		let selectedPage = page < 1 ? 1 : page
		selectedPage = viewModel?.paginationResult.totalPageCount ? Math.min(page, viewModel?.paginationResult.totalPageCount) : page

		setSelectedPage(selectedPage)
		if (props.onSelectedPageChanged) {
			props.onSelectedPageChanged(selectedPage)
		}
	}

	const onSelectedLimitChanged = function (limit: number) {
		loadPage(undefined, undefined, limit)
	}

	const onPageJumperValueChanged = function (page: number) {
		onPageChange(page)
	}

	const sortByColumn = function (fieldPath: string | undefined) {
		let sortDirection: SortDirection = SortDirection.Asc
		if (viewModel && viewModel.paginationResult.orderBy && viewModel.paginationResult.orderBy === fieldPath) {
			if (viewModel.paginationResult.sortDirection && viewModel.paginationResult.sortDirection === SortDirection.Asc) {
				sortDirection = SortDirection.Desc
			}
		}

		loadPage(undefined, undefined, undefined, fieldPath, sortDirection)
	}

	const onItemClicked = function (e: React.MouseEvent<HTMLDivElement | HTMLTableRowElement>, item: T) {
		if (!justClickedOnTheRow(e)) {
			e.preventDefault()
			return
		}

		if (!selectedItem && item || selectedItem && item && props.unique(selectedItem) !== props.unique(item)) {
			if (props.onSelectedItemChanged) {
				props.onSelectedItemChanged(item)
			}
		}

		setSelectedItem(item)
		if (props.onItemSelected) {
			props.onItemSelected(item)
		}

		var detailPanel = getDetailPanel(props)
		if (detailPanel) {
			if (item) {
				showDetailPanel()
			}
			else {
				closeDetailPanel()
			}
		}

		if (justClickedOnTheRow(e, ['A'], false)) {
			e.preventDefault()
		}
	}

	const onWrapperClicked = function (e: React.MouseEvent<HTMLDivElement>) {
		if (e.isDefaultPrevented()) {
			return
		}

		const div = e.target as HTMLDivElement
		if (div.classList.contains('ant-drawer-mask') || isTargetOnDrawer(div)) {
			return
		}

		if (props.onSelectedItemChanged) {
			props.onSelectedItemChanged(null)
		}

		setSelectedItem(null)
		if (props.onItemSelected) {
			props.onItemSelected(null)
		}
	}

	const isSelectedItem = function (item: T): boolean {
		if (selectedItem) {
			return props.unique(selectedItem) === props.unique(item)
		}

		return false
	}

	const showDetailPanel = () => {
		setDetailPanelVisibility(true);
	}

	const closeDetailPanel = () => {
		setDetailPanelVisibility(false);
	}

	if (props.actions) {
		props.actions({
			refresh,
			closeDetailPanel
		})
	}

	const handleHeaderCheckBoxChange = (isChecked: boolean) => {
		if (viewModel) {
			let currentCheckedItems: T[] = (viewModel.checkedItems || []).concat([])
			if (isChecked) {
				for (let item of viewModel.paginationResult.items) {
					if (!currentCheckedItems.some(x => props.unique(x) === props.unique(item))) {
						currentCheckedItems.push(item)
					}
				}
			}
			else {
				const currentCheckedItems_: T[] = []
				for (let item of currentCheckedItems) {
					if (!viewModel.paginationResult.items.some(x => props.unique(x) === props.unique(item))) {
						currentCheckedItems_.push(item)
					}
				}

				currentCheckedItems = currentCheckedItems_
			}
			
			const paginationResult: PaginatedCollection<T> = { ...viewModel.paginationResult }
			setViewModel(values => ({ ...values, paginationResult: paginationResult, checkedItems: currentCheckedItems }))
			
			if (props.onCheckedItemsChanged) {
				props.onCheckedItemsChanged(currentCheckedItems)
			}
		}
	}

	const clearAllChecks = function () {
		if (viewModel) {
			const paginationResult: PaginatedCollection<T> = { ...viewModel.paginationResult }
			setViewModel(values => ({ ...values, paginationResult: paginationResult, checkedItems: [] }))
			
			if (props.onCheckedItemsChanged) {
				props.onCheckedItemsChanged([])
			}
		}
	}

	const handleCheckBoxChange = (isChecked: boolean, rowItem: T) => {
		if (viewModel) {
			const checkedItems: T[] = viewModel.checkedItems ? viewModel.checkedItems.concat([]) : []
			if (isChecked && !checkedItems.some(x => props.unique(x) === props.unique(rowItem))) {
				checkedItems.push(rowItem)
			}
			else {
				const index = checkedItems.findIndex(x => props.unique(x) === props.unique(rowItem))
				if (index >= 0) {
					checkedItems.splice(index, 1)
				}
			}
			
			const paginationResult: PaginatedCollection<T> = { ...viewModel.paginationResult }
			setViewModel(values => ({ ...values, paginationResult: paginationResult, checkedItems: checkedItems }))

			if (props.onCheckedItemsChanged) {
				props.onCheckedItemsChanged(checkedItems)
			}
		}
	}

	const isRowChecked = (item: T): boolean => {
		let isChecked: boolean = false
		if (viewModel) {
			isChecked = viewModel.checkedItems?.some(x => props.unique(x) === props.unique(item)) || false
		}

		return isChecked
	}

	const isAllRowsChecked = (): boolean => {
		if (viewModel) {
			for (let item of viewModel.paginationResult.items) {
				if (!isRowChecked(item)) {
					return false
				}
			}

			return true
		}

		return false
	}

	const isAnyRowChecked = (): boolean => {
		if (viewModel) {
			for (let item of viewModel.paginationResult.items) {
				if (isRowChecked(item)) {
					return true
				}
			}
		}

		return false
	}

	const isIndeterminateChecked = (): boolean => {
		return isAnyRowChecked() && !isAllRowsChecked()
	}

	const key = 'updatable'
	const openErrorNotification = (title: string, message: string) => {
		notification.error({
			key,
			message: title,
			description: message,
			className: "dark:bg-zinc-900 dark:border dark:border-zinc-700 dark:text-zinc-100"
		});
	}

	const renderTable = (props: PaginatedViewProps<T> & PaginatedTableProps<T>) => {
		return (
			<table className='w-full bg-transparent border-collapse table-auto table-striped'>
				<thead className="shadow bg-gray-100 dark:bg-zinc-900">
					<tr className='text-left'>
						{props.checkboxSelection ? 
						<th className="sticky top-0 px-0 py-0 bg-[#fdfdff] dark:bg-zinc-900 border-b border-borderline dark:border-borderlinedark first:pl-8 z-10">
							<Checkbox checked={isAllRowsChecked()} indeterminate={isIndeterminateChecked()} onChange={(e) => handleHeaderCheckBoxChange(e.target.checked)} data-clickable={true} />
						</th>:
						<></>}
						{props.columns.map((column, columnIndex) => {
							return (
								<th key={`header_${columnIndex}`} className={`sticky top-0 px-0 py-0 bg-[#fdfdff] dark:bg-neutral-900 border-b border-borderline dark:border-borderlinedark z-10 ${props.checkboxSelection ? "first:pl-8" : (props.firstColumnClass ? props.firstColumnClass : "first:pl-8")}`}>
									{column.sortable ?
										<button type="button" onClick={() => sortByColumn(column.fieldName ?? column.sortField)} className="inline-flex items-center h-10 w-full px-4 py-6 text-neutral-800 dark:text-zinc-100 transition-colors duration-150 hover:bg-zinc-200 dark:hover:bg-zinc-800">
											{column.header?.template ?
												<>{column.header.template}</> :
												<span className={column.header?.className ?? "text-xs font-bold tracking-wider text-gray-600 dark:text-neutral-100 uppercase"}>
													{column.title}
												</span>
											}

											{viewModel && (viewModel.paginationResult.orderBy === column.fieldName || viewModel.paginationResult.orderBy === column.sortField) ?
												<>
													{viewModel.paginationResult.sortDirection === SortDirection.Desc ?
														<span className="ml-2">
															<EditorVerticalAlignBottom className="w-4 h-4 fill-neutral-800 dark:fill-zinc-100" />
														</span> :
														<span className="ml-2">
															<EditorVerticalAlignTop className="w-4 h-4 fill-neutral-800 dark:fill-zinc-100" />
														</span>
													}
												</> :
												<></>}
										</button>
										:
										<div className="inline-flex items-center h-10 w-full px-4 py-6 text-neutral-800 dark:text-zinc-100 transition-colors duration-150 hover:bg-zinc-200 dark:hover:bg-zinc-800">
											{column.header?.template ?
												<>{column.header.template}</>:
												<span className={column.header?.className ?? "text-xs font-bold tracking-wider text-gray-600 dark:text-neutral-100 uppercase"}>
													{column.title}
												</span>
											}
										</div>
									}
								</th>
							)
						})}
					</tr>
				</thead>

				<tbody>
					{viewModel && viewModel.paginationResult.items && viewModel.paginationResult.items.length > 0 ?
						<>
							{viewModel.paginationResult.items.map((item, index) => {
								let rowClass = ""
								if (isSelectedItem(item)) {
									rowClass += " bg-neutral-50 dark:bg-zinc-900 outline outline-1 outline-orange-500/[0.75] rounded-sm"
								}
								else {
									if (props.zebra) {
										rowClass += " odd:bg-white even:bg-[#f7f7f7] dark:odd:bg-[#252525] dark:even:bg-[#1e1e1f]"
									}

									rowClass += " border-b border-gray-200 dark:border-zinc-600/[0.4] border-dashed hover:bg-gray-100 dark:hover:bg-neutral-900"
								}

								const rowIndicator = props.indicator ? props.indicator(item) : undefined;

								let checkBoxEnable = true
								if (props.checkBoxEnable) {
									checkBoxEnable = props.checkBoxEnable(item)
								}

								return (
									<tr className={rowClass} key={`row_${index}`} onClick={(e) => onItemClicked(e, item)} data-selectable={true}>
										{props.checkboxSelection ? 
										<td className="relative first:pl-8">
											{rowIndicator ?
											<span className="absolute left-0 top-0 bottom-0">{rowIndicator}</span>:
											<></>}

											{checkBoxEnable ?
											<Checkbox checked={isRowChecked(item)} onChange={(e) => handleCheckBoxChange(e.target.checked, item)} data-clickable={true} /> :
											<></>}
										</td>:
										<></>}
										{props.columns.map((column, columnIndex) => {
											const data = getValue(item, column.fieldName)
											return (
												<td key={`cell_${columnIndex}`} className={`${props.checkboxSelection ? "relative first:pl-8" : (props.firstColumnClass ? "relative " + props.firstColumnClass : "relative first:pl-8")} max-w-[30rem] xs:max-w-[20rem] std:max-w-[25rem] 3xl:max-w-[30rem] 4xl:max-w-[40rem]`}>
													{rowIndicator && columnIndex === 0 && !props.checkboxSelection ?
													<span className="absolute left-px top-0 bottom-0">{rowIndicator}</span>:
													<></>}

													<span className='relative flex items-center text-gray-700 dark:text-neutral-300 text-sm px-3.5 py-2'>
														{column.render ? <>{column.render(item)}</> : <>{data}</>}
													</span>
												</td>
											)
										})}
									</tr>
								);
							})}
						</> :
						<></>}
				</tbody>
			</table>
		)
	}

	const renderList = (props: PaginatedViewProps<T> & PaginatedListProps<T>) => {
		return (
			<div className="py-3">
				{viewModel && viewModel.paginationResult.items && viewModel.paginationResult.items.length > 0 ?
					<>
						{viewModel.paginationResult.items.map((item, index) => {
							let checkBoxEnable = true
							if (props.checkBoxEnable) {
								checkBoxEnable = props.checkBoxEnable(item)
							}

							return (
								<div className="flex px-4 mb-3" key={`item_${index}`} data-selectable={true}>
									{props.checkboxSelection && checkBoxEnable ? 
									<div className="mr-2">
										<Checkbox checked={isRowChecked(item)} onChange={(e) => handleCheckBoxChange(e.target.checked, item)} data-clickable={true} />
									</div>:
									<></>}
									
									<div className="flex flex-1" onClick={(e) => onItemClicked(e, item)}>
										{props.itemTemplate ?
										<>{props.itemTemplate(item, isSelectedItem(item))}</>:
										<></>}
									</div>
								</div>
							);
						})}
					</> :
					<></>}
			</div>
		)
	}

	const renderGrid = (props: PaginatedViewProps<T> & PaginatedGridProps<T>) => {
		let checkBoxPlacementClass = "top-2 right-2.5";
		if (props.checkBoxPlacement) {
			if (props.checkBoxPlacement === "topLeft") {
				checkBoxPlacementClass = "top-2 left-2.5";
			}
			else if (props.checkBoxPlacement === "topRight") {
				checkBoxPlacementClass = "top-2 right-2.5";
			}
			else if (props.checkBoxPlacement === "bottomLeft") {
				checkBoxPlacementClass = "bottom-2 left-2.5";
			}
			else if (props.checkBoxPlacement === "bottomRight") {
				checkBoxPlacementClass = "bottom-2 right-2.5";
			}
		}

		return (
			<div>
				{viewModel && viewModel.paginationResult.items && viewModel.paginationResult.items.length > 0 ?
					<div className={`grid ${props.columnClass || ""}`}>
						{viewModel.paginationResult.items.map((item, index) => {
							let checkBoxEnable = true
							if (props.checkBoxEnable) {
								checkBoxEnable = props.checkBoxEnable(item)
							}

							return (
								<div key={`item_${index}`} className="relative" onClick={(e) => onItemClicked(e, item)} data-selectable={true}>
									{props.itemTemplate ?
									<>{props.itemTemplate(item, isSelectedItem(item))}</>:
									<></>}

									{props.checkboxSelection && checkBoxEnable ? 
									<div className={`absolute ${checkBoxPlacementClass}`}>
										<Checkbox checked={isRowChecked(item)} onChange={(e) => handleCheckBoxChange(e.target.checked, item)} data-clickable={true} />
									</div>:
									<></>}
								</div>
							);
						})}
					</div> :
					<></>}
			</div>
		)
	}

	var detailPanel = getDetailPanel(props)
	const containerWrapper = React.useRef(null);

	return (
		<div className="h-full overflow-y-hidden">
			<div ref={containerWrapper} className="relative flex flex-col h-full justify-between">
				<div className="relative overflow-y-scroll h-full pb-24" onClick={(e) => onWrapperClicked(e)}>
					{
						props.viewType === ViewType.Table ? 
							renderTable(props as PaginatedViewProps<T> & PaginatedTableProps<T>) : 
						props.viewType === ViewType.List ? 
							renderList(props as PaginatedViewProps<T> & PaginatedListProps<T>) : 
						props.viewType === ViewType.Grid ? 
							renderGrid(props as PaginatedViewProps<T> & PaginatedGridProps<T>) : 
						<></>
					}

					{detailPanel ?
						<Drawer
							placement="right"
							width={400}
							onClose={closeDetailPanel}
							open={detailPanelVisibility}
							getContainer={containerWrapper.current ?? false}
							closeIcon={null}
							headerStyle={{ padding: 0 }}
							bodyStyle={{ padding: 0 }}
							
							maskStyle={{ backgroundColor: "#00000000" }}>
							<div className="detail-panel-drawer h-full bg-white/[0.96] dark:bg-zinc-900/[0.96] border-l border-gray-300 dark:border-zinc-700 overflow-hidden">
								{detailPanel}
							</div>
						</Drawer> :
						<></>
					}

					{isLoading ?
					<div className={"relative flex items-center justify-center w-full h-[calc(100%-2.8rem)] min-h-[10rem]"}>
						<div className="absolute top-[5%] bottom-[10%]">
							<ProgressRing />
						</div>
					</div>:
					<>
					{viewModel && viewModel.error ?
					<div className={"relative flex flex-col items-center justify-center w-full h-[calc(100%-2.8rem)] min-h-[10rem]"}>
						<ExclamationCircleIcon className="text-red-600 dark:text-red-700 w-12 h-12" />
						<span className="text-center text-sm dark:text-neutral-500 max-w-[30rem] mt-2">{LocalizedErrorCodes.includes(viewModel.error.ErrorCode) ? gloc(`ErrorCodes.${viewModel.error.ErrorCode}`) : viewModel.error.Message}</span>

						<button type="button" onClick={() => refresh()} className="font-medium text-xs text-gray-500 dark:text-zinc-400 hover:text-gray-700 hover:dark:text-zinc-300 leading-none hover:cursor-pointer hover:underline mt-2">
							{loc("Reload")}
						</button>
					</div>:
					<>
					{viewModel && viewModel.paginationResult && viewModel.paginationResult.totalCount === 0 ?
					<div className={"relative flex items-center justify-center w-full h-[calc(100%-2.8rem)] min-h-[10rem]"}>
						<NoData visibility={(viewModel && viewModel.paginationResult && viewModel.paginationResult.totalCount === 0) || false} />
					</div>:
					<></>}
					</>}
					</>}
				</div>

				<div className="dark:bg-zinc-900/[.25] border-t border-borderline dark:border-borderlinedark h-16 py-3">
					<div className="flex w-full px-4">
						{props.paginationBarMode !== "simplified" ?
						<div className="flex items-center justify-start text-sm my-auto w-1/4">
							<span className="text-gray-500 whitespace-nowrap">{loc('PaginationPageSizePart1')} </span>
							<SelectLimit options={[10, 20, 50, 100]} selected={selectedLimit} className="mx-2 min-w-[4rem]" onSelectedLimitChanged={onSelectedLimitChanged} />
							<span className="text-gray-500 whitespace-nowrap"> {loc('PaginationPageSizePart2')} ({loc('Total')} {viewModel?.paginationResult.totalCount})</span>
						</div>:
						<></>}

						<div className="self-center m-auto pl-[7%]">
							<PaginationBar selectedPage={viewModel?.paginationResult.selectedPage ?? 0} totalPageCount={viewModel?.paginationResult.totalPageCount ?? 0} buttonCount={props.buttonCount} onPageChange={onPageChange} />
						</div>

						{props.paginationBarMode !== "simplified" ?
						<div className="flex items-center justify-end my-auto w-1/4">
							<span className="text-gray-500 text-sm mr-2">{loc('Page')}:</span>
							<input
								type="number"
								className={(viewModel?.paginationResult.totalPageCount || 0 > 0 ? "bg-white dark:bg-zinc-900" : "bg-zinc-100 dark:bg-zinc-600") + ` text-black dark:text-white text-right rounded-lg border border-slate-200 dark:border-zinc-700 cursor-default sm:text-sm w-16 py-1.5 px-3`}
								min={0}
								max={viewModel?.paginationResult.totalPageCount}
								value={selectedPage}
								disabled={viewModel?.paginationResult.totalPageCount === 0}
								onChange={(e) => onSelectedPageChange(parseInt(e.currentTarget.value))}
								onKeyDown={(e: React.KeyboardEvent) => {
									if (e.key === 'Enter') {
										onPageJumperValueChanged(parseInt((e.target as HTMLInputElement).value))
									}
								}}></input>
						</div>:
						<></>}
					</div>
				</div>
			</div>
		</div>
	)
};

export const getDetailPanel = function (props: React.PropsWithChildren<any>) {
	return React.Children.toArray(props.children).find(x => (x as any).type.displayName === "DetailPanel")
}

DetailPanel.displayName = "DetailPanel"
PaginationView.DetailPanel = DetailPanel;

export default PaginationView;