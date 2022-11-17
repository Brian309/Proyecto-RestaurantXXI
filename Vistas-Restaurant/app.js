const express = require('express');
const app = express();
const conn = require("./database/bbdd");
const bodyParser = require('body-parser');
const selectIdCliente = require("./metodosTotem");
let id_mesa = 1;
//SDK MERCADOPAGO
const mercadopago = require('mercadopago');

app.use(bodyParser.urlencoded({ extended: false }))

//Configuramos el puerto donde correra la aplicacion.
app.listen(5000, () => {
    console.log('http://localhost:5000');
});

//motor de plantillas
app.set('view engine', 'ejs');

/* Para "application/json" */
app.use(express.json());

/* Para "application/x-www-form-urlencoded" */
app.use(express.urlencoded());


//Definiendo la carpeta de archivos estaticos como funciones y estilos
app.use('/resource', express.static('public'));
app.use('/resource', express.static(__dirname + '/public'));


/**********************************************************Menu principal****************************************************************/
app.get('/menu', (req,res) => {
    res.render('menu');
});

/***************************************************TOTEM******************************************************************/
//Totem para elegir mesa
app.get('/totem', (req, res) => {
    let opciones="";
    conn.query("SELECT * FROM mesa WHERE disponible = '1' ", (error, result)=>{
        if(error){
            console.log(error)
        }

        for (let i = 0; i < result.length; i++ ){

        opciones += `
                <option>Numero: ${result[i].id} , Capacidad: ${result[i].capacidad}</option>
        `
        }

        res.status(201).render('totem', {opciones:opciones});
    });
   
});



//Metodo para crear cliente y boleta, dejando reservada la mesa. 
app.post('/totem/reservar', (req,res) => {
    const id_mesa = req.body.cliente.mesa.substring(8,10);
    const personas = req.body.cliente.personas;
    const date = req.body.cliente.date;

    //Insertando el nuevo cliente con su mesa asignada
    conn.query("INSERT INTO CLIENTE (id_mesa, num_personas, fecha_ingreso) VALUES (?,?,?)",[id_mesa,personas,date], (error, result) => {
        if(error){
            console.log(error)
        }

        selectIdCliente(id_mesa, date);
    });     
});



/**************************************************TABLET********************************************************/
//Pagina principal
app.get('/tablet', (req, res) =>{
    let contenido="";
    let cat="";
    conn.query("SELECT * FROM receta WHERE disponible = '1' ", (error, result)=>{
        if(error){
            console.log(error)
        }  

        for (let i = 0; i < result.length; i++ ){

            contenido +=`
                        <div class="card plato" style="width:400px">
                            <img class="card-img-bottom" src="../resource/imagenes/`+result[i].nombre+`.png" alt="Card image" style="width:100%">
                            <div class="card-body">
                                <h3 class="card-title">`+ result[i].nombre +` </h3>
                                <p class="card-text-desc">`+ result[i].descripcion +` </p>
                                <p class="card-text-price h4">$`+ result[i].precio_receta +` </p>
                                <a data-id="`+result[i].id+`" class="item-button btn btn-warning agregar-carrito">Agregar</a>
                            </div>
                            <br>
                        </div>
                        `
        }
           
        res.status(201).render('tablet', {contenidos:contenido, cat:cat});
    });
});


//Seleccion de categorias del menu
app.get('/tablet/:categoria', (req, res) => {
    let categoria = req.params.categoria;
    let contenido="";
    let cat="";
    console.log(categoria)
    const i = conn.query("SELECT * FROM receta WHERE id_categoria_receta = ? and disponible = '1' ", [categoria], (error, result)=>{
        if(error){
            console.log(error)
        }  

        for (let i =0; i < result.length; i++ ){
            console.log(result[i])
            contenido += `
            <div class="card plato" style="width:400px">
                <img class="card-img-bottom" src="../resource/imagenes/`+result[i].nombre+`.png" alt="Card image" style="width:100%">
                <div class="card-body">
                    <h3 class="card-title">`+ result[i].nombre +` </h3>
                    <p class="card-text-desc">`+ result[i].descripcion +` </p>
                    <p class="card-text-price h4">$`+ result[i].precio_receta +` </p>
                    <a data-id="`+result[i].id+`" class="item-button btn btn-warning agregar-carrito">Agregar</a>
                </div>
                <br>
            </div>`
        }
        

        switch(categoria){
            case "1":{ 
                cat = "Platos Principales";
                break;
            }
            case "2":{
                cat="Ensaladas";
                break;
            }
            case "3":{
                cat="Bebestibles";
                break;
            }
            case "4":{
                cat="Postres";
                break;
            }
            case "5":{
                cat="Entradas";
                break;
            }
            case "6":{
                cat="Salsas";
                break;
            }
        };
         


        res.status(201).render('tablet', {contenidos:contenido, cat:cat});
    });
    
});


