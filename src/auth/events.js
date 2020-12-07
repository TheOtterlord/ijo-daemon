class AuthEvents {
    constructor(panelHandler, authHandler) {
        panelHandler.registerEvent("auth/key", (...args) => this.key(authHandler, ...args));
        panelHandler.registerEvent("auth/correct", () => this.correct(authHandler));
        panelHandler.registerEvent("auth/nameInUse", () => this.nameInUse());
        panelHandler.registerEvent("auth/incorrect", () => this.incorrect());
    }

    key(authHandler, data) {
        authHandler.authenticated(data.key);
    }

    correct(authHandler) {
        authHandler.authenticated();
    }

    nameInUse() {
        throw Error("Name is already used by other daemon.");
    }

    incorrect() {
        throw Error("The key has been deemed incorrect by the panel.");
    }
}

module.exports = AuthEvents;