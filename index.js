// Imprtar conexion a base de datos
const connection = require("./database/connection")

// Importar dependencias
const express = require("express")
const cors = require("cors")

// Mensaje de bienvenida
console.log("API REST con Node para la app de musica arrancada!!")

// Ejecutar conexion a la bd
connection()

// Crear servidor de node
const app = express()
const port = 3910

// Cofnigurar cors
app.use(cors())

// Convertir los datos del body a objetos js
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// Cargar configuracion de rutas
const UserRoutes = require("./routes/user")
const ArtistRoutes = require("./routes/artist")
const SongRoutes = require("./routes/song")
const AlbumRoutes = require("./routes/album")

app.use("/api/user", UserRoutes)
app.use("/api/artist", ArtistRoutes)
app.use("/api/song", SongRoutes)
app.use("/api/album", AlbumRoutes)

// Ruta de prueba
app.get("/ruta-probando", (req, res) => {
    return res.status(200).send({
        "id": 12,
        "nombre": "Jerónimo",
        "apellido": "García García"
    })
})

// Poner el servidor a escuchar peticiones http
app.listen(port, () => {
    console.log("Servidor de node está escuchando en el puerto: ", port)
})