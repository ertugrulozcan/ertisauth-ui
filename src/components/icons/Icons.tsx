import { ReactElement } from "react"
import { Ertis } from "./Ertis"
import { TurkishFlag, UnitedKingdomFlag } from "./Flags"

import { 
	NewspaperIcon,
	PuzzleIcon,
	ViewListIcon,
	TranslateIcon,
	IdentificationIcon,
	ExclamationCircleIcon, 
	ExclamationIcon, 
	InformationCircleIcon, 
	TemplateIcon,
	MenuAlt3Icon,
	PhotographIcon,
	CodeIcon,
	FilmIcon,
	LibraryIcon,
	AdjustmentsIcon,
	MailIcon,
	SwitchHorizontalIcon,
	TagIcon
} from "@heroicons/react/solid"

import { 
	ContentAdd, 
	ContentSave,
	ActionSettingsOutlined, 
	DeviceLightModeOutlined,
	DeviceNightlight,
	ActionTranslate,
	CommunicationKey,
	SocialPeople, 
	ActionManageAccountsOutlined,
	ActionFingerprint, 
	ImageCircleOutlined,
	DeviceDevices,
	MapsMuseumOutlined,
	ActionLockClockOutlined,
	ActionWebhook,
	CommunicationHubOutlined,
	ActionEventOutlined,
	SocialPeopleAltOutlined,
	DeviceLanOutlined,
	EditorTextFields,
	FileTextSnippet,
	EditorDataObject,
	FileNewspaperOutlined,
	DevicePinOutlined,
	EditorNumbers,
	ToggleToggleOnOutlined,
	EditorFormatListBulletedOutlined,
	EditorChecklistRtlOutlined,
	ActionEditOffOutlined,
	ActionTodayOutlined,
	ActionScheduleOutlined,
	CommunicationAlternateEmailOutlined,
	ContentLinkOutlined,
	ActionHttpOutlined,
	ImagePaletteOutlined,
	MapsMapOutlined,
	FileAttachmentOutlined,
	DeviceSellOutlined,
	ImageTuneOutlined,
	ContentFilterList,
	ToggleRadioButtonChecked,
	ToggleRadioButtonUnchecked,
	HardwarePowerInput,
	ActionPermMedia
} from "./google/MaterialIcons"

