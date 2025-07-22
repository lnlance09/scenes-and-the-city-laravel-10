import { configureStore } from "@reduxjs/toolkit"
import { createLogger } from "redux-logger"
import { ReactNode } from "react"
import { Provider } from "react-redux"
import rootReducer from "@reducers/root"
// import thunk from "redux-thunk"

const logger = createLogger({
    collapsed: true,
    duration: true,
    timestamp: true
})

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }).concat(logger),
    devTools: process.env.NODE_ENV === "development"
})

type ThemeProps = {
    children: ReactNode
}

const StoreProvider = ({ children }: ThemeProps) => {
    return <Provider store={store}>{children}</Provider>
}

export default StoreProvider