//Metodo para realizar el pedido del cliente
app.post("/tablet/pedir", (req,res) => {
    let pedido = req.body.articulosCarrito;
    let calculo=0;
    let date = new Date;
    date = date.toISOString().substring(0,10) + ' ' + date.toISOString().substring(11,19);

    conn.query(`SELECT c.id AS cliente, b.id as boleta FROM cliente c JOIN mesa m on (c.id_mesa = m.id) 
                JOIN boleta b on (b.id_cliente = c.id) where m.id = ${id_mesa} and m.disponible = 0 and b.pagado = 0;`,
    
    (error, result) => {
        
        if(error){
            console.log(error);
        }
        console.log(pedido)
        //Insertar los platos pedidos en la tabla detalle boleta
        
        for (i=0; i < pedido.length; i++){
            conn.query("INSERT INTO detalleboleta (id_boleta, id_receta, cantidad_receta, nota_cliente, fecha_pedido, esta_preparado, esta_entregado) values (?,?,?,?,?,?,?)",
            
            [result[0].boleta, pedido[i].id, pedido[i].cantidad, 'Que este rico porfa', date, 0 ,0],
            
            (error2, result2)=>{
                if(error){
                    console.log(error2);
                }
                console.log(result2);
                
            });
        };
        
       
    });

    
    res.status(200).redirect('/tablet')
});


mercadopago.configure({
    access_token: 'APP_USR-3293053570633173-102417-0a6044c640a1ed10b535999b357e994d-1224351274'
});

app.post('/checkout', (req,res) => {
    //Orden de compra
    let preference = 
    {
        items: [
          {
            title:req.body.title,
            unit_price: parseInt(req.body.price),
            quantity: 1,
          }
        ],
        "back_urls": {
            "success": "http://localhost:5000/success/"+req.body.boleta,
            "failure": "http://localhost:5000/failure/"+req.body.boleta,
            "pending": "http://localhost:5000/pending"
        },
        "auto_return": "approved",
      };

      mercadopago.preferences.create(preference)
      .then(function(response){
        conn.query(`INSERT INTO registroPago (monto, tipoTransaccion, codTransacciones, estado) VALUES (${parseInt(req.body.price)}, 'Online', ${req.body.boleta}, 'F')`, 
        (error, result) => {
            if(error){
                console.log(error)
            }
        });
        res.redirect(response.body.init_point);
      }).catch(function(error){
        console.log(error);
      });
});

app.get('/success/:boleta', (req,res) => {
    const boleta = req.params.boleta
    conn.query(`UPDATE registroPago SET estado = 'T' WHERE codTransacciones = ${boleta}`, (error) => {
        if(error){
            console.log(error)
        }
    });

    conn.query(`UPDATE boleta SET pagado = '1' WHERE id = ${boleta}`, (error) => {
        if(error){
            console.log(error)
        }
    });

    conn.query(`UPDATE mesa SET disponible = '1' WHERE id = ${id_mesa}`, (error) => {
        if(error){
            console.log(error)
        }
    });


    res.redirect('/tablet');
});

app.get('/failure/:enviar/:boleta', (req,res)=>{
    
    const estado = req.params.enviar;
    const boleta = req.params.boleta
    if(estado == "Si"){
        conn.query(`UPDATE registropago SET estado = 'F', tipoTransaccion = 'Efectivo' where codTransacciones = ${boleta}`, (error, result) => {
            if(error){
                console.log(error)
            }
            console.log(result);
        });
    }
    console.log(estado, boleta);
    res.redirect('/tablet');
});

app.get('/failure/:boleta', (req,res)=>{  
    const boleta = req.params.boleta;
    res.render('failure', {boleta:boleta});
});


