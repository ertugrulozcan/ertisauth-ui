import React, { ReactNode } from "react"
import { hasValue } from "../../helpers/NumberHelper"

export interface StaticTableColumn {
	header: string
	field: string
	converter?(value: any): string | ReactNode
	className?: string
}

export interface StaticTableProps {
	data: any[]
	columns: StaticTableColumn[]
	className?: string
	tableLayout?: "auto" | "fixed"
	rowKey(item: any, index: number): React.Key | null | undefined
	onRowSelected?(item: any, rowIndex: number): void
}

const tableClass = "border-collapse text-xs w-full"
const theadClass = "bg-neutral-50 dark:bg-[#212123] border-b last:border-b-0 border-gray-200 dark:border-zinc-700 z-10"
const trClass = "border-b last:border-b-0 border-gray-200 dark:border-zinc-700 hover:bg-neutral-50 hover:dark:bg-zinc-800"
const thClass = "border-r last:border-r-0 border-gray-200 dark:border-zinc-600 font-medium text-slate-500 dark:text-zinc-200 text-left font-semibold px-6 pt-2.5 pb-2"
const tdClass = "border-r last:border-r-0 border-gray-100 dark:border-zinc-700 text-slate-500 dark:text-zinc-400"
const inputClass = "text-xs bg-transparent border-0 text-gray-800 dark:text-gray-100 focus:ring-indigo-500 placeholder:text-gray-300 dark:placeholder:text-zinc-500 w-full px-6 py-1.5"

const StaticTable = (props: StaticTableProps) => {
	const onCellCelected = (item: any, rowIndex: number) => {
		if (props.onRowSelected) {
			props.onRowSelected(item, rowIndex)
		}
	}

	return (
		<div className={props.className}>
			<table className={`table ${props.tableLayout === "fixed" ? "table-fixed" : "table-auto"} ${tableClass}`}>
				<thead className={theadClass}>
					<tr>
						{props.columns.map((column, index) => {
							return <th key={"column_header_" + index} className={`${thClass} ${column.className}`}>{column.header}</th>
						})}
					</tr>
				</thead>
				<tbody>
					{props.data.map((item, rowIndex) => {
						return (
							<tr key={props.rowKey(item, rowIndex)} className={trClass}>
								{props.columns.map((column, columnIndex) => {
									const value = column.field ? item[column.field] : item
									const cell: string | ReactNode = value || hasValue(value) ? (column.converter ? column.converter(value) : value.toString()) : ""
									if (typeof cell === "string") {
										return (
											<td key={"row_data_" + rowIndex + "_" + columnIndex} className={tdClass}>
												<input type="text" className={inputClass} defaultValue={cell} onFocus={(e) => onCellCelected(item, rowIndex)} readOnly />
											</td>
										)
									}
									else {
										return (
											<td key={"row_data_" + rowIndex + "_" + columnIndex} className={tdClass}>
												{cell}
											</td>
										)
									}
								})}
							</tr>
						)
					})}
				</tbody>
			</table>
		</div>
	)
}

export default StaticTable;