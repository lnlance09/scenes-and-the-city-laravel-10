import { combineReducers } from "redux"
import appSlice from "./app"
import formSlice from "./form"
import homeSlice from "./home"

const rootReducer = combineReducers({
    app: appSlice,
    form: formSlice,
    home: homeSlice
})

export default rootReducer
