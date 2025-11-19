// Importamos las librerías requeridas
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

// Creamos la instancia de la aplicación Express
const app = express();

// Configuramos el parser para que entienda JSON
const jsonParser = bodyParser.json();

// Creación de la tabla "todos" en SQLite ---
// Abrimos la conexión con el archivo de la base de datos
let db = new sqlite3.Database('./base.sqlite3', (err) => {
    if (err) {
        console.error("Error al abrir la base de datos:", err.message);
    }
    console.log('Conectado a la base de datos SQLite.');

    // Usamos db.run para ejecutar un comando SQL
    // "CREATE TABLE IF NOT EXISTS" asegura que la tabla solo se crea si no existe
    db.run(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo TEXT NOT NULL,
        created_at INTEGER
    )`, (err) => {
        if (err) {
            console.error("Error al crear la tabla:", err.message);
        } else {
            console.log('Tabla "todos" creada o ya existente.');
        }
    });
});

// Endpoint de prueba para verificar que el servidor funciona
app.get('/', function (req, res) {
    res.json({ status: 'Servidor funcionando correctamente' });
});


// Creación del endpoint "agrega_todo" ---
// Usamos app.post para definir una ruta que acepta el método POST
app.post('/agrega_todo', jsonParser, function (req, res) {
    
    // Modificación para guardar datos en la tabla ---
    // Extraemos el campo 'todo' del cuerpo (body) de la petición JSON
    const { todo } = req.body;
    console.log(req.body);
    // Nos aseguramos de que el campo 'todo' no venga vacío
    if (!todo) {
        return res.status(400).json({ error: 'El campo "todo" es obligatorio.' });
    }

    // Preparamos la sentencia SQL para insertar datos
    const sql = 'INSERT INTO todos (todo, created_at) VALUES (?, CURRENT_TIMESTAMP)';
    
    // Ejecutamos la sentencia con el dato proporcionado
    db.run(sql, [todo], function(err) {
        if (err) {
            console.error("Error al insertar en la base de datos:", err.message);
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }

        // Devolvemos un JSON con estado HTTP 201 
        // Si la operación es exitosa, devolvemos el estado 201 (Created)
        // y un JSON que lo confirma, incluyendo el ID del nuevo registro.
        // 'this.lastID' es una propiedad del callback que nos da el ID del último elemento insertado.
        res.status(201).json({
            message: 'Todo agregado con éxito',
            id: this.lastID
        });
    });
});

// Endpoint GET para obtener la lista de tareas
app.get('/todos', (req, res) => {
    // Consulta SQL para seleccionar todo
    const sql = "SELECT * FROM todos";

    db.all(sql, [], (err, rows) => {
        if (err) {
            // Si hay error en la base de datos
            res.status(500).json({ error: err.message });
            return;
        }
        // Si todo sale bien, enviamos las filas (rows) en un JSON
        res.json({
            data: rows
        });
    });
});

// Endpoint para usar con postman
// app.get('/todos/:id', (req, res) => {
    
//     //Obtenemos el ID desde req.params (parámetros de ruta
//     const { id } = req.params;

//     //Preparamos la consulta SQL
//     const sql = "SELECT * FROM todos WHERE id = ?";

//     //Usamos db.get() porque solo esperamos UNA fila
//     //El callback nos da (err, row), donde 'row' es un objeto
//     db.get(sql, [id], (err, row) => {
//         if (err) {
//             console.error("Error al consultar la base de datos:", err.message);
//             res.status(500).json({ error: 'Error interno del servidor.' });
//             return;
//         }

//         //Manejamos el caso donde no se encuentra una tarea con ese ID
//         if (!row) {
//             res.status(404).json({ error: 'Tarea no encontrada.' });
//             return;
//         }

//         //Si se encuentra, devolvemos 200 OK y la tarea encontrada
//         res.status(200).json({
//             message: 'Tarea obtenida con éxito',
//             data: row
//         });
//     });
// });


// Ponemos el servidor a escuchar en el puerto 3000

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Aplicación corriendo en http://localhost:${port}`);
});
