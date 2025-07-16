import { combineReducers } from "redux"
import adminSlice from "./admin"
import appSlice from "./app"
import formSlice from "./form"
import homeSlice from "./home"

const rootReducer = combineReducers({
    admin: adminSlice,
    app: appSlice,
    form: formSlice,
    home: homeSlice
})

export default rootReducer
