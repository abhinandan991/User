
const mariadb = require('mariadb');
const connection = mariadb.createPool({
     /*host: 'localhost',
     user: 'root',
     password: 'password',
     port: '3307',
     database: 'stacksville_infrastructure',*/
     host: 'database-1.ciohjacrdv4d.us-east-1.rds.amazonaws.com',
     user: 'admin_abhi',
     password: 'StacksVille2023Abhi',
     port: '3306',
     database: 'innodb',
});


connection.getConnection()
    .then(connection => {
    
        console.log("Connected to mariadb Server!");
        
    }).catch(err => {
        console.log('not!', err);
    });


function makeDb() {
    return {
        query(sql, args) {
            console.log("db connected localhost");
            console.log(sql);
            return connection.query(sql, args);
        },
        close() {
          console.log("db not connected to localhost");
           return connection.end();
        }
    }
}
const db = makeDb();
module.exports = db;