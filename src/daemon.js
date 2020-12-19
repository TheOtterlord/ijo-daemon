const path = require("path");
const {ConfigFile} = require("ijo-utils");
const PanelHandler = require("./net/panel/handler");
const AuthHandler = require("./auth/handler");

class Daemon {
    constructor() {
        this.config = new ConfigFile(path.join(this.root, "./config.json"), {defaults: {
            name: "test",
            panel: {host: "localhost", port: 8081},
            auth: {}
		}});
        this.panelHandler = new PanelHandler();
        this.authHandler = new AuthHandler();
    }

    get root() {
		return path.join(path.dirname(require.main.filename), "../");
	}

    async initialize() {
        await this.config.load().catch(e => {throw e});
        this.name = this.config.get("name");
        this.version = process.env.npm_package_version;
        this.panelHandler.initialize({config: this.config.get("panel"), name: this.name});
        this.authHandler.initialize({panelHandler: this.panelHandler, config: this.config.get("auth")});
    }

    async start() {
        await this.panelHandler.connect().catch(e => {throw e});
        this.authHandler.authenticate({
            panelHandler: this.panelHandler, name: this.name, version: this.version
        });
    }

    async stop() {
        await this.panelHandler.close().catch(e => {throw e});
		await this.config.save().catch(e => {throw e});
    }
}

module.exports = Daemon;