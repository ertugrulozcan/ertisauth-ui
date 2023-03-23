import React from "react"
import { Tooltip } from "antd"
import { useTranslations } from 'next-intl'
import {
	FacebookShareButton,
	LinkedinShareButton,
	TwitterShareButton,
	EmailShareButton,
	FacebookIcon,
	TwitterIcon,
	LinkedinIcon,
	EmailIcon
} from "react-share"

const buttonClass = "outline outline-none hover:outline-orange-500 rounded-sm overflow-hidden"

type SocialMediaShareProps = {
	shareUrl: string,
	title: string,
	description: string,
	className?: string
}

const SocialMediaShare = (props: SocialMediaShareProps) => {
	const gloc = useTranslations()

	return (
		<div className={`grid grid-cols-4 gap-4 w-fit ${props.className || ""}`}>
			<Tooltip title={gloc("SocialMedia.ShareOnFacebook")} placement="bottom">
				<FacebookShareButton url={props.shareUrl} quote={props.title} className={buttonClass}>
					<FacebookIcon size={32} />
				</FacebookShareButton>
			</Tooltip>

			<Tooltip title={gloc("SocialMedia.ShareOnTwitter")} placement="bottom">
				<TwitterShareButton url={props.shareUrl} title={props.title} className={buttonClass}>
					<TwitterIcon size={32} />
				</TwitterShareButton>
			</Tooltip>

			<Tooltip title={gloc("SocialMedia.ShareOnLinkedin")} placement="bottom">
				<LinkedinShareButton url={props.shareUrl} className={buttonClass}>
					<LinkedinIcon size={32} />
				</LinkedinShareButton>
			</Tooltip>

			<Tooltip title={gloc("SocialMedia.ShareAsEmail")} placement="bottom">
				<EmailShareButton url={props.shareUrl} subject={props.title} body={props.description} className={buttonClass}>
					<EmailIcon size={32} />
				</EmailShareButton>
			</Tooltip>
		</div>
	);
}

export default SocialMediaShare;