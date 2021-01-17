class AuthEvents {
    constructor(panelHandler, authHandler) {
        panelHandler.register("auth/key", (...args) => this.key(authHandler, ...args));
        panelHandler.register("auth/correct", () => this.correct(authHandler));
        panelHandler.register("auth/nameInUse", () => this.nameInUse());
        panelHandler.register("auth/incorrect", () => this.incorrect());
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
        throw Error("The identity has been deemed incorrect by the panel.");
    }
}

module.exports = AuthEvents;