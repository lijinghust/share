const config = {
    database: {
        host: '127.0.0.1',
        port: '3306',
        user: 'root',
        password: '111111',
        database: 'lottery',
        charset: 'utf8',
        connectionLimit: 10000
    },
    token: {
        secret: 'shkhskdfhkdshfks',
        expires: 7 * 24 * 3600 * 1000
    }
}

module.exports = config