import { createWrapper } from 'next-redux-wrapper'
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { reduxBatch } from '@manaflair/redux-batch'
import { persistStore } from 'redux-persist'
import { combineReducers } from 'redux'
import { loadingBarReducer } from 'react-redux-loading-bar'
import sessionReducer from './reducers/SessionReducer'
import themeReducer from './reducers/ThemeReducer'
import createSagaMiddleware from 'redux-saga'

export const rootReducer = combineReducers({
	session: sessionReducer,
	theme: themeReducer,
	loadingBar: loadingBarReducer
})

export type RootState = ReturnType<typeof rootReducer>

export function* rootSaga() {
	//yield all([auth.saga()])
}

const sagaMiddleware = createSagaMiddleware()
const middleware = [
	...getDefaultMiddleware({
		immutableCheck: false,
		serializableCheck: false,
		thunk: true,
	}),
	sagaMiddleware,
]

export const ReduxStore = configureStore({
	reducer: {
		session: sessionReducer,
		theme: themeReducer,
		loadingBar: loadingBarReducer
	},
	middleware,
	devTools: process.env.NODE_ENV !== 'production',
	enhancers: [reduxBatch],
})

export const persistor = persistStore(ReduxStore)
sagaMiddleware.run(rootSaga)

export type AppDispatch = typeof ReduxStore.dispatch
export type AppStore = ReturnType<typeof makeStore>;
const makeStore = () => ReduxStore;
export const wrapper = createWrapper<AppStore>(makeStore);