const conn = require("./database/bbdd");

function pedidos () {

    conn.query("SELECT * FROM detalleboleta WHERE esta_preparado = 0");

};
