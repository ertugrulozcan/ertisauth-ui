import { createSlice } from "@reduxjs/toolkit"
import { Session } from "../../models/auth/Session"

const initialSessionState: Session = {
	token: {
		token_type: "",
		refresh_token: "",
		refresh_token_expires_in: 0,
		access_token: "",
		expires_in: 0,
		created_at: new Date()
	},
	user: {
		_id: "",
		firstname: "",
		lastname: "",
		fullname: "",
		username: "",
		email_address: "",
		role: "",
		membership_id: "",
	}
}

export const session = createSlice({
	name: "session",
	initialState: {
		value: initialSessionState,
	},
	reducers: {
		setSession: (state: { value: any; }, action: { payload: any; }) => {
			state.value = action.payload;
		},
	},
});

// Action creators are generated for each case reducer function
export const { setSession } = session.actions;

export default session.reducer;