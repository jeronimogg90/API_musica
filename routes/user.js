// importar depencias
const express = require("express")
const check = require("../middlewares/auth")
const multer = require("multer")

// Cargar router
const router = express.Router()

// Importar controlador
const UserController = require("../controllers/user")

// Configurar subida de arhcivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/avatars/")
    },
    filename: (req, file, cb) => {
        cb(null, "avatar-"+Date.now()+"-"+file.originalname)
    }
})

const uploads = multer({storage})

// Definir turas
router.get("/prueba", UserController.prueba)
router.post("/register", UserController.register)
router.post("/login", UserController.login)
router.get("/profile/:id", check.auth, UserController.profile)
router.put("/update", check.auth, UserController.update)
router.post("/upload", [check.auth, uploads.single("file0")], UserController.upload)
router.get("/avatar/:file", UserController.avatar)

// Exportar router

module.exports = router