const { Router } = require("express");
const { format } = require("date-fns");

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

router.post("/register_data", (req, res) => {
  const nuevoCliente = {
    IdCliente: req.body.DNI,
    Nombre: req.body.name,
    Direccion: req.body.address,
    Telefono: req.body.phone,
    Email: req.body.email,
    Pass: req.body.password,
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
        if (result.length && req.body.password == result[0].Pass) {
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
  conn.query("select * from Cliente", (err, result) => {
    if (err) {
      console.error("Error al acceder al elemento", err);
      res.status(500).send("Error al acceder al elemento de la base de datos");
      return;
    }
    res.render("clientes", { clientes: result });
  });
});

router.get("/rutas", (req, res) => {
  conn.query("select * from Ruta", (err, result) => {
    if (err) {
      console.error("Error al acceder al elemento", err);
      res.status(500).send("Error al acceder al elemento de la base de datos");
      return;
    }
    res.render("rutas", { rutas: result });
  });
});

router.get("/buses", (req, res) => {
  conn.query("select * from Bus", (err, result) => {
    if (err) {
      console.error("Error al acceder al elemento", err);
      res.status(500).send("Error al acceder al elemento de la base de datos");
      return;
    }
    res.render("buses", { buses: result });
  });
});

router.get("/horarios_viaje", (req, res) => {
  conn.query("select * from horarioviaje", (err, result) => {
    if (err) {
      console.error("Error al acceder al elemento", err);
      res.status(500).send("Error al acceder al elemento de la base de datos");
      return;
    }
    res.render("horarios_viaje", { horarios_viaje: result });
  });
});

router.get("/reservas", (req, res) => {
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
        Fecha: format(new Date(item.Fecha), "dd-MM-yy"),
      };
    });
    res.render("reservas", { reservas: reservas });
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
        FechaVenta: format(new Date(item.FechaVenta), "dd-MM-yy"),
      };
    });
    res.render("ventas", { ventas: ventas });
  });
});

router.get("/profile_historial", (req, res) => {
  res.render("profile_historial");
});

// Rutas para editar registro de tablas como admin

router.post("/client_edit", (req, res) => {
  console.log(req.body);
  //res.render("clientes")
  res.send("Falta");
});

// Rutas para eliminar registros de tablas como admin

router.get("/eliminar_cliente/:id", (req, res) => {
  const { id } = req.params;
  conn.query(
    "DELETE FROM cliente WHERE IdCliente = ?;",
    [id],
    (err, result) => {
      if (err) {
        console.error("No se pudo eliminar el elemento", err);
        res
          .status(500)
          .send("Error al eliminar el elemento de la base de datos");
        return;
      }

      res.redirect("/clientes");
    }
  );
});

router.get("/eliminar_ruta/:id", (req, res) => {
  const { id } = req.params;
  conn.query("DELETE FROM ruta WHERE IdRuta = ?;", [id], (err, result) => {
    if (err) {
      console.error("No se pudo eliminar el elemento", err);
      res.status(500).send("Error al eliminar el elemento de la base de datos");
      return;
    }

    res.redirect("/rutas");
  });
});

router.get("/eliminar_bus/:id", (req, res) => {
  const { id } = req.params;
  conn.query("DELETE FROM bus WHERE IdBus = ?;", [id], (err, result) => {
    if (err) {
      console.error("No se pudo eliminar el elemento", err);
      res.status(500).send("Error al eliminar el elemento de la base de datos");
      return;
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
        console.error("No se pudo eliminar el elemento", err);
        res
          .status(500)
          .send("Error al eliminar el elemento de la base de datos");
        return;
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

module.exports = router;
