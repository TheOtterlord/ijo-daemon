const net = require("net");

class PanelHandler {
    constructor() {
        this.stack = [];
    }

    register(event, callback) {
        this.stack.push({
            event, callback
        });
    }

    unregister(event) {
        const handlerIndex = this.stack.findIndex(handler => handler.event === event);

        if (handlerIndex < 0) return;

        this.stack.splice(handlerIndex);
    }

    initialize({config, daemonName}) {
        this.config = config;
        this.daemonName = daemonName;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.client = net.createConnection({
                host: this.config.host,
                port: this.config.port
            }, () => resolve());
            this.client.on("data", chunk => this.handleData(chunk));
            this.client.on("error", err => reject(err));
            this.client.on("close", () => this.handleClose());
        });
    }

    handleData(chunk) {
        let buffer = this.buffer ? Buffer.concat([this.buffer, chunk]) : chunk;
        let data;
        
        try {
            data = JSON.parse(buffer.toString());
        }
        catch {
            this.buffer = buffer;

            return;
        }

        this.handle(data);
    }

    handleClose() {
        if (this.client.destroyed) return;
        if (this.connectionRetries <= this.config.maxConnectionRetries) {
            throw Error("Max connection retries reached.");
        }

        setTimeout(() => {
            this.connectionRetries++;
            this.connect();
        }, 1000);
    }

    async handle(data) {
        const event = data.event;

        for (const handler of this.stack) {
            if (handler.event !== event) continue;

            const canContinue = await handler.callback(data, this);

            if (!canContinue) return;
        }

        this.send({event: "error", reason: "eventNotFound"});
    }

    send(data = {}) {
        this.client.write(JSON.stringify(data));
    }

    close() {
        return new Promise(resolve => {
            if (this.client.destroyed) resolve();
            else this.client.end(() => resolve());
        });
    }
}

module.exports = PanelHandler;