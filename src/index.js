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
const stop = event => {
	if(stopped) return;
	stopped = true;

	return daemon.stop()
	.then(() => {
		console.log(`The IJO daemon has stopped (event: ${event})`);
	})
	.catch(err => {
		throw err;
	});
};

[`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `SIGTERM`].forEach(event => {
    process.on(event, () => stop(event));
});