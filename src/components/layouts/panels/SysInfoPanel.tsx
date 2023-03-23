import React, { Fragment } from 'react'
import { DateTimeHelper, FormatType } from '../../../helpers/DateTimeHelper'
import { Styles } from '../../Styles'
import { SysModel } from '../../../models/SysModel'
import { useLang } from '../../../localization/LocalizationProvider'
import { useTranslations } from 'next-intl'

type SysInfoPanelProps = {
	sys: SysModel
};

const SysInfoPanel: React.FC<SysInfoPanelProps> = ({ sys }) => {
	const selectedLocale = useLang()
	const gloc = useTranslations()

	return (
		<Fragment>
			<div className="mb-5">
				<label className={Styles.label.default}>{gloc('Sys.CreatedAt')}</label>
				<span className={Styles.text.subtext}>{DateTimeHelper.format(sys.created_at, FormatType.HrmDateTime, selectedLocale.languageCode)}</span>
			</div>

			<div className="mb-5">
				<label className={Styles.label.default}>{gloc('Sys.CreatedBy')}</label>
				<span className={Styles.text.subtext}>{sys.created_by}</span>
			</div>

			{sys.modified_at ?
				<div className="mb-5">
					<label className={Styles.label.default}>{gloc('Sys.ModifiedAt')}</label>
					<span className={Styles.text.subtext}>{DateTimeHelper.format(sys.modified_at, FormatType.HrmDateTime, selectedLocale.languageCode)}</span>
				</div> :
				<></>}

			{sys.modified_by ?
				<div className="mb-5">
					<label className={Styles.label.default}>{gloc('Sys.ModifiedBy')}</label>
					<span className={Styles.text.subtext}>{sys.modified_by}</span>
				</div> :
				<></>}
		</Fragment>
	);
};

export default SysInfoPanel;