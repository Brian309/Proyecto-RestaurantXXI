$(document).ready(function() {
    $("#form-validate").validate({
      rules: {
        capacidad : {
            required: true,
            minlength: 3,
            number: true
          },
          disponible: {
            required: true
          }
        },
        messages : {
            capacidad : {
            required: "Porfavor ingrese una capacidad",
            number: "Porfavor digite una capacidad valida",
            minlength: "Digite una capácidad basica"
          },
          disponible: {
            required: "Porfavor digite un estado"
          }
          }
      });
    });