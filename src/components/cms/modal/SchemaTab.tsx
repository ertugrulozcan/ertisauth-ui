import React from "react"
import FieldInfoSchemaWrapper from "../schema/FieldInfoSchemaWrapper"
import { BaseTabProps } from "./BaseTabProps"

type SchemaTabProps = {
	
}

const SchemaTab = (props: SchemaTabProps & BaseTabProps) => {
	return (
		<div className="relative max-h-[calc(70vh-63px)] overflow-hidden overflow-y-scroll px-9 pt-9 pb-8">
			<FieldInfoSchemaWrapper 
				fieldInfo={props.fieldInfo} 
				ownerContentType={props.ownerContentType}
				payload={props.fieldInfo} 
				session={props.session}
				onChange={props.onChange}
				mode={props.mode} />
		</div>
	)
}

export default SchemaTab;