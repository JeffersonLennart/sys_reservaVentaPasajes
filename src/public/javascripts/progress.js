$(document).ready(function () {
	var currentGfgStep, nextGfgStep, previousGfgStep;
	var opacity;
	var current = 1;
	var steps = $("fieldset").length;
    var ruta = {
        Origen: $(".from").val(),
        Destino: $(".to").val()
    }
    var reserva ={

    }

	setProgressBar(current);


	$(".next-step").click(function () {

		currentGfgStep = $(this).parent();
		nextGfgStep = $(this).parent().next();

		$("#progressbar li").eq($("fieldset")
			.index(nextGfgStep)).addClass("active");

		nextGfgStep.show();
		currentGfgStep.animate({ opacity: 0 }, {
			step: function (now) {
				opacity = 1 - now;

				currentGfgStep.css({
					'display': 'none',
					'position': 'relative'
				});
				nextGfgStep.css({ 'opacity': opacity });
			},
			duration: 500
		});
		setProgressBar(++current);
	});



	$(".previous-step").click(function () {

		currentGfgStep = $(this).parent();
		previousGfgStep = $(this).parent().prev();

		$("#progressbar li").eq($("fieldset")
			.index(currentGfgStep)).removeClass("active");

		previousGfgStep.show();

		currentGfgStep.animate({ opacity: 0 }, {
			step: function (now) {
				opacity = 1 - now;

				currentGfgStep.css({
					'display': 'none',
					'position': 'relative'
				});
				previousGfgStep.css({ 'opacity': opacity });
			},
			duration: 500
		});
		setProgressBar(--current);
	});

	function setProgressBar(currentStep) {
		var percent = parseFloat(100 / steps) * current;
		percent = percent.toFixed();
		$(".progress-bar")
			.css("width", percent + "%")
	}

	$(".submit").click(function () {
		return false;
	})

    
    // Para escoger las rutas

    $(".from").change(function () {
        let selectedFrom = $(this).val();  // Valor seleccionado en el primer selector        
        // Realizar la solicitud AJAX para obtener las opciones del segundo selector
        $.ajax({
            type: "POST",
            url: "/opcion_ruta",  // Ruta de la solicitud para obtener destinos basados en el origen
            data: { origen: selectedFrom },  // Enviar el origen seleccionado al servidor
            success: function (data) {
                // Limpiar el segundo selector
                $(".to").empty();
                // Agregar las opciones al segundo selector
                data.forEach(function (destino) {
                    $(".to").append($('<option>', {
                        value: destino.Destino,
                        text: destino.Destino
                    }));
                });
            },
            error: function (error) {
                console.error("Error:", error);
            }
        });
    });

    
    function makeAjaxRequestForStep(step) {
        // Define la solicitud AJAX para cada paso
        $.ajax({
            type: "GET",
            url: "/opcion_bus",  // Ruta de la solicitud para este paso
            // ... Otros parámetros de la solicitud ...
            success: function (data) {
                console.log("Step " + step + ":", data);  // Muestra los datos en la consola
            },
            error: function (error) {
                console.error("Error:", error);
            }
        });
    }

    // Para recuperar el bus 
    var buses;
    $("#step1 .next-step").click(function () {
        ruta.Origen = $(".from").val();
        ruta.Destino = $(".to").val(); 

        // Solicitud para obtener el id del cliente
        $.ajax({
            type: "GET",
            url: "/get_client",  // Ruta de la solicitud para obtener destinos basados en el origen
            success: function (data) {
                reserva.IdCliente = data.DNI;
            },
            error: function (error) {
                console.error("Error:", error);
            }
        });


        // solicitud ajax para obtener los buses de la ruta
        $.ajax({
            type: "POST",
            url: "/opcion_bus",  
            data: ruta ,  
            success: function (data) {
                buses = data;
                // Limpiar el segundo selector
                $(".bus-option").empty();
                // Agregar las opciones al segundo selector
                data.forEach(function (bus) {
                    $(".bus-option").append($('<option>', {
                        value: bus.IdBus,
                        text: bus.IdBus
                    }));
                });                
                // Añadir texto del primer bus
                $(".IdBus-des").text(buses[0].IdBus);
                $(".Capacidad-des").text(buses[0].Capacidad);
                $(".Modelo-des").text(buses[0].Modelo);
                $(".Precio-des").text(buses[0].Precio);
                reserva.IdRuta = buses[0].IdRuta;
                reserva.Capacidad = buses[0].Capacidad;
            },
            error: function (error) {
                console.error("Error:", error);
            }
        });
    });

    // Para llenar la descripción del bus
    $(".bus-option").change(function () {
        let selectedFrom = $(this).val();  // Valor seleccionado en el primer selector        
        
        let bus = buses.find(item => item.IdBus === selectedFrom)
        $(".IdBus-des").text(bus.IdBus);
        $(".Capacidad-des").text(bus.Capacidad);
        $(".Modelo-des").text(bus.Modelo);
        $(".Precio-des").text(bus.Precio);                        
        reserva.IdRuta = bus.IdRuta; // Almacenar la ruta
        reserva.Capacidad = bus.Capacidad;
    });


    $("#step2 .next-step").click(function () {
        reserva.IdBus = $(".bus-option").val();
        
        // solicitud ajax para obtener los buses de la ruta
        $.ajax({
            type: "POST",
            url: "/opcion_horario",  
            data: reserva ,  
            success: function (data) {
                // Iterar a través de los horarios y agregarlos a la lista
                $("#list-horarios").empty();
                data.forEach(function (horario) {
                    var listItem = `
                        <hr>
                        <li>
                            <h5 class="card-title" style="text-align: left;">Día: <span class="Dia-des" style="font-size: 16px;">${horario.Dia}</span></h5>
                        </li> 
                        <li>
                            <h5 class="card-title" style="text-align: left;">Hora: <span class="Hora-des" style="font-size: 16px;">${horario.Hora}</span></h5>
                        </li>                        
                    `;
                    $("#list-horarios").append(listItem);
                });              
            },
            error: function (error) {
                console.error("Error:", error);
            }
        });
    });

    $("#step3 .next-step").click(function () {
        reserva.Fecha = $("#Fecha").val();
        
        // solicitud ajax para obtener los asientos del bus
        $.ajax({
            type: "POST",
            url: "/opcion_asiento",  
            data: reserva ,  
            success: function (data) {
                
                $(".asientos-ocup").empty();                
                data.forEach(function (asiento) {
                    $(".asientos-ocup").append($('<option>', {
                        value: asiento.NroAsiento,
                        text: asiento.NroAsiento
                    }));
                });         
                
                $(".asientos-disp").empty();
                for (i=1 ; i <= reserva.Capacidad; i++){
                    const existe = data.some(item => item.NroAsiento === i); 
                    if(!existe){
                        $(".asientos-disp").append($('<option>', {
                            value: i,
                            text: i                            
                        }));
                    }
                }
            },
            error: function (error) {
                console.error("Error:", error);
            }
        });
    });


    $(".btn-reservar").click(function () {
        reserva.NroAsiento = $(".asientos-disp").val();
        // solicitud ajax para obtener los buses de la ruta
        $.ajax({
            type: "POST",
            url: "/reserva_add_client",  
            data: reserva ,  
            success: function(response) {
                if (response.redirectTo) {
                  // Redirige a la nueva ruta
                  window.location.href = response.redirectTo;            
                } else {
                  // Procesa otros casos de éxito aquí si es necesario
                }
              },
            error: function (error) {
                console.error("Error:", error);
            }
        });
    });

});
