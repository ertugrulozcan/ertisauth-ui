import { SvgIcon, SvgIconProps } from "./SvgIcon"

export const TurkishFlag = (props: SvgIconProps) => {
	return (
		<SvgIcon className={props.className} stroke={props.stroke} fill={props.fill} thickness={props.thickness} viewBox="0 0 640 480">
			<g xmlns="http://www.w3.org/2000/svg" fillRule="evenodd">
				<path fill="#e30a17" d="M0 0h640v480H0z"/>
				<path fill="#fff" d="M407 247.5c0 66.2-54.6 119.9-122 119.9s-122-53.7-122-120 54.6-119.8 122-119.8 122 53.7 122 119.9z"/>
				<path fill="#e30a17" d="M413 247.5c0 53-43.6 95.9-97.5 95.9s-97.6-43-97.6-96 43.7-95.8 97.6-95.8 97.6 42.9 97.6 95.9z"/>
				<path fill="#fff" d="m430.7 191.5-1 44.3-41.3 11.2 40.8 14.5-1 40.7 26.5-31.8 40.2 14-23.2-34.1 28.3-33.9-43.5 12-25.8-37z"/>
			</g>
		</SvgIcon>
	)
}

export const UnitedKingdomFlag = (props: SvgIconProps) => {
	return (
		<SvgIcon className={props.className} stroke={props.stroke} fill={props.fill} thickness={props.thickness} viewBox="0 0 640 480">
			<path fill="#012169" d="M0 0h640v480H0z"/>
			<path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"/>
			<path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z"/>
			<path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z"/>
			<path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z"/>
		</SvgIcon>
	)
}