const net = require("net");

class PanelHandler {
    initialize(config) {
        this.config = config;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.client = net.createConnection({
                host: this.config.host,
                port: this.config.port
            }, () => resolve());
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

    handleClose(hadError) {
        if(hadError) throw Error("Closed socket with error.");
        if(this.client.destroyed) return;
        if(this.connectionRetries <= this.config.maxConnectionRetries) {
            throw Error("Max connection retries reached.");
        }

        this.connectionRetries++;
        this.connect();
    }

    async handle(data) {

    }

    close() {
        return new Promise(resolve => {
            this.client.end(() => resolve());
        });
    }
}

module.exports = PanelHandler;