/* Timer
* */

const Timer = {
    data: {},
    start: function (key) {
        Timer.data[key] = new Date();
    },
    stop: function (key) {
        let time = Timer.data[key];
        if (time)
            Timer.data[key] = new Date() - time;
    },
    getTime: function (key) {
        return Timer.data[key];
    }
};
module.exports = Timer;