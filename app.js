//Invocamos express
const express = require('express');
const app = express();

//Seteamos urlencode para capturar los datos del form
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//invocamos dotenv
const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

// el directorio public
app.use('/resource', express.static('public'));
app.use('/resource', express.static(__dirname + '/public'));

//5- motor de plantillas
app.set('view engine', 'ejs');


//6- Invocamos el haching de password
const bcryptjs = require('bcryptjs');

//7- var de session
const session = require('express-session')
app.use(session({
    secret:'secret',
    resave:true,
    saveUnitialized:true
}));

//8- invocamos modulo de coneccion de la bbbdd
const conn = require('./database/db');

//9- Estableciendo las rutas


app.get('/login', (req,res)=>{
    res.render('login');
});

app.get('/register', (req,res)=>{
    res.render('register')
})


//10- Registratiomn
app.post('/register', async (req,res)=>{
    const email = req.body.email;
    const nombre = req.body.nombre;
    const rol = req.body.rol;
    const password = req.body.password;
    let passwordHash = await bcryptjs.hash(password, 8);
    conn.query('INSERT INTO usuario SET ?', {email:email, nombre:nombre, rol:rol, pass:passwordHash}, async(error, results)=>{
        if(error){
            console.log(error);
        }
        else{
            res.render('register', {
                alert:true,
                alertTitle:'Registro',
                alertMessagge:'Registrado exitosamente',
                alertIcon:'success',
                showConfirmButton:false,
                timer:1500,
                ruta:''
            })
        }
    })
});

//11- Autenticacion
app.post('/auth', async (req,res)=>{
    const user = req.body.usuario;
    const pass = req.body.password;
    let passwordHash = await bcryptjs.hash(pass, 8);
    if(user && pass){
        conn.query('SELECT * FROM usuario WHERE email = ?', [user], async (error, results)=>{
            if(results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))){
                res.render('login',{
                    alert:true,
                    alertTitle:'Errror',
                    alertMessagge:'Usuario y/o password incorrectos',
                    alertIcon:'error',
                    showConfirmButton:true,
                    timer:false,
                    ruta:'login'
                })
            }
            else{
                req.session.loggedin = true; //para autenticar en otras paginas
                req.session.name = results[0].nombre;
                res.render('login',{
                    alert:true,
                    alertTitle:'Conexion Exitosa!',
                    alertMessagge:'Login correcto',
                    alertIcon:'success',
                    showConfirmButton:false,
                    timer:1500,
                    ruta:''
                });
            }
        })
    }else{
        res.render('login',{
            alert:true,
            alertTitle:'Advertencia',
            alertMessagge:'Ingrese un usuario y contraseña porfavor',
            alertIcon:'warning',
            showConfirmButton:true,
            timer:false,
            ruta:'login'
        })
    }
});


//12 - Autenticacion paginas
app.get('/', (req,res)=>{
    if(req.session.loggedin){
        res.render('index',{
            login:true,
            name: req.session.name
        });
    }else{
        res.render('index',{
            login: false,
            name:'Debe iniciar sesion'
        })
    }
})

//13- logout
app.get('/logout',(req, res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
}) 

app.listen(3000, (req, res)=>{
    console.log('http://localhost:3000');
});
