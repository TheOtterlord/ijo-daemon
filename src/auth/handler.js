const {nanoid} = require("nanoid");
const AuthEvents = require("./events");

class AuthHandler {
    constructor() {
        this.isAuthenticated = false;
    }

    initialize({panelHandler, config}) {
        this.config = config;
        this.events = new AuthEvents(panelHandler, this);
    }

    authenticate({panelHandler, name}) {
        if(config.key) this.authKnown({panelHandler, name});
        else this.authUnknown({panelHandler, name});
    }

    authUnknown({panelHandler, name, config}) {
        config.code = nanoid(8);
        panelHandler.send({
            event: "auth/identify",
            name,
            code: config.code
        });
    }

    authKnown({panelHandler, name, config}) {
        panelHandler.send({
            event: "auth/identify",
            name,
            key: config.key
        });
    }

    authenticated(key) {
        this.isAuthenticated = true;
        if(key) this.config.key = key;
    }
}

module.exports = AuthHandler;