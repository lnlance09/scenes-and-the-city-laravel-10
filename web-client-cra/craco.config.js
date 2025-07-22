const CracoLessPlugin = require("craco-less")
const path = require("path")

module.exports = {
    plugins: [
        {
            plugin: CracoLessPlugin,
            options: {
                lessLoaderOptions: {
                    lessOptions: {
                        math: "always",
                        relativeUrls: true,
                        javascriptEnabled: true
                    }
                }
            }
        }
    ],
    webpack: {
        alias: {
            "../../theme.config": path.resolve(
                // eslint-disable-next-line
                __dirname,
                "./src/semantic-ui/theme.config"
            ),
            "./themes/default/elements/themes/default/*": path.resolve(
                // eslint-disable-next-line
                __dirname,
                "./src/semantic-ui/themes/default/*"
            ),
            "./definitions/elements/themes/default/*": path.resolve(
                // eslint-disable-next-line
                __dirname,
                "./src/semantic-ui/themes/default/*"
            ),
            "@": path.resolve(__dirname, "src/"),
            "@assets": path.resolve(__dirname, "src/assets/"),
            "@components": path.resolve(__dirname, "src/components/"),
            "@images": path.resolve(__dirname, "src/images/"),
            "@interfaces": path.resolve(__dirname, "src/interfaces/"),
            "@options": path.resolve(__dirname, "src/options/"),
            "@pages": path.resolve(__dirname, "src/pages/"),
            "@reducers": path.resolve(__dirname, "src/reducers/"),
            "@states": path.resolve(__dirname, "src/states/"),
            "@utils": path.resolve(__dirname, "src/utils/")
        }
    }
}
