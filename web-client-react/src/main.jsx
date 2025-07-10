import "semantic-ui-less/semantic.less"
import "./scss/app.scss"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import ReactDOM from "react-dom/client"
import HomePageLayout from "./pages/home"
import ThemeProvider from "./components/ThemeProvider/"

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
    <BrowserRouter>
        <ThemeProvider>
            <Routes>
                <Route path="/" exact element={<HomePageLayout />} />
                <Route path="/:slug" exact element={<HomePageLayout />} />
            </Routes>
        </ThemeProvider>
    </BrowserRouter>
)
