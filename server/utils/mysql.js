const mysql = require('mysql');
const config = require('./../config.js');

const connectionPool = mysql.createPool({
    'host' : config.database.host,
    'port':config.database.port,
    'user' : config.database.user,
    'password' : config.database.password,
    'database' : config.database.database,
    'charset': config.database.charset,
    'connectionLimit': config.database.connectionLimit,
    'supportBigNumbers': true,
    'bigNumberStrings': true
})


var release = connection => {
    connection.end(function(error) {
        if(error) {
            console.log('Connection closed failed.');
        } else {
            console.log('Connection closed succeeded.');
        }
    });
};

var execQuery = sqlOptions => {
    var results = new Promise((resolve, reject) => {
        connectionPool.getConnection((error,connection) => {
            if(error) {
                console.log("Get connection from mysql pool failed !");
                reject(error);
                throw error;
            }

            var sql = sqlOptions['sql'];
            var args = sqlOptions['args'];

            if(!args) {
                var query = connection.query(sql, (error, results) => {
                    if(error) {
                        console.log('Execute query error !');
                        reject(error);
                        throw error;
                    }

                    resolve(JSON.parse(JSON.stringify(results)));
                });
                // console.log(query.sql)
            } else {
                var query = connection.query(sql, args, (error, results) => {
                    if(error) {
                        console.log('Execute query error !');
                        reject(error);
                        throw error;
                    }
                    resolve(JSON.parse(JSON.stringify(results)));
                });
                // console.log(query.sql)
            }

            connection.release(function(error) {
                if(error) {
                    console.log('Mysql connection close failed !');
                    reject(error);
                    throw error;
                }
            });
        });
    })

    return results;
};
// 执行事务
const execTransactions = transArr => {
    const results = new Promise((resolve, reject) => {

        connectionPool.getConnection((error,connection) => {
            // 执行事物的递归函数
            function trans(arr){
                const opts = arr.shift();
                connection.query(opts.sql, opts.args, (error, results) => {
                    if(error){
                        return connection.rollback(() => {
                            reject(error);
                        })
                    }
                    if(arr.length){
                        trans(arr);
                    }else{
                        connection.commit((error, results) => {
                            if(error){
                                return connection.rollback((error) => {
                                    reject(error);
                                })
                            }
                            resolve(results);
                        })
                    }
                })
            }

            if(error) {
                console.log("Get connection from mysql pool failed !");
                reject(error);
                // throw error;
            }

            connection.beginTransaction((error) => {
                if(error){
                    reject(error);
                }
                trans(transArr)
            })    
        })

    })
    return results;
}

module.exports = {
    release : release,
    execQuery : execQuery,
    execTransactions: execTransactions
}