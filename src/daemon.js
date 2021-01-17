const path = require("path");
const {ConfigFile} = require("ijo-utils");
const PanelHandler = require("./net/panel/handler");
const AuthHandler = require("./auth/handler");

/**
 * This is the core class for the daemon for IJO. It initializes, starts and stops the daemon.
 */
class Daemon {
    constructor() {
        /**
         * The configuration file containing the options for the daemon.
         * @type {ConfigFile}
         */
        this.config = new ConfigFile(path.join(this.root, "./config.json"), {defaults: {
            name: "test",
            panel: {host: "localhost", port: 8081},
            auth: {}
        }});
        /**
         * The handler that handles the connection with the panel.
         * @type {PanelHandler}
         */
        this.panelHandler = new PanelHandler();
        /**
         * The handler that authenticates the daemon with the panel.
         */
        this.authHandler = new AuthHandler();
    }

    /**
     * Returns the the root directory for the daemon.
     * @returns {String} The root directory.
     */
    get root() {
        return path.join(path.dirname(require.main.filename), "../");
    }

    /**
     * Initializes the daemon.
     * @returns {Promise} A promise that resolves when the daemon has been initialized.
     */
    async initialize() {
        await this.config.load().catch(e => {throw e});
        this.name = this.config.get("name");
        this.version = process.env.npm_package_version;
        this.panelHandler.initialize({config: this.config.get("panel"), name: this.name});
        this.authHandler.initialize({panelHandler: this.panelHandler, config: this.config.get("auth")});
    }

    /**
     * Starts the daemon.
     * @returns {Promise} A promise that resolves when the daemon has started.
     */
    async start() {
        await this.panelHandler.connect().catch(e => {throw e});
        this.authHandler.authenticate({
            panelHandler: this.panelHandler, name: this.name, version: this.version
        });
    }

    /**
     * Stops the daemon.
     * @returns {Promise} A promise that resolves when the daemon has stopped.
     */
    async stop() {
        await this.panelHandler.close().catch(e => {throw e});
        await this.config.save().catch(e => {throw e});
    }
}

module.exports = Daemon;