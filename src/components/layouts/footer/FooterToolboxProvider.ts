import { Service } from 'typedi'

@Service()
export class FooterToolboxProvider {
	private toolbox: React.ReactNode | null = null
	
	setToolbox(toolbox: React.ReactNode | null): void {
		this.toolbox = toolbox
	}

	getToolbox(): React.ReactNode | null {
		return this.toolbox
	}

	resetToolbox(): void {
		this.toolbox = null
	}
}