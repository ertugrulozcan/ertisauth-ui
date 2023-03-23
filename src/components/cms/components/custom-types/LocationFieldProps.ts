import { Coordinate } from "../../../../models/auth/GeoLocationInfo"
import { LocationFieldInfo } from "../../../../models/schema/custom-types/LocationFieldInfo"
import { FieldComponentProps } from "../FieldComponentProps"
import { FieldInfoComponentProps } from "../FieldInfoComponentProps"

export interface LocationFieldProps extends FieldInfoComponentProps<LocationFieldInfo, Coordinate>, FieldComponentProps {
	
}