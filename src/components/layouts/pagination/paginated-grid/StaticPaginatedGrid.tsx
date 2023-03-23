import React, { ReactElement, useState } from "react"
import PaginationBar from "../PaginationBar"
import SelectLimit from "../SelectLimit"
import NoData from "../../../utils/NoData"
import { PaginatedCollection } from "../PaginatedCollection"
import { useTranslations } from 'next-intl'

export type StaticPaginatedGridProps<T> = {
	data: PaginatedCollection<T>,
	itemTemplate?(data: T, isSelectedItem: boolean): ReactElement
	unique(item: T): number | string,
	onPageChange?(page: number): void,
	onItemSelected?(item: any | null): void,
	onSelectedItemChanged?(item: any | null): void,
	onSelectedLimitChanged?(limit: number): void
	paginationBarMode?: undefined | "simplified"
	buttonCount?: number,
	columnClass?: string
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

const StaticPaginatedGrid: React.FC<StaticPaginatedGridProps<any>> = props => {
	const [selectedItem, setSelectedItem] = useState<any | null>()
	const [selectedPage, setSelectedPage] = useState<number>(props.data.selectedPage || 0)
	const [selectedLimit, setSelectedLimit] = useState<number>(props.data.limit)

	const loc = useTranslations("Pagination")

	const containerWrapper = React.useRef(null);

	const onPageChange = function (page: number) {
		setSelectedPage(page)

		if (props.onPageChange) {
			props.onPageChange(page)
		}
	}

	const onSelectedLimitChanged = function (limit: number) {
		setSelectedLimit(limit)

		if (props.onSelectedLimitChanged) {
			props.onSelectedLimitChanged(limit)
		}
	}

	const onSelectedPageChange = function (page: number) {
		let selectedPage = page < 1 ? 1 : page
		selectedPage = props.data.totalPageCount ? Math.min(page, props.data.totalPageCount) : page
		onPageChange(selectedPage)
	}

	const onPageJumperValueChanged = function (page: number) {
		onPageChange(page)
	}
	
	const onItemClicked = function (e: React.MouseEvent<HTMLDivElement | HTMLTableRowElement>, item: any) {
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

		if (justClickedOnTheRow(e, ['A'], false)) {
			e.preventDefault()
		}
	}

	const onWrapperClicked = function (e: React.MouseEvent<HTMLDivElement>) {
		if (e.isDefaultPrevented()) {
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

	const isSelectedItem = function (item: any): boolean {
		if (selectedItem) {
			return props.unique(selectedItem) === props.unique(item)
		}

		return false
	}

	return (
		<div className="h-full overflow-y-hidden">
			<div ref={containerWrapper} className="flex flex-col h-full justify-between">
				<div className="relative overflow-y-scroll h-full" onClick={(e) => onWrapperClicked(e)}>
					<div>
					{props.data && props.data.items && props.data.items.length > 0 ?
						<div className={`grid ${props.columnClass || ""}`}>
							{props.data.items.map((item, index) => {
								return (
									<div key={`item_${index}`} className="relative" onClick={(e) => onItemClicked(e, item)} data-selectable={true}>
										{props.itemTemplate ?
										<>{props.itemTemplate(item, isSelectedItem(item))}</>:
										<></>}
									</div>
								);
							})}
						</div> :
					<></>}
					</div>

					{props.data && props.data.totalCount === 0 ?
					<div className={"relative flex items-center justify-center w-full h-[calc(100%-2.8rem)] min-h-[10rem]"}>
						<NoData visibility={(props.data && props.data.totalCount === 0) || false} />
					</div>:
					<></>}
				</div>

				<div className="dark:bg-zinc-900/[.25] border-t border-borderline dark:border-borderlinedark h-16 py-3">
					<div className="flex w-full px-4">
						{props.paginationBarMode !== "simplified" ?
						<div className="flex items-center justify-start text-sm my-auto w-1/4">
							<span className="text-gray-500 whitespace-nowrap">{loc('PaginationPageSizePart1')} </span>
							<SelectLimit options={[10, 20, 50, 100]} selected={selectedLimit} className="mx-2 min-w-[4rem]" onSelectedLimitChanged={onSelectedLimitChanged} />
							<span className="text-gray-500 whitespace-nowrap"> {loc('PaginationPageSizePart2')} ({loc('Total')} {props.data.totalCount})</span>
						</div>:
						<></>}

						<div className="self-center m-auto pl-[7%]">
							<PaginationBar selectedPage={props.data.selectedPage ?? 0} totalPageCount={props.data.totalPageCount ?? 0} buttonCount={props.buttonCount} onPageChange={onPageChange} />
						</div>

						{props.paginationBarMode !== "simplified" ?
						<div className="flex items-center justify-end my-auto w-1/4">
							<span className="text-gray-500 text-sm mr-2">{loc('Page')}:</span>
							<input
								type="number"
								className={(props.data.totalPageCount || 0 > 0 ? "bg-white dark:bg-zinc-900" : "bg-zinc-100 dark:bg-zinc-600") + ` text-black dark:text-white text-right rounded-lg border border-slate-200 dark:border-zinc-700 cursor-default sm:text-sm w-16 py-1.5 px-3`}
								min={0}
								max={props.data.totalPageCount}
								value={selectedPage}
								disabled={props.data.totalPageCount === 0}
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
	);
};

export default StaticPaginatedGrid;