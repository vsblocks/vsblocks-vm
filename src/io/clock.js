const Timer = require('../util/timer');

class Clock {
    constructor (runtime) {
        this._projectTimer = new Timer({now: () => runtime.currentMSecs});
        this._projectTimer.start();
        this._paused = false;
        /**
         * Reference to the owning Runtime.
         * @type{!Runtime}
         */
        this.runtime = runtime;
    }

    projectTimer () {
        return this._projectTimer.timeElapsed() / 1000;
    }

    pause () {
        this._paused = true;
        this._projectTimer.pause();
    }

    resume () {
        this._paused = false;
        this._projectTimer.play();
    }

    resetProjectTimer () {
        this._projectTimer.start();
    }
}

module.exports = Clock;
