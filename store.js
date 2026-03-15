import { configureStore } from '@reduxjs/toolkit'
import { mainApi } from './services/mainApi'

import accountData from './slices/accountData'

const combineReducers = {
  accountData: accountData,
  [mainApi.reducerPath]: mainApi.reducer,
}

export const store = configureStore({
  reducer: combineReducers,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(mainApi.middleware),
})
