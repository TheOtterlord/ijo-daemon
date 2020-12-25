const {nanoid} = require("nanoid");
const AuthEvents = require("./events");

class AuthHandler {
    constructor() {
        this.isAuthenticated = false;
    }

    initialize({panelHandler, config} = {}) {
        this.config = config;
        this.events = new AuthEvents(panelHandler, this);
    }

    authenticate({panelHandler, name, version} = {}) {
        if (this.config.key) this.authKnown({panelHandler, name, version});
        else this.authUnknown({panelHandler, name, version});
    }

    authUnknown({panelHandler, name, version} = {}) {
        this.config.code = nanoid(8);
        panelHandler.send({
            event: "auth/identify",
            name, version,
            code: this.config.code
        });
    }

    authKnown({panelHandler, name, version} = {}) {
        panelHandler.send({
            event: "auth/identify",
            name, version,
            key: this.config.key
        });
    }

    authenticated(key) {
        this.isAuthenticated = true;
        if (key) this.config.key = key;
    }
}

module.exports = AuthHandler;