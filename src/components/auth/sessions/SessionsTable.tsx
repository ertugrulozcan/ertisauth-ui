import React, { useState } from "react"
import PaginatedTable, { TableColumn } from "../../layouts/pagination/paginated-table/PaginatedTable"
import dayjs from 'dayjs'
import { DateTimeHelper } from "../../../helpers/DateTimeHelper"
import { ErtisAuthConfiguration } from "../../../configuration/ErtisAuthConfiguration"
import { Modal, Tooltip, message } from 'antd'
import { Styles } from "../../Styles"
import { DuplicateIcon } from "@heroicons/react/outline"
import { Session } from '../../../models/auth/Session'
import { BearerToken } from "../../../models/auth/BearerToken"
import { ActiveToken } from '../../../models/auth/ActiveToken'
import { SortDirection } from "../../layouts/pagination/SortDirection"
import { HttpMethod, RequestModel } from "../../../models/RequestModel"
import { useTranslations } from 'next-intl'

import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

type SessionsTableProps = {
	session: Session
	unlocatedUserCount?: number
}

export const SessionsTable: React.FC<SessionsTableProps> = (props) => {
	const [selectedActiveToken, setSelectedActiveToken] = useState<ActiveToken>();
	const [summaryModalVisibility, setSummaryModalVisibility] = useState<boolean>(false);

	const loc = useTranslations('Auth.Sessions')
	const gloc = useTranslations()

	const ertisAuthConfig = ErtisAuthConfiguration.fromEnvironment()
	const api: RequestModel = {
		url: `${ertisAuthConfig.baseUrl}/memberships/${ertisAuthConfig.membershipId}/active-tokens`,
		method: HttpMethod.GET,
		headers: { 'Authorization': BearerToken.fromSession(props.session).toString() }
	}

	const columns: TableColumn<ActiveToken>[] = [
		{
			fieldName: 'first_name',
			title: loc('Name'),
			sortable: false,
			render: (x) => {
				const now = dayjs.utc(new Date())
				const elapsedTime = now.diff(dayjs.utc(x.created_at))
				const remainingTime = dayjs.utc(x.expire_time).diff(now)
				const isExpired = remainingTime <= 0
				const isCurrentSession = props.session?.token?.access_token === x.access_token
				
				return (
					<div className="flex items-center justify-between h-9">
						<span className="relative">
							<span className="flex h-3.5 w-3.5">
								{isCurrentSession ? 
								<>
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50"></span>
									<span className="relative inline-flex rounded-full h-2.5 w-2.5 m-0.5 bg-green-500"></span>
								</> : 
								<>
								{isExpired ? 
									<span className="relative inline-flex rounded-full h-2.5 w-2.5 m-0.5 bg-red-500"></span> : 
									<span className="relative inline-flex rounded-full h-2.5 w-2.5 m-0.5 bg-green-500"></span>}
								</>}
							</span>
						</span>

						<label className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-none ml-4">{`${x.first_name} ${x.last_name}`}</label>
					</div>
				)
			}
		},
		{
			fieldName: 'client_info.geo_location.city',
			title: loc('City'),
			sortable: false
		}
	]

	const unique = function (item: ActiveToken): number | string {
		return item.access_token
	}

	const onItemSelected = (selected: ActiveToken) => {
		if (selected) {
			setSelectedActiveToken(selected)
			setSummaryModalVisibility(true)
		}
	}

	const handleOkCancel = () => {
		setSelectedActiveToken(undefined)
		setSummaryModalVisibility(false)
	}

	const copyToClipboardAccessToken = (selectedActiveToken: ActiveToken) => {
		navigator.permissions.query({ name: "clipboard-write" as PermissionName })
		.then((result) => {
			if (result.state === "granted" || result.state === "prompt") {
				navigator.clipboard.writeText(selectedActiveToken.access_token).then(
					() => {
						message.success('Copied!');
					},
					() => {
						message.error('Copy failed!');
					}
				)
			}
		})
	}

	const tableClass = "flex-1 border-collapse table-fixed mx-6"
	const trClass = "border-b border-gray-300 dark:border-zinc-700 last:border-b-0"
	const tdClass = "px-6 py-3"
	const headCellClass = "text-slate-500 dark:text-zinc-400"
	const textCellClass = "text-slate-800 dark:text-zinc-50"
 
	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between border-b border-borderline dark:border-borderlinedark pl-5 pr-4 py-3.5">
				<span className="font-semibold text-slate-600 dark:text-zinc-100 text-xs mr-8">{loc("ActiveUsers")}</span>
				{props.unlocatedUserCount ?
				<span className="text-xs text-slate-400 dark:text-zinc-300 pt-1">{`${loc("UnlocatedUsers")}: ${props.unlocatedUserCount}`}</span>:
				<></>}
			</div>

			<div className="flex-1">
				<PaginatedTable
					cid="active-sessions"
					api={api}
					columns={columns}
					pageSize={20}
					orderBy={'created_at'}
					sortDirection={SortDirection.Desc}
					zebra={true}
					firstColumnClass="first:pl-1.5"
					unique={unique}
					paginationBarMode="simplified"
					onItemSelected={onItemSelected}>
				</PaginatedTable>
			</div>

			<Modal
				open={summaryModalVisibility}
				className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700"
				onOk={handleOkCancel}
				onCancel={handleOkCancel}
				width={"32rem"}
				closable={false}
				maskClosable={true}
				title={<div className="px-6 py-3"><span className="text-slate-600 dark:text-zinc-300">{loc("SessionInfo")}</span></div>}
				footer={[
					(<button key="okButton" type="button" onClick={handleOkCancel} className={Styles.button.warning + " justify-center min-w-[7rem] py-1.5 px-4"}>{gloc('Actions.Ok')}</button>)
				]}>
				<div className="flex flex-col border-y border-zinc-300 dark:border-zinc-700 max-h-[70vh] overflow-scroll pt-2 pb-10">
					{selectedActiveToken ? 
					<>
					<table className={tableClass}>
						<tbody>
							<tr className={trClass}>
								<td className={tdClass}><span className={headCellClass}>{loc("UserId")}</span></td>
								<td className={tdClass}><span className={textCellClass}>{selectedActiveToken.user_id}</span></td>
							</tr>
							<tr className={trClass}>
								<td className={tdClass}><span className={headCellClass}>{loc("FirstName")}</span></td>
								<td className={tdClass}><span className={textCellClass}>{selectedActiveToken.first_name}</span></td>
							</tr>
							<tr className={trClass}>
								<td className={tdClass}><span className={headCellClass}>{loc("LastName")}</span></td>
								<td className={tdClass}><span className={textCellClass}>{selectedActiveToken.last_name}</span></td>
							</tr>
							<tr className={trClass}>
								<td className={tdClass}><span className={headCellClass}>{loc("Username")}</span></td>
								<td className={tdClass}><span className={textCellClass}>{selectedActiveToken.username}</span></td>
							</tr>
							<tr className={trClass}>
								<td className={tdClass}><span className={headCellClass}>{loc("EmailAddress")}</span></td>
								<td className={tdClass}><span className={textCellClass}>{selectedActiveToken.email_address}</span></td>
							</tr>
							<tr className={trClass}>
								<td className={tdClass}><span className={headCellClass}>{loc("SessionStart")}</span></td>
								<td className={tdClass}><span className={textCellClass}>{dayjs.utc(selectedActiveToken.created_at).add(-(new Date().getTimezoneOffset()) * 60 * 1000).format(DateTimeHelper.HUMAN_READABLE_DATE_TIME_FORMAT)}</span></td>
							</tr>
							<tr className={trClass}>
								<td className={tdClass}><span className={headCellClass}>{loc("SessionEnd")}</span></td>
								<td className={tdClass}><span className={textCellClass}>{dayjs.utc(selectedActiveToken.expire_time).add(-(new Date().getTimezoneOffset()) * 60 * 1000).format(DateTimeHelper.HUMAN_READABLE_DATE_TIME_FORMAT)}</span></td>
							</tr>
							{selectedActiveToken.client_info ? 
							<>
							<tr className={trClass}>
								<td className={tdClass}><span className={headCellClass}>{gloc("Auth.Users.Sessions.IPAddress")}</span></td>
								<td className={tdClass}><span className={textCellClass}>{selectedActiveToken.client_info.ip_address}</span></td>
							</tr>

							{selectedActiveToken.client_info.geo_location ? 
							<>
							<tr className={trClass}>
								<td className={tdClass}><span className={headCellClass}>{gloc("Auth.Users.Sessions.Location.Country")}</span></td>
								<td className={tdClass}><span className={textCellClass}>{`${selectedActiveToken.client_info.geo_location.country} (${selectedActiveToken.client_info.geo_location.country_code})`}</span></td>
							</tr>
							<tr className={trClass}>
								<td className={tdClass}><span className={headCellClass}>{gloc("Auth.Users.Sessions.Location.City")}</span></td>
								<td className={tdClass}><span className={textCellClass}>{selectedActiveToken.client_info.geo_location.city}</span></td>
							</tr>
							<tr className={trClass}>
								<td className={tdClass}><span className={headCellClass}>{gloc("Auth.Users.Sessions.Location.ZipCode")}</span></td>
								<td className={tdClass}><span className={textCellClass}>{selectedActiveToken.client_info.geo_location.postal_code}</span></td>
							</tr>
							<tr className={trClass}>
								<td className={tdClass}><span className={headCellClass}>{gloc("Auth.Users.Sessions.Location.ISP")}</span></td>
								<td className={tdClass}><span className={textCellClass}>{`${selectedActiveToken.client_info.geo_location.isp_domain} ${selectedActiveToken.client_info.geo_location.isp ?? ""}`}</span></td>
							</tr>
							<tr className={trClass}>
								<td className={tdClass}><span className={headCellClass}>{gloc("Auth.Users.Sessions.Location.Latitude")}</span></td>
								<td className={tdClass}><span className={textCellClass}>{selectedActiveToken.client_info.geo_location.location.latitude}</span></td>
							</tr>
							<tr className={trClass}>
								<td className={tdClass}><span className={headCellClass}>{gloc("Auth.Users.Sessions.Location.Longitude")}</span></td>
								<td className={tdClass}><span className={textCellClass}>{selectedActiveToken.client_info.geo_location.location.longitude}</span></td>
							</tr>
							</> : 
							<></>}
							</> : 
							<></>}
							<tr className={trClass}>
								<td className={tdClass}><span className={headCellClass}>Token</span></td>
								<td className={tdClass + " pr-1"}>
									<div className="flex items-center justify-between">
										<span className={textCellClass + " pb-0.5"}>{selectedActiveToken.access_token.substring(0, 32) + "..."}</span>
										<Tooltip title={gloc("Actions.CopyToClipboard")}>
											<button type="button" onClick={() => copyToClipboardAccessToken(selectedActiveToken)} className="stroke-neutral-500 dark:stroke-zinc-400 hover:stroke-slate-700 hover:dark:stroke-zinc-50 border border-transparent dark:border-transparent hover:border-gray-400 hover:dark:border-zinc-700 active:bg-gray-50 active:dark:bg-zinc-800 rounded p-1">
												<DuplicateIcon className="w-6 h-6 stroke-inherit" />
											</button>
										</Tooltip>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
					</>: 
					<></>}
				</div>
			</Modal>
		</div>
	)	
}