import React from "react"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/solid'
import { useTranslations } from 'next-intl'

const BUTTON_COUNT = 5

type PaginationBarProps = {
	selectedPage: number
	totalPageCount: number,
	buttonCount?: number,
	onPageChange(page: number): void
}

interface PaginationButton {
	index: number,
	isSelected: boolean
}

// Button classes
const btn = "relative inline-flex items-center justify-center text-sm font-medium mx-1.5 py-1.5 h-10 w-9"
const active = "text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 dark:hover:z-10 dark:text-zinc-300 dark:hover:text-neutral-100 rounded hover:rounded dark:rounded dark:hover:rounded"
const selected = "bg-gray-50 text-indigo-800 dark:bg-gray-700 dark:text-neutral-50 border border-orange-500 z-20"
const disabled = "text-gray-300 dark:text-gray-600"
const previous = ""
const next = ""
const first = "rounded-l-md dark:rounded-l-md"
const last = "rounded-r-md dark:rounded-r-md"
const pad1 = "px-2"
const pad2 = "px-2.5"
const pad3 = "px-3.5"

const combine = function (classes: string[]): string {
	return classes.join(" ")
}

const PaginationBar = (props: PaginationBarProps) => {
	const gloc = useTranslations()

	var selectedPage = props.selectedPage
	if (selectedPage <= 0) {
		selectedPage = 1
	}
	if (selectedPage > props.totalPageCount) {
		selectedPage = props.totalPageCount
	}

	const buttonTimes = (props.buttonCount || BUTTON_COUNT) + 1
	const pageGroupIndex = (selectedPage - (selectedPage % buttonTimes)) / buttonTimes

	var start = pageGroupIndex * buttonTimes
	var end = start + (props.buttonCount || BUTTON_COUNT)
	if (start < 1) {
		start = 1
	}

	if (end > props.totalPageCount) {
		end = props.totalPageCount
		start = Math.max(end - (props.buttonCount || BUTTON_COUNT), 1)
	}

	const isBackPossible = selectedPage > 1
	const isForwardPossible = selectedPage < props.totalPageCount

	const buttons: PaginationButton[] = []
	for (var i = start; i <= end; i++) {
		buttons.push({
			index: i,
			isSelected: i === selectedPage
		})
	}

	const changePage = function (index: number) {
		props.onPageChange(index)
	}

	if (buttons.length > 0) {
		return (
			<nav className="relative z-0 inline-flex items-center rounded-md shadow-xs" aria-label="Pagination">
				<button type="button" className={combine([btn, pad2, first, isBackPossible ? active : disabled])} disabled={!isBackPossible} key={'first'} onClick={() => changePage(1)}>
					<span className="sr-only">{gloc("Pagination.FirstPage")}</span>
					<ChevronDoubleLeftIcon className="h-5 w-4" aria-hidden="true" />
				</button>

				<button type="button" className={combine([btn, pad1, previous, isBackPossible ? active : disabled])} disabled={!isBackPossible} key={'previous'} onClick={() => changePage(selectedPage - 1)}>
					<span className="sr-only">{gloc("Pagination.Previous")}</span>
					<ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
				</button>

				{buttons.map((button, i) => (
					<div key={button.index}>
						{button.isSelected ?
							<button type="button" aria-current="page" className={combine([btn, pad3, active, selected])}>
								{button.index}
							</button>
							:
							<button type="button" className={combine([btn, pad3, active])} onClick={() => changePage(button.index)}>
								{button.index}
							</button>
						}
					</div>
				))}

				<button type="button" className={combine([btn, pad1, next, isForwardPossible ? active : disabled])} disabled={!isForwardPossible} key={'next'} onClick={() => changePage(selectedPage + 1)}>
					<span className="sr-only">{gloc("Pagination.Next")}</span>
					<ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
				</button>

				<button type="button" className={combine([btn, pad2, last, isForwardPossible ? active : disabled])} disabled={!isForwardPossible} key={'last'} onClick={() => changePage(props.totalPageCount)}>
					<span className="sr-only">{gloc("Pagination.LastPage")}</span>
					<ChevronDoubleRightIcon className="h-5 w-4" aria-hidden="true" />
				</button>
			</nav>
		);
	}
	else {
		return <></>
	}
}

export default PaginationBar;