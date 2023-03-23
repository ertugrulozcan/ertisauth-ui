import React from "react"
import PaginatedTable, { TableColumn } from "../layouts/pagination/paginated-table/PaginatedTable"
import { ErtisAuthConfiguration } from "../../configuration/ErtisAuthConfiguration"
import { PaginatedCollection } from "../layouts/pagination/PaginatedCollection"
import { PaginatedViewActions } from "../layouts/pagination/PaginationView"
import { SortDirection } from "../layouts/pagination/SortDirection"
import { ResourceBase } from "../../models/ResourceBase"
import { HttpMethod, RequestModel } from "../../models/RequestModel"
import { Session } from "../../models/auth/Session"
import { BearerToken } from "../../models/auth/BearerToken"
import { ExclamationIcon } from "@heroicons/react/solid"
import { useTranslations } from 'next-intl'

export interface ResourcePickerProps {
	api: "ertisauth"
	resource: string
	query?: any
	session: Session
	onLoad?(result: PaginatedCollection<any>): void
	onSelectedItemsChanged?(selectedItems: any[]): void
}

const ResourcePicker = (props: ResourcePickerProps) => {
	const gloc = useTranslations()

	const unique = function (item: ResourceBase<any>): number | string {
		return item._id
	}

	var tableActions: PaginatedViewActions
	const bindActions = function (actions: PaginatedViewActions): void {
		tableActions = actions
	}

	let url: string | undefined
	let columns: TableColumn<ResourceBase<any>>[] | undefined
	let errorMessage: string | undefined

	switch (props.api) {
		case "ertisauth": {
			const ertisAuthConfig = ErtisAuthConfiguration.fromEnvironment()
			const baseUrl = ertisAuthConfig.baseUrl
			const membershipId = ertisAuthConfig.membershipId

			switch (props.resource) {
				case "users": {
					url = `${baseUrl}/memberships/${membershipId}/users`
					columns = [
						{
							fieldName: '_id',
							title: gloc('Common.Id'),
							sortable: true
						},
						{
							fieldName: 'firstname',
							title: gloc('Auth.Users.FirstName'),
							sortable: true
						},
						{
							fieldName: 'lastname',
							title: gloc('Auth.Users.LastName'),
							sortable: true
						},
						{
							fieldName: 'username',
							title: gloc('Auth.Users.Username'),
							sortable: true
						},
						{
							fieldName: 'email_address',
							title: gloc('Common.Email'),
							sortable: true
						},
						{
							fieldName: 'role',
							title: gloc('Common.Role'),
							sortable: true
						}
					]
				}
				break;
				case "user-types": {
					url = `${baseUrl}/memberships/${membershipId}/user-types`
					columns = [
						{
							fieldName: '_id',
							title: gloc('Common.Id'),
							sortable: true
						},
						{
							fieldName: 'name',
							title: gloc('Common.Name'),
							sortable: true
						},
						{
							fieldName: 'description',
							title: gloc('Common.Description'),
							sortable: false
						}
					]
				}
				break;
				case "roles": {
					url = `${baseUrl}/memberships/${membershipId}/roles`
					columns = [
						{
							fieldName: '_id',
							title: gloc('Common.Id'),
							sortable: true
						},
						{
							fieldName: 'name',
							title: gloc('Common.Name'),
							sortable: true
						},
						{
							fieldName: 'description',
							title: gloc('Common.Description'),
							sortable: false
						}
					]
				}
				break;
				case "applications": {
					url = `${baseUrl}/memberships/${membershipId}/applications`
					columns = [
						{
							fieldName: '_id',
							title: gloc('Common.Id'),
							sortable: true
						},
						{
							fieldName: 'name',
							title: gloc('Common.Name'),
							sortable: true
						},
						{
							fieldName: 'role',
							title: gloc('Common.Role'),
							sortable: false
						}
					]
				}
				break;
				case "memberships": {
					url = `${baseUrl}/memberships`
					columns = [
						{
							fieldName: '_id',
							title: gloc('Common.Id'),
							sortable: true
						},
						{
							fieldName: 'name',
							title: gloc('Common.Name'),
							sortable: true
						}
					]
				}
				break;
				case "providers": {
					url = `${baseUrl}/memberships/${membershipId}/providers`
					columns = [
						{
							fieldName: '_id',
							title: gloc('Common.Id'),
							sortable: true
						},
						{
							fieldName: 'name',
							title: gloc('Common.Name'),
							sortable: true
						}
					]
				}
				break;
				case "webhooks": {
					url = `${baseUrl}/memberships/${membershipId}/webhooks`
					columns = [
						{
							fieldName: '_id',
							title: gloc('Common.Id'),
							sortable: true
						},
						{
							fieldName: 'name',
							title: gloc('Common.Name'),
							sortable: true
						}
					]
				}
				break;
				case "mailhooks": {
					url = `${baseUrl}/memberships/${membershipId}/mailhooks`
					columns = [
						{
							fieldName: '_id',
							title: gloc('Common.Id'),
							sortable: true
						},
						{
							fieldName: 'name',
							title: gloc('Common.Name'),
							sortable: true
						}
					]
				}
				break;
				default: {
					errorMessage = "Unknown ertisauth resource: " + props.resource
				}
				break;
			}
		}
		break;
		default: {
			errorMessage = "Unknown api: " + props.api
		}
		break;
	}

	if (url && columns) {
		const request: RequestModel = !props.query ? {
			url: url,
			method: HttpMethod.GET,
			headers: { 'Authorization': BearerToken.fromSession(props.session).toString() }
		}:
		{
			url: url + "/_query",
			method: HttpMethod.POST,
			headers: { 'Authorization': BearerToken.fromSession(props.session).toString() },
			body: props.query
		}

		return (
			<PaginatedTable
				cid={`ResourcePicker_${props.resource}`}
				api={request}
				columns={columns}
				pageSize={10}
				sortDirection={SortDirection.Desc}
				checkboxSelection={true}
				zebra={true}
				onLoad={props.onLoad}
				onCheckedItemsChanged={props.onSelectedItemsChanged}
				actions={bindActions}
				unique={unique}
				paginationBarMode="simplified">
			</PaginatedTable>
		)
	}
	else {
		return (
			<div className="flex flex-col items-center justify-center p-8">
				<ExclamationIcon className="w-12 h-12 fill-gray-600 dark:fill-zinc-400" />
				<span className="text-gray-600 dark:text-zinc-400 mt-2">{errorMessage}</span>
			</div>
		)
	}
}

export default ResourcePicker;