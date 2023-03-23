import React from "react"
import { Tooltip } from 'antd'
import { getSvgIcon } from '../icons/Icons'

declare type TooltipPlacement = 'top' | 'left' | 'right' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom';

type SvgButtonProps = {
	icon: string,
	tooltip?: string,
	tooltipPlacement?: TooltipPlacement | undefined,
	className?: string
};

export class SvgButton extends React.Component<SvgButtonProps> {
	render() {
		if (this.props.tooltip) {
			var placement: TooltipPlacement | undefined = 'top'
			if (this.props.tooltipPlacement) {
				placement = this.props.tooltipPlacement
			}

			return (
				<Tooltip placement={placement} title={this.props.tooltip}>
					<div>
						{getSvgIcon(this.props.icon, this.props.className)}
					</div>
				</Tooltip>
			)
		}
		else {
			return (
				<div>
					{getSvgIcon(this.props.icon, this.props.className)}
				</div>
			)
		}
	}
}

export default SvgButton;