const mysql = require('mysql');
const fs = require('fs');
const os = require('os');

console.log()
const conn = mysql.createConnection({
    host:"queque208v2.mysql.database.azure.com",
    user:"eladmin",
    password: "#Queque208",
    database:"dev",
    ssl: {ca: fs.readFileSync("C:/Users/Administrador/Desktop/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/Proyecto-RestaurantXXI/Vistas-Restaurant/DigiCertGlobalRootCA.crt.pem")}
});

conn.connect((error)=>{
    if(error){
        console.log("ocurrio un error: "+error)
        return
    }

    console.log("Conectado exitosamente");

});






module.exports = conn;