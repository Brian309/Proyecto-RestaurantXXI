const myql = require('mysql');
const fs = require('fs');
const conn = myql.createConnection({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: {ca: fs.readFileSync(process.env.DB_SSL)}
});

conn.connect((error)=>{
    if(error){
        console.log('el error de coneccion es:'+error)
        return;
    }
    console.log('connectado')
});

module.exports = conn;