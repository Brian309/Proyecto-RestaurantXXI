const mysql = require('mysql');
const fs = require('fs');

const conn = mysql.createConnection({
    host:"queque208.mysql.database.azure.com",
    user:"eladmin",
    password: "#Queque208",
    database:"dev",
    ssl: {ca: fs.readFileSync("C:/Users/Administrador/Desktop/Codigo Primera Entrega/DigiCertGlobalRootCA.crt.pem")}
});

conn.connect((error)=>{
    if(error){
        console.log("ocurrio un error: "+error)
        return
    }

    console.log("Conectado exitosamente");

});






module.exports = conn;