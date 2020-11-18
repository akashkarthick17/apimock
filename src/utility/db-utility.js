import mysql from 'mysql';

class _mySQLClient {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectionLimit: 200,
      queueLimit: 100,
    });
  }

  executeQuery(query, params) {
    return new Promise((resolve, reject) => {
      this.pool.query(query, params, function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      });
    });
  }
}

export const MySqlClient = new _mySQLClient();
