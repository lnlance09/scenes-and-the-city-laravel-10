import { configureStore } from "@reduxjs/toolkit"
import { ReactNode } from "react"
import { Provider } from "react-redux"
import rootReducer from "@reducers/root"

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => {
        const middleware = getDefaultMiddleware({ serializableCheck: false })
        return middleware
    },
    devTools: false
})

type ThemeProps = {
    children: ReactNode
}

const StoreProvider = ({ children }: ThemeProps) => {
    return <Provider store={store}>{children}</Provider>
}

export default StoreProvider
