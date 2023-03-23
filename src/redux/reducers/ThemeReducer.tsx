import { createSlice } from "@reduxjs/toolkit"

const darkmodeStatus = typeof window !== 'undefined' ? localStorage.getItem('theme') : null

export const theme = createSlice({
	name: "theme",
	initialState: {
		value: darkmodeStatus,
	},
	reducers: {
		changeDarkMode: (state: { value: any; }, action: { payload: any; }) => {
			state.value = action.payload;
		},
	},
});

// Action creators are generated for each case reducer function
export const { changeDarkMode } = theme.actions;

export default theme.reducer;