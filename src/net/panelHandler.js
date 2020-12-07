const net = require("net");
const {nanoid} = require("nanoid");

class PanelHandler {
    initialize(config, daemonName) {
        this.config = config;
        this.daemonName = daemonName;
        this.authenticated = false;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.client = net.createConnection({
                host: this.config.host,
                port: this.config.port
            }, () => resolve());
            this.client.on("connect", () => this.handleConnect());
            this.client.on("data", chunk => this.handleData(chunk));
            this.client.on("error", err => reject(err));
            this.client.on("close", hadError => this.handleClose(hadError));
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

    handleConnect() {
        if(this.config.key) this.handleKnownConnect();
        else this.handleUnknownConnect();
    }

    handleKnownConnect() {
        this.send({
            event: "identify",
            name: this.daemonName,
            key: this.config.key
        });
    }

    handleUnknownConnect() {
        this.config.code = nanoid(8);
        this.send({
            event: "identify",
            name: this.daemonName,
            code: this.config.code
        });
    }

    handleClose(hadError) {
        if(this.client.destroyed) return;
        if(this.connectionRetries <= this.config.maxConnectionRetries) {
            throw Error("Max connection retries reached.");
        }

        setTimeout(() => {
            this.connectionRetries++;
            this.connect();
        }, 1000);
    }

    async handle(data) {

    }

    send(data = {}) {
        this.client.write(JSON.stringify(data));
    }

    close() {
        return new Promise(resolve => {
            this.client.end(() => resolve());
        });
    }
}

module.exports = PanelHandler;