const {nanoid} = require("nanoid");
const AuthEvents = require("./events");

/**
 * This class handles the authentication with the panel.
 */
class AuthHandler {
    constructor() {
        /**
         * If the daemon has been authenticated by the panel.
         * @type {Boolean}
         */
        this.isAuthenticated = false;
    }

    /**
     * Initializes the authentication handler.
     * @summary Should only be called by ijo-daemon.
     * @param {Object} params The parameters received on initialization. 
     */
    initialize({panelHandler, config} = {}) {
        this.config = config;
        this.events = new AuthEvents(panelHandler, this);
    }

    /**
     * Starts the authentication of the daemon to the panel.
     * @summary Should only be called by ijo-daemon.
     * @param {Object} params The parameters required when authenticating.
     * @param {PanelHandler} params.panelHandler The panel handler.
     * @param {String} params.name The name of daemon.
     * @param {String} params.version The version the daemon is on. 
     */
    authenticate({panelHandler, name, version} = {}) {
        if (this.config.key) this.authKnown({panelHandler, name, version});
        else this.authUnknown({panelHandler, name, version});
    }

    /**
     * Authenticates to the panel while under the impression that the panel doesn't know this daemon. This means trust 
     * has to be established.
     * @summary Should only be called by ijo-daemon.
     * @param {PanelHandler} params.panelHandler The panel handler.
     * @param {String} params.name The name of daemon.
     * @param {String} params.version The version the daemon is on. 
     */
    authUnknown({panelHandler, name, version} = {}) {
        this.config.code = nanoid(8);
        panelHandler.send({
            event: "auth/identify",
            name, version,
            code: this.config.code
        });
    }

    /**
     * Authenticates to the panel while under the impression that this daemon is already known by the panel. Thus the
     * authentication key is sent to the panel.
     * @summary Should only be called by ijo-daemon.
     * @param {PanelHandler} params.panelHandler The panel handler.
     * @param {String} params.name The name of daemon.
     * @param {String} params.version The version the daemon is on. 
     */
    authKnown({panelHandler, name, version} = {}) {
        panelHandler.send({
            event: "auth/identify",
            name, version,
            key: this.config.key
        });
    }

    /**
     * Sets the daemon to be authenticated. If on verification a new authentication key is supplied this is set to the
     * config.
     * @param {String} key The new authentication key.
     */
    authenticated(key) {
        this.isAuthenticated = true;
        if (key) this.config.key = key;
    }
}

module.exports = AuthHandler;