app.get('/resumen', (req,res) => {
    conn.query(`
    SELECT  b.id as id ,det.cantidad_receta as cantidad, r.precio_receta as precio, r.nombre as nombre
    FROM cliente c JOIN mesa m on (c.id_mesa = m.id) JOIN boleta b on (b.id_cliente = c.id)
    JOIN detalleboleta det on (det.id_boleta = b.id) JOIN
    receta r on (r.id = det.id_receta)
    where m.id = ${id_mesa} and m.disponible = 0 and b.pagado = 0 and det.esta_entregado = 1;
    `, 
    (error, result) => {
        if(error) 
        {
            console.log(error);
        }
        if(result.length == 0){
            res.status(200).render('pago', {resumen:result, total:0});
        }
        else {
        conn.query(`SELECT total FROM boleta where id = ${result[0].id}`, (error, total) => {
            if(error)
            {
                console.log(error)
            }
            console.log(total[0].total)
            res.status(200).render('pago', {resumen:result, total:total[0].total, boleta:result[0].id});
        });
    }
    });
    
});


/***************************************************************COCINA**********************************************************************/
app.get('/cocina', (req, res) =>{


    conn.query(`SELECT 	 d.id_boleta ,d.cantidad_receta, r.nombre, r.nivel, c.id_mesa, r.id, d.nota_cliente
                FROM 	 DETALLEBOLETA D JOIN receta r ON (D.ID_RECETA  = r.ID) 
                         JOIN boleta b on (b.id = d.id_boleta)
                         JOIN cliente c on (c.id = b.id_cliente)
                        
                WHERE d.esta_preparado = 0 and b.pagado = 0
                ORDER BY d.fecha_pedido asc, r.nivel desc;`
    ,(error,result) => {
        if(error){
            console.log(error)
        }


        res.status(200).render('cocina', {pedidos:result});
    });

    
});

app.get('/cocina/:idBoleta/:idReceta', (req,res)=>{
    const id_boleta = req.params.idBoleta;
    const id_receta = req.params.idReceta;
    
    conn.query(`UPDATE detalleboleta 
                SET esta_preparado = 1 where id_boleta = ? and id_receta = ?`,
                [id_boleta,id_receta], (error, result) =>{
        if(error){
            console.log(error)
        }
    });


    res.redirect('/cocina')
});

/********************************************************************MESERO*************************************************************************/

app.get('/mesero', (req,res) => {


    conn.query(`SELECT 	 d.id as id_pedido, d.esta_entregado ,d.id_boleta ,d.cantidad_receta, r.nombre, 
                         c.id_mesa, r.id, d.nota_cliente, d.esta_preparado
                FROM 	 DETALLEBOLETA D JOIN receta r ON (D.ID_RECETA  = r.ID) 
                         JOIN boleta b on (b.id = d.id_boleta)
                         JOIN cliente c on (c.id = b.id_cliente)
                        
                WHERE b.pagado = 0 and d.esta_entregado = 0
                ORDER BY d.fecha_pedido asc;`
    ,(error,result) => {
        if(error){
            console.log(error)
        }
        res.status(200).render('mesero', {pedidos:result})
    });
});

app.get('/mesero/:idBoleta/:idReceta/:idPedido', (req,res)=>{
    const id_boleta = req.params.idBoleta;
    const id_receta = req.params.idReceta;
    const id_pedido = req.params.idPedido;
    conn.query("UPDATE detalleboleta SET esta_entregado = 1 where id_boleta = ? and id_receta = ? and id = ?",
    [id_boleta,id_receta,id_pedido], (error, result) =>{
        if(error,result){
            console.log(error)
        }
        console.log("Plato entregado")


     //ACTUALIZAR EL MONTO DE LA BOLETA
     conn.query(`select sum(round(cantidad_receta*precio_receta)) AS total from detalleboleta d 
     join receta r on (d.id_receta = r.id) where id_boleta = ${id_boleta} and d.id = ${id_pedido}`,
        (error3, result3) => {
            if(error3){
                console.log(error3)
            }
            console.log(result3[0].total)
            conn.query("UPDATE boleta SET total = total + ? WHERE id = ?", 
            [result3[0].total, id_boleta], (error) =>{
            
            if(error){
                console.log(error);
            }
        });
        });
    });

    res.redirect('/mesero');
});

