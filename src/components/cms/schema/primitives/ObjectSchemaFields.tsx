import React, { useState } from "react"
import SchemaProperties from "../../SchemaProperties"
import { FieldInfo } from "../../../../models/schema/FieldInfo"
import { ObjectFieldInfo } from "../../../../models/schema/primitives/ObjectFieldInfo"
import { FieldInfoSchemaProps } from "../FieldInfoSchemaProps"
import { Guid } from "../../../../helpers/Guid"

const ObjectSchemaFields = (props: FieldInfoSchemaProps<ObjectFieldInfo>) => {
	const [properties, setProperties] = useState<FieldInfo[]>(props.fieldInfo.properties?.filter(x => x) ?? []);
	
	const onPropertiesChange = function(properties: FieldInfo[]) {
		setProperties(properties)

		let updatedFieldInfo: ObjectFieldInfo | null = null
		if (props.fieldInfo) {
			updatedFieldInfo = { ...props.fieldInfo, ["properties"]: properties }
		}
		
		if (props.onChange && updatedFieldInfo) {
			props.onChange(updatedFieldInfo)
		}
	}
	
	const onOrderChange = function(orderedProperties: FieldInfo[]) {
		onPropertiesChange(orderedProperties)
	}

	return (
		<div className="border border-borderline dark:border-borderlinedark rounded pt-2">
			<SchemaProperties 
				guid={props.fieldInfo.guid || Guid.Generate()}
				properties={properties} 
				ownerContentType={props.ownerContentType}
				session={props.session}
				onPropertiesChange={onPropertiesChange} 
				onOrderChange={onOrderChange}
				itemClass="flex items-center justify-between overflow-hidden border rounded-lg border-dashed py-2.5 px-4 mb-2 "
				itemClassIdle="bg-neutral-50/[0.5] dark:bg-[#272727] hover:bg-neutral-50 hover:dark:bg-zinc-700/[0.3] border-slate-300 dark:border-[#303132] hover:border-orange-600 hover:dark:border-orange-500 mx-6 "
				headerClass="pl-6 pr-5 " 
				isIntertwined={true}
			/>
		</div>
	)
}

export default ObjectSchemaFields;