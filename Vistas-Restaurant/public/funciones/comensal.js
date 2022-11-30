// Variables
  const carrito = document.querySelector('#carrito');
  const listaPlatos = document.querySelector('#contenido');
  const contenedorCarrito = document.querySelector('#lista-carrito tbody');
  const vaciarCarritoBtn = document.querySelector('#vaciar-carrito');
  const hacerPedidoBtn = document.querySelector('#hacer-pedido');
  //const cat = document.getElementById('cat').value;
  let total=8;
  let articulosCarrito = [];
  let carritoTotal = document.querySelector('.shoppingCartTotal');

  // Listeners
cargarEventListeners();

function cargarEventListeners() {
     // Dispara cuando se presiona "Agregar Carrito"
     listaPlatos.addEventListener('click', agregarPlato);

     // Cuando se elimina un curso del carrito
     carrito.addEventListener('click', eliminarPlato);

     // Al Vaciar el carrito
     vaciarCarritoBtn.addEventListener('click', vaciarCarrito);

     

     // NUEVO: Contenido cargado
     document.addEventListener('DOMContentLoaded', () => {
          articulosCarrito = JSON.parse(localStorage.getItem('carrito')) || []  
          ;
          // console.log(articulosCarrito);
          carritoHTML();
     });

     hacerPedidoBtn.addEventListener('click', hacerPedido);
}




// Función que añade el plato al carrito
function agregarPlato(e) {
  e.preventDefault();
  // Delegation para agregar-carrito
  if(e.target.classList.contains('agregar-carrito')) {
       const plato = e.target.parentElement.parentElement;
       // Enviamos el plato seleccionado para tomar sus datos
       console.log(plato); 
       leerDatosCurso(plato);
       Swal.fire({
          title:'Agregando Plato',
          text:'Plato agregado exitosamente',
          icon:'success',
          showConfirmButton:false,
          timer:2500
          }).then(()=>{
               window.location='/comensal'
          })
  }
  
}

  // Lee los datos del plato
function leerDatosCurso(plato) {
    const infoPlato = {
       imagen: plato.querySelector('.card-img-bottom').src,
       titulo: plato.querySelector('.card-title').textContent,
       precio: plato.querySelector('.card-text-price').textContent,
       id: plato.querySelector('a').getAttribute('data-id'), 
       cantidad: 1,
  }



  if( articulosCarrito.some( plato => plato.id === infoPlato.id ) ) { 
       const platos = articulosCarrito.map( plato => {
            if( plato.id === infoPlato.id ) {
                 let cantidad = parseInt(plato.cantidad);
                 cantidad++
                 plato.cantidad =  cantidad;
                 return plato;
            } else {
                 return plato;
            }
       });
       articulosCarrito = [...platos];
  }  else {
       articulosCarrito = [...articulosCarrito, infoPlato];
  }



     // console.log(articulosCarrito)
     carritoHTML();
}

// Elimina el plato del carrito en el DOM
function eliminarPlato(e) {
  e.preventDefault();
  if(e.target.classList.contains('borrar-plato') ) {
       // e.target.parentElement.parentElement.remove();
       const plato = e.target.parentElement.parentElement;
       const platoId = plato.querySelector('a').getAttribute('data-id');
       
       // Eliminar del arreglo del carrito
       articulosCarrito = articulosCarrito.filter(plato => plato.id !== platoId);

       carritoHTML();

       Swal.fire({
          title:'Removiendo',
          text:'Plato Removido exitosamente',
          icon:'success',
          showConfirmButton:false,
          timer:2000
          }).then(()=>{
               window.location='/comensal'
          })
  }
}


// Muestra el plato seleccionado en el Carrito
function carritoHTML() {

  vaciarCarrito();

     let subtotal=0;
     articulosCarrito.forEach(plato => {
       const row = document.createElement('tr');
       subtotal=plato.precio.substring(1,)*plato.cantidad
       row.innerHTML = `
            <td>  
                 <img src="${plato.imagen}" width=100>
            </td>
            <td>${plato.titulo}</td>
            <td>${plato.precio}</td>
            <td>${plato.cantidad} </td>
            <td>$${subtotal}</td>
            <td>
                 <a href="#" class="borrar-plato" data-id="${plato.id}">X</a>
            </td>
       `;
       total=total+subtotal
       contenedorCarrito.appendChild(row);
  });

  carritoTotal.innerHTML = '$' + total;

  //Sincronizar localstorage
 sincronizarStorage();



}
// LocalStorage: 
function sincronizarStorage() {
  localStorage.setItem('carrito', JSON.stringify(articulosCarrito));
}

// Elimina los platos del carrito
function vaciarCarrito() {
  
  //Vaciando carrito
  while(contenedorCarrito.firstChild) {
       contenedorCarrito.removeChild(contenedorCarrito.firstChild);
       
   }
   localStorage.removeItem('carrito')
   carritoTotal.innerHTML = '$'+0;
   total=0;

}

// Hacemos el pedido de los platos seleccionados
function hacerPedido(e) {

     e.preventDefault();
     
     let xml = new XMLHttpRequest();
     /* Queremos hacer uso del método POST (y no GET) */
     xml.open("POST", "/comensal/pedir");
     /* Vamos a enviar datos codificados en JSON */
     xml.setRequestHeader("Content-Type", "application/json; charset=utf-8");
     /* Aquí están los datos codificados en JSON */
     xml.send(JSON.stringify({articulosCarrito}));
     vaciarCarrito();
     
     Swal.fire({
          title:'Pedir',
          text:'Pedido enviado a cocina',
          icon:'success',
          showConfirmButton:false,
          timer:2000
          }).then(()=>{
               window.location='/comensal/'
          });

 }