app.post('/mesero/comentario', (req,res)=>{
    const id_pedido = req.body.idPedido;
    const comentario = req.body.comentario;
    conn.query(`UPDATE detalleboleta set nota_cliente = "${comentario}" where id = ${id_pedido}`, (error) =>{
        if(error){
            console.log(error)
        };
        res.redirect('/mesero');
    })
});

/********************************************************CAJA**************************************************************/
app.get('/caja', (req,res) => {

    conn.query(`select sum(total) as total, DATE_FORMAT(sysdate(),'%d/%m/%Y') as hoy 
    from BOLETA 
    where  DATE_FORMAT(fecha,'%d/%m/%Y') = DATE_FORMAT(sysdate(),'%d/%m/%Y');`, 
    (error,resultado) => {
        if (error){
            console.log(error)
        }
        conn.query(`select count(*) from registropago where estado = 'N';`, 
        (error, result) => {
            if(error){
                console.log(error)
            }
            conn.query(`SELECT * FROM REGISTROPAGO WHERE tipoTransaccion = 'Online' and estado = 'F'`, (error, online) => {
                if(error){
                    console.log(error)
                }

                res.render('caja', {venta_total_dia:resultado[0], result:result, online:online, id_mesa:id_mesa});
            });
        });
    });
});

/********************************************************INVENTARIO**************************************************************/

app.get('/inventario', (req,res) => {
    let categoriaProducto = "";
    let unidadCompras = "";
    let unidadPreparacion = "";
    conn.query(`SELECT p.id, p.nombre, b.cantidad_bodega, c.nombre as categoria  FROM producto p JOIN bodega b ON (p.id = b.id_Producto)
    JOIN categoriaproducto c ON (p.id_categoria_producto = c.id)`, (error, result) => {
        if(error){
            console.log(error);
        }
        //Query para traer la categoria de los productos
        conn.query(`SELECT * FROM categoriaproducto`, (error, categoria) => {
            if(error){
                console.log(error);
            }
            for (let i = 0; i < categoria.length; i++ ){
                
                //Le pasamos las opciones al select del HTML
                categoriaProducto += `
                        <option>${categoria[i].id} ${categoria[i].nombre}</option>
                `
                }
            //Query para traer la Unidad de medida de los productos
            conn.query(`SELECT * FROM unidadmedidacompra`, (error, unidadCompra) => {
                if(error){
                    console.log(error);
                }
                for (let i = 0; i < unidadCompra.length; i++ ){
                    //Le pasamos las opciones al select del HTML
                    unidadCompras += `
                            <option>${unidadCompra[i].id} ${unidadCompra[i].nombre}</option>
                    `
                    }
                //Query para traer la unidad de preparacion de los productos
                conn.query(`SELECT * FROM unidadmedidapreparacion`, (error, unidadmedidapreparacion) => {
                    if(error){
                        console.log(error);
                    }
                    for (let i = 0; i < unidadmedidapreparacion.length; i++ ){

                        //Le pasamos las opciones al select del HTML
                        unidadPreparacion += `
                                <option>${unidadmedidapreparacion[i].id} ${unidadmedidapreparacion[i].nombre}</option>
                        `
                        }
                        res.render('inventario', {productos:result, categorias:categoriaProducto, unidadCompras:unidadCompras, unidadPreparacion:unidadPreparacion});
                    });
                
            });
        });
    });
    
});

//Modulo inventario con los filtros para el mismo.
app.get('/inventario/:categoria', (req,res) => {
    let categoria = req.params.categoria;
    let categorias = "";
    let unidadCompras = "";
    let unidadPreparacion = "";
    conn.query(`SELECT p.id, p.nombre, b.cantidad_bodega, c.nombre as categoria  FROM producto p JOIN bodega b ON (p.id = b.id_Producto)
    JOIN categoriaproducto c ON (p.id_categoria_producto = c.id) where c.id = ${categoria}`, (error, result) => {
        if(error){
            console.log(error);
        }
        //Query para traer la categoria de los productos
        conn.query(`SELECT * FROM categoriaproducto`, (error, categoria) => {
            if(error){
                console.log(error);
            }
            for (let i = 0; i < categoria.length; i++ ){

                categorias += `
                        <option>${categoria[i].id} ${categoria[i].nombre}</option>
                `
                }
            //Query para traer la Unidad de medida de los productos
            conn.query(`SELECT * FROM unidadmedidacompra`, (error, unidadCompra) => {
                if(error){
                    console.log(error);
                }
                for (let i = 0; i < unidadCompra.length; i++ ){

                    unidadCompras += `
                            <option>${unidadCompra[i].id} ${unidadCompra[i].nombre}</option>
                    `
                    }
                //Query para traer la unidad de preparacion de los productos
                conn.query(`SELECT * FROM unidadmedidapreparacion`, (error, unidadmedidapreparacion) => {
                    if(error){
                        console.log(error);
                    }
                    for (let i = 0; i < unidadmedidapreparacion.length; i++ ){

                        unidadPreparacion += `
                                <option>${unidadmedidapreparacion[i].id} ${unidadmedidapreparacion[i].nombre}</option>
                        `
                        }
                        
                        res.render('inventario', {productos:result, categorias:categorias, unidadCompras:unidadCompras, unidadPreparacion:unidadPreparacion});
                    });
            });
        });
    });
});
    

