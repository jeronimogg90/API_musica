// importar depencias
const express = require("express")

// Cargar router
const router = express.Router()

// Middelware de autenticacion
const check = require("../middlewares/auth")

// Importar controlador
const AlbumController = require("../controllers/album")

// Definir turas
router.get("/prueba", AlbumController.prueba)
router.post("/save", check.auth, AlbumController.save)
router.get("/one/:id", check.auth, AlbumController.one)
router.get("/list/:artistId", check.auth, AlbumController.list)
router.put("/update/:albumId", check.auth, AlbumController.update)

// Exportar router

module.exports = router