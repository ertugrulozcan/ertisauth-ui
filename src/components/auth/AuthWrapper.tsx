import React from 'react'
import { ReduxStore } from '../../redux/ReduxStore'
import { Session } from '../../models/auth/Session'

type AuthWrapperProps = {
	children: React.ReactNode
	onSessionChange?: (session: Session) => void
};

const AuthWrapper: React.FC<AuthWrapperProps> = (props: AuthWrapperProps) => {
	ReduxStore.subscribe(() => {
		const state = ReduxStore.getState()
		if (props && props.onSessionChange) {
			props.onSessionChange(state.session.value)
		}
	})
	
	return (
		<>
			{props.children}
		</>
	);
}

export default AuthWrapper