const path = require("path");
const {ConfigFile} = require("ijo-utils");
const PanelHandler = require("./net/panelHandler");

class Daemon {
    constructor() {
        this.config = new ConfigFile(path.join(this.root, "./config.json"), {defaults: {
            name: "test",
			panel: {host: "localhost", port: 8081}
		}});
        this.panelHandler = new PanelHandler();
    }

    get root() {
		return path.join(path.dirname(require.main.filename), "../");
	}

    async initialize() {
        await this.config.load().catch(e => {throw e});
        this.name = this.config.get("name");
        this.panelHandler.initialize(this.config.get("panel"), this.name);
    }

    async start() {
        await this.panelHandler.connect().catch(e => {throw e});
    }

    async stop() {
        await this.panelHandler.close().catch(e => {throw e});
		await this.config.save().catch(e => {throw e});
    }
}

module.exports = Daemon;