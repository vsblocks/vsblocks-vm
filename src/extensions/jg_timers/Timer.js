class Timer {
    constructor (startingTime, pausingTime) {
        this.startTime = startingTime ? startingTime : Date.now();
        if (pausingTime) {
            this.pauseTime = pausingTime;
        }
        this.stopped = true;
    }

    start (vmUnpause = false) {
        const paused = (this.pauseTime !== null);
        // check if we are stopped or paused before continuing
        if (!(this.stopped || paused) || (paused && (vmUnpause && !this.vmPaused))) return;
        if (this.stopped) {
            this.startTime = Date.now();
        } else {
            // we are unpausing
            this.startTime += Date.now() - this.pauseTime;
        }
        this.vmPaused = false;
        this.pauseTime = null;
        this.stopped = false;
    }
    pause (vmPause = false) {
        const paused = (this.pauseTime !== null);
        if (paused) return;
        this.vmPaused = vmPause;
        this.pauseTime = Date.now();
    }
    stop () {
        if (this.stopped) return;
        this.stopped = true;
        this.pauseTime = Date.now();
    }

    reset () {
        this.stopped = true;
        this.pauseTime = Date.now();
        this.startTime = Date.now();
    }

    add (seconds) {
        this.startTime -= seconds;
    }

    getTime (inSeconds) {
        const paused = (this.pauseTime !== null);

        const pausedTime = Number(this.pauseTime) - this.startTime;
        const normalTime = Date.now() - this.startTime;

        const divisor = inSeconds ? 1000 : 1;

        return (paused ? pausedTime : normalTime) / divisor;
    }
}

module.exports = Timer;
