const monto = document.getElementById('monto').value;
const descuento = document.getElementById("descuento");
const total = document.getElementById("total");
const efectivo = document.getElementById("efectivos");  
const vuelto = document.getElementById("vuelto");
const pagar = document.getElementById("pagarEfectivo");
const boleta = document.getElementById("boleta").innerText;

console.log(boleta);
console.log(monto)
total.value = monto;
vuelto.innerHTML = monto;
efectivo.value = 0;


descuento.addEventListener('keyup', ()=> {
  total.value = monto - descuento.value;
});

efectivo.addEventListener('keyup', () => {
  vuelto.value = efectivo.value - total.value;
  console.log(efectivo.value)
});
pagar.addEventListener('click', (e) =>{
  e.preventDefault;
  pagar.href = `/admin/${boleta}/${efectivo.value}/${total.value}`;
});
