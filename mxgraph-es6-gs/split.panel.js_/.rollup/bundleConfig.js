/**
 * export a function generating the custom configure object or export the custom configure object directly
 * the members of the custom configure as follow:
 * {
 *      entries: String || Array, // the input sources
 *      defaultConfigs: {
 *          // see the rollup document
 *      }
 * }
 */
const packageInfo = require("../package.json");

module.exports = function (predefinedConfigs) {
    predefinedConfigs.output.banner = `/**\n * split.panel.js -- version: ${packageInfo.version}\n * author: Season Studio\n * email: season-studio@outlook.com\n **/`;
    return {
        entries: {
            input: "./src/index.js",
            output: {
                file: "./dist/splitpanel.js"
            }
        }
    };
}
