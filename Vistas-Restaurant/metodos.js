const conn = require("./database/bbdd");

//Metodo para tener el id del cliente que reservo determinada mesa
function selectIdCliente(id_mesa, date) {
    //Query parta obtener el id del cliente ingresado
    conn.query("SELECT id FROM CLIENTE WHERE id_mesa = ? and fecha_ingreso = ?",[id_mesa,date],(error, result) => {
       if(error){

           console.log(error);

       }
       insertBoleta(result[0].id, date, id_mesa);
       console.log("Cliente seleccionado")
   });
}

//Metodo para insertar la boleta del cliente
function insertBoleta(id_cliente, date, id_mesa){

   //Insert con la boleta del cliente
   conn.query("INSERT INTO BOLETA (id_cliente, total, pagado, fecha) VALUES (?,?,?,?)",[id_cliente, 0, 0, date], (error2, result2) => {
       if(error2){

           console.log(error2);

       }
       actualizarMesa(id_mesa);
       console.log("Boleta ingresada");
   });
}

//Metodo para actualizar el estado de la mesa una vez este reservada
function actualizarMesa(id_mesa){
   //Actualizamos la disponibilidad de la mesa
   conn.query("UPDATE mesa set disponible = 0 WHERE id = ?",[id_mesa], errorUp => {
       if(errorUp){

           console.log(errorUp);

       }
       console.log("Mesa actualizada");
   });
}



module.exports = selectIdCliente;