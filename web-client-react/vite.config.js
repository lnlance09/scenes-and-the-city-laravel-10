import { defineConfig } from "vite"
import path from "path"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"

// https://vite.dev/config/
export default defineConfig({
    plugins: [svgr(), react()],
    css: {
        preprocessorOptions: {
            less: {
                math: "always",
                relativeUrls: true,
                javascriptEnabled: true
            }
        }
    },
    resolve: {
        mainFields: [],
        // semantic-ui theming requires the import path of theme.config to be rewritten to our local theme.config file
        alias: {
            "../../theme.config": path.resolve(
                // eslint-disable-next-line
                __dirname,
                "./src/semantic-ui/theme.config"
            )
        }
    }
})
