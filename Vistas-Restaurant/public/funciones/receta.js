$(document).ready(function() {
    $("#form-validate").validate({
      rules: {
          nombre : {
            required: true,
            minlength: 3,
          },
          precio: {
            required: true,
            number: true,
            min: 100
          },
          nivel: {
            required: true
          },
          descripcion: {
            required: true
          },
          categoria: {
            required: true
          }
        },
        messages : {
          nombre : {
            required: "Porfavor digite un nombre",
            minlength: "Digite un nombre valido",
          },
          precio: {
            required: "Porfavor digite un precio",
            number: "Porfavor digite un precio numerico",
            min: "Porfavor digite un precio valido"
          },
          nivel: {
            required: "Porfavor digite un nivel de dificultad"
          },
          descripcion: {
            required: "Porfavor digite una descripcion"
          },
          categoria: {
            required: "Porfavor digite una categoria"
          },
          }
      });
    });