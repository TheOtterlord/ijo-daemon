const path = require("path");
const {ConfigFile} = require("ijo-utils");
const PanelHandler = require("./net/panelHandler");

class Daemon {
    constructor() {
        this.config = new ConfigFile(path.join(this.root, "./config.json"), {defaults: {
			api: {host: "localhost", port: 8080}
		}});
        this.panelHandler = new PanelHandler();
    }

    get root() {
		return path.join(path.dirname(require.main.filename), "../");
	}

    async initialize() {
        await this.config.load().catch(e => {throw e});
        this.panelHandler.initialize(this.config.get("api"));
    }

    async start() {
        await this.panelHandler.connect().catch(e => {throw e});
    }

    async stop() {

    }
}

module.exports = Daemon;