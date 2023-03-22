// importar depencias
const express = require("express")
const check = require("../middlewares/auth")

// Cargar router
const router = express.Router()

// Importar controlador
const SongController = require("../controllers/song")

// Definir turas
router.get("/prueba", SongController.prueba)
router.post("/save", check.auth, SongController.save)
router.get("/one/:id", check.auth, SongController.one)
router.get("/list/:albumId", check.auth, SongController.list)
router.put("/update/:songId", check.auth, SongController.update)
router.delete("/remove/:id", check.auth, SongController.remove)

// Exportar router

module.exports = router