export function getSvgIcon(name: string, className?: string | undefined): ReactElement {
	const defaultIconClass = className ? className : "w-4 h-4 stroke-neutral-700 dark:stroke-zinc-200"
	switch (name) {
		case "ertis":
			return (<Ertis />)
		case "tr-flag":
			return (<TurkishFlag className={defaultIconClass} />)
		case "en-flag":
			return (<UnitedKingdomFlag className={defaultIconClass} />)
		case "auth":
			return (<SocialPeopleAltOutlined className={defaultIconClass} />) 
		case "add":
			return (<ContentAdd className={defaultIconClass} />) 
		case "moon":
			return (<DeviceNightlight className={defaultIconClass} stroke="#3977ee" />) 
		case "sun":
			return (<DeviceLightModeOutlined className={defaultIconClass} fill="#ffa04d" />) 
		case "translate":
			return (<ActionTranslate className={defaultIconClass} />) 
		case "settings":
			return (<ActionSettingsOutlined className={defaultIconClass} />) 
		case "tune":
			return (<ImageTuneOutlined className={defaultIconClass} />) 
		case "radio-checked":
			return (<ToggleRadioButtonChecked className={defaultIconClass} />) 
		case "radio-unchecked":
			return (<ToggleRadioButtonUnchecked className={defaultIconClass} />) 
		case "tokens":
			return (<CommunicationKey className={defaultIconClass} />) 
		case "users":
			return (<SocialPeople className={defaultIconClass} />) 
		case "user-types":
			return (<ActionManageAccountsOutlined className={defaultIconClass} />) 
		case "roles":
			return (<ActionFingerprint className={defaultIconClass} />) 
		case "applications":
			return (<DeviceDevices className={defaultIconClass} />) 
		case "memberships":
			return (<MapsMuseumOutlined className={defaultIconClass} />) 
		case "sessions":
			return (<ActionLockClockOutlined className={defaultIconClass} />) 
		case "webhooks":
			return (<ActionWebhook className={defaultIconClass} />) 
		case "mailhooks":
			return (<MailIcon className={defaultIconClass} />) 
		case "providers":
			return (<CommunicationHubOutlined className={defaultIconClass} />) 
		case "events":
			return (<ActionEventOutlined className={defaultIconClass} />) 
		case "exclamination-triangle":
			return (<ExclamationIcon className={defaultIconClass} />) 
		case "exclamination-circle":
			return (<ExclamationCircleIcon className={defaultIconClass} />) 
		case "info-circle":
			return (<InformationCircleIcon className={defaultIconClass} />) 
		case "save":
			return (<ContentSave className={defaultIconClass} />) 
		case "filter":
			return (<ContentFilterList className={defaultIconClass} />) 
		case "power":
			return (<HardwarePowerInput className={defaultIconClass} />) 
		case "appearance":
			return (<AdjustmentsIcon className={defaultIconClass} />) 
			
		case "object-field":
			return (<DeviceLanOutlined className={defaultIconClass} />) 
		case "string-field":
			return (<EditorTextFields className={defaultIconClass} />) 
		case "integer-field":
			return (<DevicePinOutlined className={defaultIconClass} />) 
		case "float-field":
			return (<EditorNumbers className={defaultIconClass} />) 
		case "boolean-field":
			return (<ToggleToggleOnOutlined className={defaultIconClass} />) 
		case "array-field":
			return (<EditorFormatListBulletedOutlined className={defaultIconClass} />) 
		case "tags-field":
			return (<DeviceSellOutlined className={defaultIconClass} />) 
		case "enum-field":
			return (<EditorChecklistRtlOutlined className={defaultIconClass} />) 
		case "const-field":
			return (<ActionEditOffOutlined className={defaultIconClass} />) 
		case "json-field":
			return (<EditorDataObject className={defaultIconClass} />) 
		case "date-field":
			return (<ActionTodayOutlined className={defaultIconClass} />) 
		case "datetime-field":
			return (<ActionScheduleOutlined className={defaultIconClass} />) 
		case "longtext-field":
			return (<FileTextSnippet className={defaultIconClass} />) 
		case "richtext-field":
			return (<FileNewspaperOutlined className={defaultIconClass} />) 
		case "email-field":
			return (<CommunicationAlternateEmailOutlined className={defaultIconClass} />) 
		case "uri-field":
			return (<ContentLinkOutlined className={defaultIconClass} />) 
		case "hostname-field":
			return (<ActionHttpOutlined className={defaultIconClass} />) 
		case "color-field":
			return (<ImagePaletteOutlined className={defaultIconClass} />) 
		case "location-field":
			return (<MapsMapOutlined className={defaultIconClass} />) 
		case "code-field":
			return (<CodeIcon className={defaultIconClass} />) 
		case "image-field":
			return (<PhotographIcon className={defaultIconClass} />) 
		
		case "contents":
			return (<NewspaperIcon className={defaultIconClass} />) 
		case "content-types":
			return (<PuzzleIcon className={defaultIconClass} />) 
		case "collections":
			return (<ViewListIcon className={defaultIconClass} />) 
		case "pages":
			return (<TemplateIcon className={defaultIconClass} />) 
		case "nested-types":
			return (<MenuAlt3Icon className={defaultIconClass} />) 
		case "redirections":
			return (<SwitchHorizontalIcon className={defaultIconClass} />) 
		case "locales":
			return (<TranslateIcon className={defaultIconClass} />) 
		case "members":
			return (<IdentificationIcon className={defaultIconClass} />) 
		case "files":
			return (<PhotographIcon className={defaultIconClass} />) 
		case "tags":
			return (<TagIcon className={defaultIconClass} />) 
		default:
			return (<ImageCircleOutlined className="w-2 h-2 fill-neutral-700 dark:fill-zinc-200" />)
	}
}