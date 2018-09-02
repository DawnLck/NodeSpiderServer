/**
 * Connect to MongoDB
 */
const mongoose = require('mongoose'),
    {DB_CONN, DB_Name} = require('./config'),
    DB_DatabasePath = DB_CONN + DB_Name;
mongoose.Promise = global.Promise;//为了解决过期的问题

console.log('DBPath: ' + DB_DatabasePath);
/*调试模式是mongoose提供的一个非常实用的功能，用于查看mongoose模块对mongodb操作的日志，一般开发时会打开此功能，以便更好的了解和优化对mongodb的操作。*/
mongoose.set('debug', false);

/*mongoose会缓存命令，只要connect成功，处于其前其后的命令都会被执行，connect命令也就无所谓放哪里*/
mongoose.connect(DB_DatabasePath, {useNewUrlParser: true});
const db = mongoose.connection;

db.on("error", async function (error) {
    console.log("Fail to make connection to MongoDB：" + error);
});

db.once("open", async function () {
    console.log("Success to connect the MongoDB.");
});

module.exports = mongoose;
