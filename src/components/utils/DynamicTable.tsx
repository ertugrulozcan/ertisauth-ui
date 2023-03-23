import React, { useState, useRef, createRef } from "react"
import { Switch } from "@headlessui/react"
import { PlusCircleIcon, XIcon } from "@heroicons/react/outline"

export interface DynamicTableColumn {
	header: string
	field: string
	type?: "input" | "toggle" | "text" | "custom"
	placeholder?: string
	className?: string
	component?(item: any, rowIndex: number): React.ReactNode
}

export type CellChangeInfo = {
	rowIndex: number, 
	field: string, 
	value: any
}

export interface DynamicTableProps {
	data: any[]
	columns: DynamicTableColumn[]
	className?: string
	onDataChange?: (data: any[], info?: CellChangeInfo) => void
}

const tableClass = "border-collapse table-auto text-sm w-full"
const theadClass = "bg-neutral-50 dark:bg-[#212123] sticky top-0 z-10"
const thClass = "border-b border-r last:border-r-0 border-gray-300 dark:border-zinc-600 font-medium text-slate-500 dark:text-zinc-200 text-xs text-left font-semibold leading-none px-5 py-3"
const tdClass = "border-b border-r last:border-r-0 border-gray-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 text-sm"
const inputClass = "text-sm bg-transparent border-0 text-gray-800 dark:text-gray-100 focus:ring-indigo-500 placeholder:text-gray-300 dark:placeholder:text-zinc-500 w-full px-5"

const generateDefaultValue = (column: DynamicTableColumn): any => {
	if (column.type) {
		if (column.type === "input" || column.type === "text") {
			return ""
		}
		else if (column.type === "toggle") {
			return false
		}
	}
	
	return null
}

