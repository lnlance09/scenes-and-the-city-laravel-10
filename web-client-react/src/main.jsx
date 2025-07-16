import "semantic-ui-less/semantic.less"
import "./scss/app.scss"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import ReactDOM from "react-dom/client"
import AdminPage from "./pages/admin"
import HomePage from "./pages/home"
import ThemeProvider from "./components/ThemeProvider/"

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
    <BrowserRouter>
        <ThemeProvider>
            <Routes>
                <Route path="/admin" exact element={<AdminPage />} />
                <Route path="/" exact element={<HomePage />} />
                <Route path="/:slug" exact element={<HomePage />} />
            </Routes>
        </ThemeProvider>
    </BrowserRouter>
)
