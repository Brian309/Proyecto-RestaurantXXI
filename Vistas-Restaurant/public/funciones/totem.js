const btnGuardarCliente = document.querySelector('#guardar-cliente');
btnGuardarCliente.addEventListener('click', guardarCliente);

//Extrayendo fecha y hora actual
let date = new Date;
date = date.toISOString().substring(0,10) + ' ' + date.toISOString().substring(11,19);
console.log(date)

let cliente;

function guardarCliente() {
    const mesa = document.querySelector('#mesa').value;
    const personas = document.querySelector('#personas').value;

    
    // Revisar si hay campos vacios
    const camposVacios = [mesa, personas].some( campo => campo == '' );
    
    if(camposVacios) {
        alert('rellene los campos');
     
    } else {

        //Almacenar como objeto 
        cliente = { mesa:mesa, date:date, personas:personas};
        localStorage.setItem('Cliente', JSON.stringify(cliente));
        seleccionarMesa()
    };
};

function seleccionarMesa() {

    let xml = new XMLHttpRequest;
    
    xml.open('POST', '/totem/reservar')
    
    /* Vamos a enviar datos codificados en JSON */
    xml.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    
    xml.send(JSON.stringify({cliente}));

    Swal.fire({
        title:'Reservar',
        text:`Mesa ${cliente.mesa} reservada`,
        icon:'success',
        showConfirmButton:false,
        timer:2000
        }).then(()=>{
             window.location='/comensal'
        });
};