/*Agregar nuevo producto al Inventario*/
app.post('/inventario/agregar', (req,res) => {
    const nombre = req.body.nombre;
    const precio = req.body.precio;
    const categoria = req.body.categoria.substring(0,1);
    const UCompra = req.body.UCompra.substring(0,1);
    const unidadPreparacion = req.body.unidadPreparacion.substring(0,1);
    const vencimiento = req.body.vencimiento;
    
    conn.query(`INSERT INTO producto (nombre, precio_compra, id_unidad_medida_compra, id_unidad_medida_preparacion, 
    id_categoria_producto, tiempo_vencimiento) 
    VALUES ('${nombre}',${precio},${UCompra},${unidadPreparacion},${categoria},${vencimiento})`, (error, result) => {
        if(error){
            console.log(error);
        }
        res.redirect('/inventario')
    });
});

/*Modificar Inventario*/
app.post('/inventario/modificarNombre', (req, res) => {
    const idInventario = req.body.idInventario;
    const nombre = req.body.nombre;

    conn.query(`UPDATE producto SET nombre = '${nombre}' WHERE id = ${idInventario}`, (error, result) => {
        if(error){
            console.log(error);
        }
        res.redirect('/inventario');
    });
    
});

/*Eliminar Inventario*/
app.post('/inventario/eliminar', (req,res) => {
    const idInventario = req.body.eliminar;
    conn.query(`DELETE FROM producto WHERE id = ${idInventario}`, (error, result) => {
        if(error){
            console.log(error);
        }
        res.redirect('/inventario');
    });
});
/********************************************************RECETAS**************************************************************/

//Trayendo todas las recetas
app.get('/recetas', (req,res) => {
    let categoriaReceta='';
    conn.query('SELECT * FROM receta', (error, resultado) => {
        if(error){
            console.log(error)
        }
        conn.query('SELECT * FROM categoriareceta', (error, categorias)=>{
            if(error){
                console.log(error)
            }
            for(let i = 0; i < categorias.length; i++ ){
                categoriaReceta += `<option>${categorias[i].nombre}</option>` + categorias[i].id;
                console.log(categoriaReceta);
            }
            res.render('recetas', {recetas:resultado, categoriaReceta:categoriaReceta});
        });
    });
});

//Eliminar receta
app.post('/recetas/eliminar', (req,res) => {
    const idReceta = req.params.eliminar;
    conn.query('DELETE FROM receta WHERE id = ?',[idReceta], (error, result) => {
        if(error){
            console.log(error)
        }
        console.log(result);
        res.redirect('recetas');
    });
});

//Editar receta
app.post('/recetas/editar', (req,res) => {
    const idReceta =   req.params.eliminar;
    const nombre   =   req.params.nombre;
    const descripcion = req.params.descripcion;
    const nivel = req.params.nivel;
    const disponible = req.params.disponible;
    const precio_receta = req.params.precio_receta;
    const id_categoria_receta = req.params.id_categoria_receta; 

    conn.query('UPDATE receta SET nombre = ?, descripcion = ?, nivel = ?, disponible = ?, precio_receta = ?, id_categoria_receta = ? WHERE id = ?',
    [nombre, descripcion, nivel, disponible, precio_receta, id_categoria_receta, idReceta], 
    (error, result) => {
        if(error){
            console.log(error)
        }
        console.log(result);
        res.redirect('recetas');
    });
});

//Agregar

/*********************************************************************************************************************************/
app.get('/failure', (req,res) => {
    res.render('failure');
});