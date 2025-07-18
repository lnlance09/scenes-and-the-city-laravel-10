import { defineConfig } from "vite"
import { nodePolyfills } from "vite-plugin-node-polyfills"
import path from "path"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"

// https://vite.dev/config/
export default defineConfig({
    define: {
        global: "globalThis" // Or _global: ({})
    },
    plugins: [svgr(), react(), nodePolyfills()],
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
            ),
            util: "node:util"
        }
    }
})
