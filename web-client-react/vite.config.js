import { defineConfig } from "vite"
import { nodePolyfills } from "vite-plugin-node-polyfills"
import rollupNodePolyFill from "rollup-plugin-node-polyfills"
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill"
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill"
import path from "path"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        svgr(),
        react(),
        // rollupNodePolyFill(),
        nodePolyfills({
            exclude: [],
            globals: {
                Buffer: true, // can also be 'build', 'dev', or false
                global: true,
                process: true
            },

            protocolImports: true
        })
    ],
    optimizeDeps: {
        esbuildOptions: {
            // Node.js global to browser globalThis
            define: {
                global: "globalThis"
            },
            // Enable esbuild polyfill plugins
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    process: true,
                    buffer: true
                }),
                NodeModulesPolyfillPlugin()
            ]
        }
    },
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
            "axios/lib": path.resolve(
                // eslint-disable-next-line
                __dirname,
                "node_modules/axios/lib"
            ),
            util: "rollup-plugin-node-polyfills/polyfills/util",
            sys: "util",
            zlib: "rollup-plugin-node-polyfills/polyfills/zlib"
        }
    }
})
