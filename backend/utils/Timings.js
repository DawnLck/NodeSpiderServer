/* Timer
 * */

const Timer = {
  data: {},
  start: function(key) {
    // console.log('Timer start ... ');
    Timer.data[key] = new Date();
  },
  stop: function(key) {
    // console.log('Timer stop ... ');
    let time = Timer.data[key];
    if (time) Timer.data[key] = new Date() - time;
  },
  getTime: function(key) {
    return Timer.data[key] / 1000;
  }
};
module.exports.Timer = Timer;
