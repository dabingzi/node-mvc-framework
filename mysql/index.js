var mysql = require('mysql');
var config = require('./config.js')
 
var pool  = mysql.createPool({
  host     : config.database.HOST,
  user     : config.database.USERNAME,
  password : config.database.PASSWORD,
  database : config.database.DATABASE
});
 
 
class Mysql {
    constructor () {
 
    }
    query () {
      return new Promise((resolve, reject) => {
        pool.query('SELECT * from ceshidata', function (error, results, fields) {
            if (error) {
                throw error
            };
            resolve(results)
        });
      })
       
    }
}
 
module.exports = new Mysql()