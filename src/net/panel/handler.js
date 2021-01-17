const net = require("net");

/**
 * This class handles the connection with the panel. It also handles the incoming data from the panel.
 */
class PanelHandler {
    constructor() {
        /**
         * The stack of events and the callbacks the handler will use to handle the incoming data.
         * @type {Array.<Object>}
         */
        this.stack = [];
    }

    /**
     * Registers the supplied callback for the specified event to the stack. This callback will then be called when 
     * data is sent by the panel with the specified event.
     * @param {String} event The event.
     * @param {Callback} callback The callback matching the event.
     */
    register(event, callback) {
        this.stack.push({
            event, callback
        });
    }

    /**
     * Unregisters the specified event from the stack. This means the matching callback won't be called anymore if that
     * event is received from the panel.
     * @param {String} event The event name.
     */
    unregister(event) {
        const handlerIndex = this.stack.findIndex(handler => handler.event === event);

        if (handlerIndex < 0) return;

        this.stack.splice(handlerIndex);
    }

    /**
     * Initializes the panel handler.
     * @summary Should only be called by ijo-daemon.
     * @param {Object} params The parameters received on initialization. 
     */
    initialize({config, daemonName}) {
        this.config = config;
        this.daemonName = daemonName;
    }

    /**
     * Starts the connection to the panel using the specified options. It also sets up all the event listeners.
     * @returns {Promise} A promise that resolves when the connection has been established.
     */
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

    /**
     * Handles an incoming Buffer that acts as a chunk of data. If the data can be parsed into a JSON object this event
     * is handled, if not it is concatenated into an internal buffer.
     * @summary Should only be called by ijo-daemon.
     * @param {Buffer} chunk The chunk of data.
     */
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

    /**
     * Handles the closure of the socket. If it has been destroyed nothing is done, else unless the maximum amount of 
     * retries is reached it will retry to connect to the panel every 1000ms.
     * @summary Should only be called by ijo-daemon.
     */
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

    /**
     * Handles the given object of data. It will search for an event listener that has been added to the stack. If this
     * listener cannot be found an error is sent to the panel.
     * @summary Should only be called by ijo-daemon.
     * @param {Object} data The incoming parsed object of data.
     */
    async handle(data) {
        const event = data.event;

        if(event === undefined) {
            this.send({event: "error/noEvent"});

            return;
        }

        for (const handler of this.stack) {
            if (handler.event !== event) continue;

            const canContinue = await handler.callback(data, this);

            if (!canContinue) return;
        }

        this.send({event: "error/eventNotFound"});
    }

    /**
     * Sends the specified object of data to the panel. This object should have an event property for the panel to know
     * how to handle it.
     * @param {Object} data The data to send to the panel.
     */
    send(data = {}) {
        this.client.write(JSON.stringify(data));
    }

    /**
     * Closes the connection with the panel.
     * @returns {Promise} A promise that is called when the connection has been closed.
     */
    close() {
        return new Promise(resolve => {
            if (this.client.destroyed) resolve();
            else this.client.end(() => resolve());
        });
    }
}

module.exports = PanelHandler;