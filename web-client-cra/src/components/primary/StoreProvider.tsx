import { configureStore } from "@reduxjs/toolkit"
import { createLogger } from "redux-logger"
import { ReactNode } from "react"
import { Provider } from "react-redux"
import rootReducer from "@reducers/root"

const logger = createLogger({
    collapsed: true,
    duration: true,
    timestamp: true
})

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => {
        const middleware = getDefaultMiddleware({ serializableCheck: false })
        if (process.env.NODE_ENV === "development") {
            return middleware.concat(logger)
        }
        return middleware
    },
    devTools: process.env.NODE_ENV === "development"
})

type ThemeProps = {
    children: ReactNode
}

const StoreProvider = ({ children }: ThemeProps) => {
    return <Provider store={store}>{children}</Provider>
}

export default StoreProvider