const DynamicTable = (props: DynamicTableProps) => {
	const [data, setData] = useState<any[]>(props.data);
	const [newRowColumnIndex, setNewRowColumnIndex] = useState<number>(-1);

	const inputRefs = useRef<any[][]>([]);

	React.useMemo(() => {
		inputRefs.current = data.map((_, i) => {
			return props.columns.map((_, j) => {
				if (inputRefs.current[i] && inputRefs.current[i][j]) {
					return inputRefs.current[i][j]
				}
				else {
					return createRef<HTMLInputElement>()
				}
			})
		});
	}, [data]) // eslint-disable-line react-hooks/exhaustive-deps

	React.useEffect(() => {
		setData(props.data)
	}, [props.data]) // eslint-disable-line react-hooks/exhaustive-deps

	React.useEffect(() => {
		if (newRowColumnIndex !== -1) {
			const ref = inputRefs.current[data.length - 1][newRowColumnIndex] as React.RefObject<HTMLInputElement>
			ref?.current?.focus()
			setNewRowColumnIndex(-1)
		}
	}, [data]) // eslint-disable-line react-hooks/exhaustive-deps

	const generateRowInstance = (): any => {
		const instance: any = {}
		for (let column of props.columns) {
			instance[column.field] = generateDefaultValue(column)
		}

		return instance
	}

	const onInputValueChanged = (index: number, field: string, newValue: string) => {
		const updatedRow = { ...data[index], [field]: newValue }
		const updatedData = data.concat([])
		updatedData[index] = updatedRow
		setData(updatedData)

		if (props.onDataChange) {
			props.onDataChange(updatedData, {
				rowIndex: index, 
				field: field, 
				value: newValue
			})
		}
	}

	const onToggleValueChanged = (index: number, field: string, newValue: boolean) => {
		const updatedRow = { ...data[index], [field]: newValue }
		const updatedData = data.concat([])
		updatedData[index] = updatedRow
		setData(updatedData)

		if (props.onDataChange) {
			props.onDataChange(updatedData, {
				rowIndex: index, 
				field: field, 
				value: newValue
			})
		}
	}

	const onNewInputValueChanged = (field: string, value: string) => {
		const newRow = { ...generateRowInstance(), [field]: value }
		const updatedData = data.concat([newRow])
		setData(updatedData)
		setNewRowColumnIndex(props.columns.findIndex(x => x.field === field))

		if (props.onDataChange) {
			props.onDataChange(updatedData, {
				rowIndex: updatedData.length - 1, 
				field: field, 
				value: value
			})
		}
	}

	const deleteRow = (rowIndex: number) => {
		const updatedData = data.concat([])
		updatedData.splice(rowIndex, 1)
		setData(updatedData)

		if (props.onDataChange) {
			props.onDataChange(updatedData)
		}
	}

	return (
		<div className={props.className}>
			<table className={tableClass}>
				<thead className={theadClass}>
					<tr>
						<th className={thClass + " w-12"}></th>
						{props.columns.map((column, index) => {
							return <th key={"column_header_" + index} className={`${thClass} ${column.className}`}>{column.header}</th>
						})}
						<th className={thClass + " w-12"}></th>
					</tr>
				</thead>
				<tbody>
					{data.map((item, rowIndex) => {
						return (
							<tr key={"row_" + rowIndex}>
								<td className={tdClass}></td>
								{props.columns.map((column, columnIndex) => {
									const columnType = column.type || "input"
									const value = column.field === "rowNo" ? (rowIndex + 1) : item[column.field]
									
									return (
										<td key={"row_data_" + rowIndex + "_" + columnIndex} className={tdClass}>
											{
												{
													"input" :
													<input type="text" className={inputClass} value={value?.toString() || ""} onChange={(e) => onInputValueChanged(rowIndex, column.field, e.currentTarget.value)} ref={inputRefs.current[rowIndex][columnIndex]} />,
													"toggle" :
													<div className="flex items-center justify-center">
														<Switch checked={value} onChange={(checked: boolean) => onToggleValueChanged(rowIndex, column.field, checked)} className={`${value ? 'bg-green-700' : 'bg-gray-200 dark:bg-gray-400'} relative inline-flex items-center rounded-full h-6 w-11 mt-0.5`}>
															<span className={`${value ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white`} />
														</Switch>
													</div>,
													"text" :
													<span className="text-slate-500 dark:text-zinc-400 text-sm px-5">{value || ""}</span>,
													"custom": 
													<>{column.component ? column.component(item, rowIndex) : <></>}</>
												} [columnType]
											}
										</td>
									)
								})}
								<td className={tdClass}>
									<div className="flex justify-center">
										<button onClick={() => deleteRow(rowIndex)} className="flex items-center justify-center stroke-slate-500 dark:stroke-zinc-500 hover:stroke-red-500 hover:dark:stroke-rose-500 active:stroke-red-600 active:dark:stroke-rose-600 mt-px mr-px">
											<XIcon className="w-5 h-5 stroke-inherit dark:stroke-inherit" />
										</button>
									</div>
								</td>
							</tr>
						)
					})}

					<tr>
						<td className={tdClass}>
							<div className="flex justify-center">
								<PlusCircleIcon className="w-6 h-6 stroke-slate-400 dark:stroke-zinc-600" />
							</div>
						</td>
						{props.columns.map((column, columnIndex) => {
							const columnType = column.type || "input"
							const value = column.field === "rowNo" ? (data.length + 1) : generateDefaultValue(column)
							return (
								<td key={"new_row_data_" + columnIndex} className={tdClass}>
									{
										{
											"input" :
											<input type="text" className={inputClass} value={""} onChange={(e) => onNewInputValueChanged(column.field, e.currentTarget.value)} placeholder={column.placeholder} />,
											"toggle" :
											<div className="flex items-center justify-center">
												<Switch checked={false} onChange={(checked: boolean) => {}} className="bg-gray-200 dark:bg-gray-400 relative inline-flex items-center rounded-full h-6 w-11 mt-0.5">
													<span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
												</Switch>
											</div>,
											"text" :
											<span className="text-slate-500 dark:text-zinc-400 text-sm px-5">{value}</span>,
											"custom": 
											<></>
										} [columnType]
									}
								</td>
							)
						})}
						<td className={tdClass}></td>
					</tr>
				</tbody>
			</table>
		</div>
	)
}

export default DynamicTable;