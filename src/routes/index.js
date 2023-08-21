const { Router } = require("express");
const { format } = require("date-fns");
const bcryptjs = require("bcryptjs")

var conn = require("../db.js");

const router = Router();

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/register", (req, res) => {  
  error = req.session.error;
  req.session.destroy();
  
  res.render("register", { error });
});

router.get("/login", (req, res) => {
  error = req.session.error;
  req.session.destroy();
  res.render("login", { error });
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

router.post("/register_data", async (req, res) => {
  const nuevoCliente = {
    IdCliente: req.body.DNI,
    Nombre: req.body.name,
    Direccion: req.body.address,
    Telefono: req.body.phone,
    Email: req.body.email,
    Pass: await bcryptjs.hash(req.body.password, 10) // Encriptar la contraseña
  };

  // Recuperar el elemento de la base de datos si existe
  conn.query(
    "select * from Cliente where email = ?;",
    [req.body.email],
    (err, result) => {
      if (err) {
        console.error("Error al acceder al elemento", err);
        res
          .status(500)
          .send("Error al acceder al elemento de la base de datos");
        return;
      }
      if (result.length == 0) {
        // El cliente no existe en la base de datos
        conn.query("INSERT INTO Cliente SET ?", nuevoCliente, (err, result) => {
          if (err) {
            console.error("Error al insertar el nuevo cliente:", err);
            res
              .status(500)
              .send("Error al insertar el nuevo cliente en la base de datos");
            return;
          }          
          req.session.user = req.body;
          res.redirect("/profile");
        });
      } else {
        // El cliente ya existe en la base de datos        
        req.session.error = 1;
        res.redirect("/register");
      }
    }
  );
});

// router.get("/test", async (req, res) => {
//   res.json({
//     pass : await bcryptjs.hash("Natalia", 10)
//   })
// })

router.post("/login_data", (req, res) => {
  // Verificar si la clave introducida es del admin
  if (
    req.body.password == "admin" &&
    req.body.email == "admin@transglobalexpress.com"
  ) {
    res.redirect("/admin");
  } else {
    // Recuperar el elemento de la base de datos
    conn.query(
      "select * from Cliente where email = ?;",
      [req.body.email],
      (err, result) => {
        if (err) {
          console.error("Error al acceder al elemento", err);
          res
            .status(500)
            .send("Error al acceder al elemento de la base de datos");
          return;
        }
        // Redirigir a la página profile del usuario
        let comparePass = bcryptjs.compareSync(req.body.password,result[0].Pass);
        if (result.length && comparePass) {
          let data_user = {
            DNI: result[0].IdCliente,
            name: result[0].Nombre,
            address: result[0].Direccion,
            phone: result[0].Telefono,
            email: result[0].Email,
            password: result[0].Pass,
          };          
          req.session.user = data_user;
          res.redirect("/profile");
        } else if (result.length == 0) {
          // Si el correo electrónico ingresado no existe en la bd
          req.session.error = 1;          
          res.redirect("/login");
        } else {
          // Si la contraseña ingresada no es la correcta          
          req.session.error = 2;
          res.redirect("/login");
        }
      }
    );
  }
});

router.get("/profile", (req, res) => {  
  const user = req.session.user;  
  res.render("profile", { user });
});

router.post("/profile_change", (req, res) => {
  const { name, email, DNI, address, phone } = req.body;
  // Editar datos del cliente
  conn.query(
    "UPDATE Cliente SET Nombre = ?, Direccion = ?, Telefono = ? WHERE IdCliente = ?",
    [name, address, phone, DNI],
    (err, result) => {
      if (err) {
        console.error("Error al modificar por el perfil de usuario:", err);
        res.status(500).send("Error al modificar en la base de datos");
        return;
      }
      // Redirigir a la página profile del usuario
      req.session.user = req.body;
      res.redirect("/profile");
    }
  );
});

router.get("/admin", (req, res) => {
  res.render("admin");
});

router.get("/clientes", (req, res) => {
  error = req.session.error;
  req.session.destroy();
  conn.query("select * from Cliente", (err, result) => {
    if (err) {
      console.error("Error al acceder al elemento", err);
      res.status(500).send("Error al acceder al elemento de la base de datos");
      return;
    }
    res.render("clientes", { clientes: result, error });
  });
});

router.get("/rutas", (req, res) => {
  error = req.session.error;
  req.session.destroy();
  conn.query("select * from Ruta", (err, result) => {
    if (err) {
      console.error("Error al acceder al elemento", err);
      res.status(500).send("Error al acceder al elemento de la base de datos");
      return;
    }
    res.render("rutas", { rutas: result, error });
  });
});

router.get("/buses", (req, res) => {
  error = req.session.error;
  req.session.destroy();
  conn.query("select * from Bus", (err, result) => {
    if (err) {
      console.error("Error al acceder al elemento", err);
      res.status(500).send("Error al acceder al elemento de la base de datos");
      return;
    }
    res.render("buses", { buses: result, error });
  });
});

router.get("/horarios_viaje", (req, res) => {
  error = req.session.error;
  req.session.destroy();
  conn.query("select * from horarioviaje", (err, result) => {
    if (err) {
      console.error("Error al acceder al elemento", err);
      res.status(500).send("Error al acceder al elemento de la base de datos");
      return;
    }
    res.render("horarios_viaje", { horarios_viaje: result, error });
  });
});

router.get("/reservas", (req, res) => {
  error = req.session.error;
  req.session.destroy();
  conn.query("select * from Reserva", (err, result) => {
    if (err) {
      console.error("Error al acceder al elemento", err);
      res.status(500).send("Error al acceder al elemento de la base de datos");
      return;
    }
    // Formatear las fechas en el resultado de la consulta
    const reservas = result.map((item) => {
      return {
        ...item,
        Fecha: format(new Date(item.Fecha), "dd-MM-yyyy"),
      };
    });
    res.render("reservas", { reservas: reservas, error });
  });
});

router.get("/ventas", (req, res) => {
  conn.query("select * from Venta", (err, result) => {
    if (err) {
      console.error("Error al acceder al elemento", err);
      res.status(500).send("Error al acceder al elemento de la base de datos");
      return;
    }
    // Formatear las fechas en el resultado de la consulta
    const ventas = result.map((item) => {
      return {
        ...item,
        FechaVenta: format(new Date(item.FechaVenta), "dd-MM-yyyy"),
      };
    });
    res.render("ventas", { ventas: ventas });
  });
});



// Rutas para añadir registro en tablas como admin

router.post("/client_add", (req, res) => {
  const nuevoCliente = {
    IdCliente: req.body.IdCliente,
    Nombre: req.body.Nombre,
    Direccion: req.body.Direccion,
    Telefono: req.body.Telefono,
    Email: req.body.Email,
    Pass: req.body.Pass
  };
  // Insertar el nuevo cliente en la base de datos
  conn.query('INSERT INTO Cliente SET ?', nuevoCliente, (err, result) => {
    if (err) {
      
      // Falta implementar la validación para DNI y contraseña
      console.error('Error al insertar el nuevo cliente:', err);
      res.status(500).send('Error al insertar el nuevo cliente en la base de datos');
      return;
    }
    res.redirect('/clientes');
  });
});

router.post("/ruta_add", (req, res) => {
  const nuevaRuta = {
    IdRuta: req.body.IdRuta,
    Origen: req.body.Origen,
    Destino: req.body.Destino,    
  };
  // Insertar el nuevo cliente en la base de datos
  conn.query('INSERT INTO ruta SET ?', nuevaRuta, (err, result) => {
    if (err) {
      
      // Falta implementar la validación para DNI y contraseña
      console.error('Error al insertar la nueva ruta:', err);
      res.status(500).send('Error al insertar el elemento en la base de datos');
      return;
    }
    res.redirect('/rutas');
  });
});

router.post("/bus_add", (req, res) => {
  const nuevaRuta = {
    IdBus: req.body.IdBus,
    Capacidad: req.body.Capacidad,
    Modelo: req.body.Modelo,    
    IdRuta: req.body.IdRuta,
    Precio: req.body.Precio    
  };
  // Insertar el nuevo cliente en la base de datos
  conn.query('INSERT INTO bus SET ?', nuevaRuta, (err, result) => {
    if (err) {
      
      // Falta implementar la validación para DNI y contraseña
      console.error('Error al insertar la nueva ruta:', err);
      res.status(500).send('Error al insertar el elemento en la base de datos');
      return;
    }
    res.redirect('/buses');
  });
});

router.post("/horario_add", (req, res) => {
  const nuevoHorario = {
    IdHorario: req.body.IdHorario,
    IdBus: req.body.IdBus,
    Dia: req.body.Dia,    
    Hora: req.body.Hora,    
  };
  // Insertar el nuevo cliente en la base de datos
  conn.query('INSERT INTO horarioviaje SET ?', nuevoHorario, (err, result) => {
    if (err) {
      
      // Falta implementar la validación para DNI y contraseña
      console.error('Error al insertar la nueva ruta:', err);
      res.status(500).send('Error al insertar el elemento en la base de datos');
      return;
    }
    res.redirect('/horarios_viaje');
  });
});

router.post("/reserva_add", (req, res) => {
  const nuevaReserva = {
    IdReserva: req.body.IdReserva,
    Fecha: req.body.Fecha,
    NroAsiento: req.body.NroAsiento,    
    IdCliente: req.body.IdCliente,    
    IdBus: req.body.IdBus,    
    IdRuta: req.body.IdRuta,    
  };
  // Insertar el nuevo cliente en la base de datos
  conn.query('INSERT INTO reserva SET ?', nuevaReserva, (err, result) => {
    if (err) {
      
      // Falta implementar la validación para DNI y contraseña
      console.error('Error al insertar la nueva ruta:', err);
      res.status(500).send('Error al insertar el elemento en la base de datos');
      return;
    }
    res.redirect('/reservas');
  });
});

router.post("/venta_add", (req, res) => {
  const nuevaVenta = {
    IdVenta: req.body.IdVenta,
    FechaVenta: req.body.FechaVenta, 
    IdReserva: req.body.IdReserva,      
  };
  // Insertar el nuevo cliente en la base de datos
  conn.query('INSERT INTO venta SET ?', nuevaVenta, (err, result) => {
    if (err) {
      
      // Falta implementar la validación para DNI y contraseña
      console.error('Error al insertar la nueva ruta:', err);
      res.status(500).send('Error al insertar el elemento en la base de datos');
      return;
    }
    res.redirect('/ventas');
  });
});



// Rutas para editar registro de tablas como admin

router.post("/client_edit", (req, res) => {
  const { DNI, name, address, phone, email } = req.body;
  // Editar datos del cliente
  conn.query(
    "UPDATE Cliente SET Nombre = ?, Direccion = ?, Telefono = ? WHERE IdCliente = ?",
    [name, address, phone, DNI],
    (err, result) => {
      if (err) {
        console.error("Error al modificar cliente:", err);
        res.status(500).send("Error al modificar en la base de datos");
        return;
      }      
      res.redirect("/clientes");
    }
  );
});

router.post("/ruta_edit", (req, res) => {
  const { IdRuta, Origen, Destino } = req.body;
  // Editar datos de la ruta
  conn.query(
    "UPDATE ruta SET Origen = ?, Destino = ? WHERE IdRuta = ?",
    [Origen, Destino, IdRuta],
    (err, result) => {
      if (err) {
        console.error("Error al modificar ruta:", err);
        res.status(500).send("Error al modificar en la base de datos");
        return;
      }      
      res.redirect("/rutas");
    }
  );
});

router.post("/bus_edit", (req, res) => {
  const { IdBus, Capacidad, Modelo, IdRuta, Precio } = req.body;
  // Editar datos del bus
  conn.query(
    "UPDATE bus SET Capacidad = ?, Modelo = ?, IdRuta = ?, Precio = ? WHERE IdBus = ?",
    [Capacidad, Modelo, IdRuta, Precio, IdBus],
    (err, result) => {
      if (err) {
        req.session.error = 1;  
      }      
      res.redirect("/buses");
    }
  );
});

router.post("/horario_edit", (req, res) => {
  const { IdHorario, IdBus, Dia, Hora } = req.body;
  // Editar datos del horario
  conn.query(
    "UPDATE horarioviaje SET IdBus = ?, Dia = ?, Hora = ? WHERE IdHorario = ?",
    [IdBus, Dia, Hora, IdHorario],
    (err, result) => {
      if (err) {
        req.session.error = 1;  
      }      
      res.redirect("/horarios_viaje");
    }
  );
});

router.post("/reserva_edit", (req, res) => {
  const { IdReserva, Fecha, NroAsiento, IdCliente, IdBus, IdRuta } = req.body;
  // Editar datos del horario
  conn.query(
    "UPDATE reserva SET Fecha = ?, NroAsiento = ?, IdCliente = ?, IdBus = ?, IdRuta = ? WHERE IdReserva = ?",
    [Fecha, NroAsiento, IdCliente, IdBus, IdRuta, IdReserva],
    (err, result) => {
      if (err) {
        req.session.error = 1;          
      }      
      res.redirect("/reservas");
    }
  );
});

router.post("/venta_edit", (req, res) => {
  const { IdVenta, FechaVenta, IdReserva } = req.body;
  // Editar datos del horario
  conn.query(
    "UPDATE venta SET FechaVenta = ? WHERE IdVenta = ?",
    [FechaVenta, IdVenta],
    (err, result) => {
      if (err) {
        console.error("Error al modificar venta:", err);
        res.status(500).send("Error al modificar en la base de datos");
        return;      
      }      
      res.redirect("/ventas");
    }
  );
});





// Rutas para eliminar registros de tablas como admin

router.get("/eliminar_cliente/:id", (req, res) => {
  const { id } = req.params;
  conn.query(
    "DELETE FROM cliente WHERE IdCliente = ?;",
    [id],
    (err, result) => {
      if (err) {
        req.session.error = 2;
      }

      res.redirect("/clientes");
    }
  );
});

router.get("/eliminar_ruta/:id", (req, res) => {
  const { id } = req.params;
  conn.query("DELETE FROM ruta WHERE IdRuta = ?;", [id], (err, result) => {
    if (err) {
      req.session.error = 2;  
    }

    res.redirect("/rutas");
  });
});

router.get("/eliminar_bus/:id", (req, res) => {
  const { id } = req.params;
  conn.query("DELETE FROM bus WHERE IdBus = ?;", [id], (err, result) => {
    if (err) {
      req.session.error = 2;
    }

    res.redirect("/buses");
  });
});

router.get("/eliminar_horario/:id", (req, res) => {
  const { id } = req.params;
  conn.query(
    "DELETE FROM horarioviaje WHERE IdHorario = ?;",
    [id],
    (err, result) => {
      if (err) {
        console.error("No se pudo eliminar el elemento", err);
        res
          .status(500)
          .send("Error al eliminar el elemento de la base de datos");
        return;
      }

      res.redirect("/horarios_viaje");
    }
  );
});

router.get("/eliminar_reserva/:id", (req, res) => {
  const { id } = req.params;
  conn.query(
    "DELETE FROM reserva WHERE IdReserva = ?;",
    [id],
    (err, result) => {
      if (err) {
        req.session.error = 2;
      }

      res.redirect("/reservas");
    }
  );
});

router.get("/eliminar_venta/:id", (req, res) => {
  const { id } = req.params;
  conn.query("DELETE FROM venta WHERE IdVenta = ?;", [id], (err, result) => {
    if (err) {
      console.error("No se pudo eliminar el elemento", err);
      res.status(500).send("Error al eliminar el elemento de la base de datos");
      return;
    }

    res.redirect("/ventas");
  });
});


router.get("/reserva_client", (req, res) => {
  conn.query("select distinct Origen from ruta", (err, result) => {
    if (err) {
      console.error("Error al acceder al elemento", err);
      res.status(500).send("Error al acceder al elemento de la base de datos");
      return;
    }
    conn.query("select Destino from ruta where Origen = ?;", [result[0].Origen], (err, result2) => {
      if (err) {
        console.error("Error al acceder al elemento", err);
        res.status(500).send("Error al acceder al elemento de la base de datos");
        return;
      }
      res.render("reserva_client", { rutas: result, rutas2: result2});
    });
  });
});


// Todas las rutas para realizar la reserva
router.get("/get_client", (req,res) => {  
  res.json(req.session.user);
})


router.post("/opcion_ruta", (req, res) => {  
  conn.query("select Destino from ruta where Origen = ?;", [req.body.origen], (err, result) => {
    if (err) {
      console.error("Error al acceder al elemento", err);
      res.status(500).send("Error al acceder al elemento de la base de datos");
      return;
    }    
    res.json(result)
  });
});

router.post("/opcion_bus", (req, res) => {
  conn.query("select * from bus b join ruta r on b.IdRuta = r.IdRuta where r.Origen = ? and r.Destino = ?;",
   [req.body.Origen, req.body.Destino], (err, result) => {
    if (err) {
      console.error("Error al acceder al elemento", err);
      res.status(500).send("Error al acceder al elemento de la base de datos");
      return;
    }
    res.json(result)
  });
});

router.post("/opcion_horario", (req, res) => {  
  conn.query("select * from horarioviaje where IdBus = ?;", [req.body.IdBus], (err, result) => {
    if (err) {
      console.error("Error al acceder al elemento", err);
      res.status(500).send("Error al acceder al elemento de la base de datos");
      return;
    }    
    res.json(result)
  });
});

router.post("/opcion_asiento", (req, res) => {  
  conn.query("select NroAsiento from reserva where IdBus = ? and IdRuta = ?;", [req.body.IdBus, req.body.IdRuta], (err, result) => {
    if (err) {
      console.error("Error al acceder al elemento", err);
      res.status(500).send("Error al acceder al elemento de la base de datos");
      return;
    }    
    res.json(result)
  });
});


router.post("/reserva_add_client", (req, res) => {

  conn.query("select IdReserva from reserva order by IdReserva desc", (err, result) => {
    if (err) {
      console.error("Error al acceder al elemento", err);
      res.status(500).send("Error al acceder al elemento de la base de datos");
      return;
    }
    console.log(result)
    console.log(result[0])
    IdReserva = ""
    if (result.length === 0){
       IdReserva = "RES1"
    }
    else{
      // Proceso para agregar el IdReserva
      const cadena = result[0].IdReserva;
      const numeroParte = parseInt(cadena.match(/\d+/)[0]);
      const numeroAumentado = numeroParte + 1;
      IdReserva = "RES"+numeroAumentado;
    }
    // Insertar nueva reserva
    conn.query('INSERT INTO reserva values (?,?,?,?,?,?);', [IdReserva,req.body.Fecha,req.body.NroAsiento,req.body.IdCliente,
      req.body.IdBus, req.body.IdRuta], (err, result) => {
      if (err) {        
        // Falta implementar la validación para DNI y contraseña
        console.error('Error al insertar la nueva ruta:', err);
        res.status(500).send('Error al insertar el elemento en la base de datos');
        return;
      }
      const redirectTo = "/profile";
      res.json({ redirectTo });
    });
  });

});


router.post("/reserva_add_client", (req, res) => {

  conn.query("select IdReserva from reserva order by IdReserva desc", (err, result) => {
    if (err) {
      console.error("Error al acceder al elemento", err);
      res.status(500).send("Error al acceder al elemento de la base de datos");
      return;
    }
    console.log(result)
    console.log(result[0])
    IdReserva = ""
    if (result.length === 0){
       IdReserva = "RES1"
    }
    else{
      // Proceso para agregar el IdReserva
      const cadena = result[0].IdReserva;
      const numeroParte = parseInt(cadena.match(/\d+/)[0]);
      const numeroAumentado = numeroParte + 1;
      IdReserva = "RES"+numeroAumentado;
    }
    // Insertar nueva reserva
    conn.query('INSERT INTO reserva values (?,?,?,?,?,?);', [IdReserva,req.body.Fecha,req.body.NroAsiento,req.body.IdCliente,
      req.body.IdBus, req.body.IdRuta], (err, result) => {
      if (err) {        
        // Falta implementar la validación para DNI y contraseña
        console.error('Error al insertar la nueva ruta:', err);
        res.status(500).send('Error al insertar el elemento en la base de datos');
        return;
      }
      const redirectTo = "/profile";
      res.json({ redirectTo });
    });
  });

});

router.get("/profile_historial", (req, res) => {
  const IdCliente = req.session.user.DNI;
  
  conn.query("select * from reserva where IdCliente = ?;", [IdCliente], (err, result) => {
    if (err) {
      console.error("Error al acceder al elemento", err);
      res.status(500).send("Error al acceder al elemento de la base de datos");
      return;
    }    
          conn.query(`
          select v.IdVenta,v.FechaVenta, r.IdReserva from Cliente c join Reserva r on c.IdCliente=r.IdCliente 
          join Venta v on r.IdReserva=v.IdReserva where c.IdCliente= ?
          `,[IdCliente], (err, result2) => {
            if (err) {
              console.error("Error al acceder al elemento", err);
              res.status(500).send("Error al acceder al elemento de la base de datos");
              return;
            }
          
            // Formatear las fechas en el resultado de la consulta
            const reservas = result.map((item) => {
              return {
                ...item,
                Fecha: format(new Date(item.Fecha), "dd-MM-yyyy"),
              };
            });
            // Formatear las fechas en el resultado de la consulta
            const ventas = result2.map((item) => {
              return {
                ...item,
                FechaVenta: format(new Date(item.FechaVenta), "dd-MM-yyyy"),
              };
            });
            //req.session.reservas = reservas;
            res.render("profile_historial", { reservas:reservas, ventas: ventas});
          });   
        
      });
  });


router.get("/comprar_client", (req,res) => {
  const IdCliente = req.session.user.DNI;

  conn.query(`
  SELECT * 
FROM Cliente c 
JOIN Reserva r ON c.IdCliente = r.IdCliente 
WHERE c.IdCliente = ?
AND NOT EXISTS (
    SELECT 1 
    FROM Venta v 
    WHERE r.IdReserva = v.IdReserva
)
  `,[IdCliente], (err, result) => {
    if (err) {
      console.error("Error al acceder al elemento", err);
      res.status(500).send("Error al acceder al elemento de la base de datos");
      return;
    }
    console.log(result);
    // Formatear las fechas en el resultado de la consulta
    const reservas = result.map((item) => {
      return {
        ...item,
        Fecha: format(new Date(item.Fecha), "dd-MM-yyyy"),
      };
    });
    //req.session.reservas = reservas;
    res.render("comprar", { reservas: reservas});
  });

})





router.get("/venta_add_client/:id", (req, res) => {
  
  const { id } = req.params;

  conn.query("select IdVenta from venta order by IdVenta desc", (err, result) => {
    if (err) {
      console.error("Error al acceder al elemento", err);
      res.status(500).send("Error al acceder al elemento de la base de datos");
      return;
    }

    IdVenta = ""
    if (result.length === 0){
       IdVenta = "VEN1"
    }
    else{
      // Proceso para agregar el IdVenta
      const cadena = result[0].IdVenta;
      const numeroParte = parseInt(cadena.match(/\d+/)[0]);
      const numeroAumentado = numeroParte + 1;
      IdVenta = "VEN"+numeroAumentado;
    }
    // Insertar nueva reserva
    const fechaActual = new Date();
    const anio = fechaActual.getFullYear();
    const mes = fechaActual.getMonth() + 1; // Los meses en JavaScript son base 0, por lo que sumamos 1
    const día = fechaActual.getDate();
    const Fecha = `${anio}-${mes}-${día}`;

    conn.query('INSERT INTO venta values (?,?,?);', [IdVenta,Fecha,id], (err, result) => {
      if (err) {        
        // Falta implementar la validación para DNI y contraseña
        console.error('Error al insertar la nueva ruta:', err);
        res.status(500).send('Error al insertar el elemento en la base de datos');
        return;
      }
      res.redirect("/comprar_client")
    });
  });

});


module.exports = router;
