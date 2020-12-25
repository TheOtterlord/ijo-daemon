const Daemon = require("./daemon");
const daemon = new Daemon();
daemon.initialize()
.then(() => {
    return daemon.start();
})
.then(() => {
    console.log("The IJO daemon has started.");
})
.catch(err => {
    throw err;
});

let stopped = false;
const stop = (event, err) => {
    if (err && err instanceof Error) console.error(err);
    if (stopped) return;
    stopped = true;

    return daemon.stop()
    .then(() => {
        console.log(`The IJO daemon has stopped (event: ${event}).`);
    })
    .catch(err => {
        throw err;
    });
};

["beforeExit", "SIGINT", "SIGUSR1", "SIGUSR2", "SIGTERM", "uncaughtException", "unhandledRejection"].forEach(event => {
    process.on(event, err => stop(event, err));
});