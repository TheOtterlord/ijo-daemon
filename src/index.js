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

const stop = event => {
	return core.stop()
	.then(() => {
		console.log(`The IJO daemon has stopped (event: ${event})`);
	})
	.catch(err => {
		throw err;
	})
};

[`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `SIGTERM`].forEach(event => {
    process.on(event, stop.bind(null, event));
});