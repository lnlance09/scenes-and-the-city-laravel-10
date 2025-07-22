import "semantic-ui-less/semantic.less"
import "./scss/app.scss"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import ReactDOM from "react-dom/client"
import AdminPage from "./pages/admin"
import HomePage from "./pages/index"
import ThemeProvider from "@components/primary/StoreProvider"

const el = document.getElementById("root")
if (el) {
    const root = ReactDOM.createRoot(el)
    root.render(
        <BrowserRouter>
            <ThemeProvider>
                <Routes>
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/" element={<HomePage />} />
                    <Route path="/:slug" element={<HomePage />} />
                </Routes>
            </ThemeProvider>
        </BrowserRouter>
    )
}
