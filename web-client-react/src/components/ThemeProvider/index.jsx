import { configureStore } from "@reduxjs/toolkit"
import { createLogger } from "redux-logger"
import { Provider } from "react-redux"
import rootReducer from "../../reducers/root"
import * as thunk from "redux-thunk"
import PropTypes from "prop-types"

const logger = createLogger({
    collapsed: true,
    duration: true,
    timestamp: true
})

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk }).concat(logger),
    devTools: import.meta.env.VITE_API_NODE_ENV === "development"
})

const ThemeProvider = ({ children }) => {
    return <Provider store={store}>{children}</Provider>
}

ThemeProvider.propTypes = {
    children: PropTypes.element
}

export default ThemeProvider
