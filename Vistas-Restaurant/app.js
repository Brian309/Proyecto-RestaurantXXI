const express = require('express');
const app = express();
const conn = require("./database/bbdd")


//Configuramos el puerto donde correra la aplicacion.
app.listen(5000, ()=>{
    console.log('http://localhost:5000');
});

//motor de plantillas
app.set('view engine', 'ejs');

//Definiendo la carpeta de archivos estaticos como funciones y estilos
app.use('/resource', express.static('public'));
app.use('/resource', express.static(__dirname + '/public'));


//Pagina principal
app.get('/tablet', (req, res) =>{
    let contenido="";
    let cat="";
    const i = conn.query("SELECT * FROM platos WHERE disponible = 'S' ", (error, result)=>{
        if(error){
            console.log(error)
        }  

        for (let i = 0; i < result.length; i++ ){
            console.log(result[i])


            
            contenido += `
                        <div class="card" style="width:400px">
                            <img class="card-img-bottom" src="../resource/imagenes/`+result[i].nom_plato+`.png" alt="Card image" style="width:100%">
                            <div class="card-body">
                                <h3 class="card-title"> `+ result[i].nom_plato +` </h3>
                                <p class="card-text">`+ result[i].desc_plato +` </p>
                                <p class="card-text h4">$`+ result[i].precio +` </p>
                                <a href="/ver/`+result[i].idplatos+`" class="btn btn-primary">See Profile</a>
                                </div>
                            </div>
                            <br>
                        </div>
                        `
        }
        
    

        res.status(201).render('../Tablet/index', {contenidos:contenido, cat:cat})
    });
});


//Seleccion de categorias del menu
app.get('/tablet/:categoria', (req, res) => {
    let categoria = req.params.categoria;
    let contenido="";
    let cat="";
    console.log(categoria)
    const i = conn.query("SELECT * FROM platos WHERE categoria = ? and disponible = 'S' ", [categoria], (error, result)=>{
        if(error){
            console.log(error)
        }  

        for (let i =0; i < result.length; i++ ){
            console.log(result[i])
            contenido += `
            <div class="card" style="width:400px">
            <img class="card-img-bottom" src="../resource/imagenes/`+result[i].nom_plato+`.png" alt="Card image" style="width:100%">
            <div class="card-body">
                <h4 class="card-title"> `+ result[i].nom_plato +` </h4>
                <p class="card-text">`+ result[i].desc_plato +` </p>
                <a href="#" class="btn btn-primary">See Profile</a>
                </div>
            </div>
            <br>
            </div>`
        }
        

        switch(categoria){
            case "1":{ 
                cat = "Bebidas"
                break;
            }
            case "2":{
                cat="Licores"
                break;
            }
            case "3":{
                cat="Ensaladas"
                break;
            }
            case "4":{
                cat = "Postres"
                break;
            }
            case "5":{
                cat = "Platos Principales"
                break;
            }
        }
         


        res.status(201).render('../Tablet/index', {contenidos:contenido, cat:cat})
    });
    
});



app.post("/tablet/pedir", (req,res) => {
    
});
