$(document).ready(function() {
    $("#form-validate").validate({
      rules: {
          email : {
            required: true,
            minlength: 7,
            email:true
          },
          password: {
            required: true,
            min: 8,
            password:true,
          }
        },
        messages : {
          email : {
            required: "Porfavor digite un gmail",
            minlength: "Digite almenos un gmail de 7 digitos",
            email:'Digite un email valido'
          },
          password: {
            required: "Porfavor digite una contraseña",
            min: "Porfavor digite una password de almenos 8 digitos"
          }
          }
      });
    });