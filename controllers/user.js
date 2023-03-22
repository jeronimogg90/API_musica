// importaciones
const validate = require("../helpers/validate")
const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("../helpers/jwt")
const fs = require("fs")
const path = require("path")

// accion de prueba
const prueba = (req, res) => {
    return res.status(200).send({
        status: "success",
        message: "Mensaje enviado desde: controllers/user.js"
    })
}

// Registro
const register = async (req, res) => {

    // Recoger datos del a peticion
    let params = req.body

    // Comprobar que me llegan bien
    if (!params.name || !params.nick || !params.email || !params.password) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar"
        })
    }

    // Validar los datos
    try {
        validate(params)
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Validacion no superada"
        })
    }


    try {
        // Control usuarios duplicados
        const users = await User.find({
            $or: [
                { email: params.email.toLowerCase() },
                { nick: params.nick.toLowerCase() }
            ]
        }).exec()

        if (users && users.length >= 1) {
            return res.status(200).send({
                status: "error",
                message: "El usuario ya existe"
            })
        }

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error en la consulta de control de usuarios duplicados"
        })
    }

    // Cifrar la contraseña
    let pwd = await bcrypt.hash(params.password, 10);
    params.password = pwd;

    // Crear objeto del usuario
    let userToSave = new User(params)

    // Guardar usuario en la bd
    try {
        const userStored = await userToSave.save()

        // Limpiar el objeto a devolver
        let userCreated = userStored.toObject()
        delete userCreated.password
        delete userCreated.role

        // Devolver un resultado
        return res.status(200).send({
            status: "success",
            message: "Usuario registrado correctamente",
            user: userCreated
        })
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al registrar usuario"
        })
    }
}

const login = async (req, res) => {

    // Recoger los parametros
    let params = req.body

    // Comprobar que me llegan
    if (!params.email || !params.password) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar"
        })
    }

    try {

        // Buscar en la bd si existe el mail
        const user = await User.findOne({ email: params.email })
            .select("+password +role") // añade la password a la consulta, por defecto no se muestra
            .exec()

        if (!user) {
            return res.status(400).send({
                status: "error",
                message: "No existe el ususario"
            })
        }

        // Comprobar su contraseña
        const pwd = bcrypt.compareSync(params.password, user.password)

        if (!pwd) {
            return res.status(401).send({
                status: "error",
                message: "Login incorrecto"
            })
        }

        // limpiar el campo contraseña del objeto
        let identityUser = user.toObject()
        delete identityUser.password
        delete identityUser.role

        // Conseguir el token jwt (crear un servicio que nos permita crear el token)
        const token = jwt.createToken(user)

        // Devolver datos usuario y token
        return res.status(200).send({
            status: "success",
            message: "Metodo de login",
            identityUser,
            token
        })

    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: "Error en la busqueda del usuario"
        })
    }
}

const profile = async (req, res) => {

    // Recoger id usuario url
    const id = req.params.id

    // Consulta para sacar los datos del perfil
    try {
        const user = await User.findById(id)
        if (!user) {
            return res.status(404).send({
                status: "error",
                message: "El usuario no existe"
            })
        }

        // Devolver resultado
        return res.status(200).send({
            status: "success",
            message: "metodo profile",
            user
        })
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: "Fallo en la consulta del perfil"
        })
    }
}

const update = async (req, res) => {

    // Recoger datos usuario identificado
    let userIdentity = req.user

    // Recoger datos a actualizar
    let userToUpdate = req.body

    try {
        // Comprobar si el usuario existe
        let users = await User.find({
            $or: [
                { email: userToUpdate.email.toLowerCase() },
                { nick: userToUpdate.nick.toLowerCase() }
            ]
        }).exec()

        // Comprobar si el usuario exsite y no soy yo (el identificado)
        let userIsset = false;
        users.forEach(user => {
            if (user && user._id != userIdentity.id) userIsset = true;
        })

        // Si ya existe devuelvo una respuesta
        if (userIsset) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe"
            })
        }

        // Cifrar password si me llegara
        if (userToUpdate.password) {
            let pwd = await bcrypt.hash(userToUpdate.password, 10)
            userToUpdate.password = pwd
        } else {
            delete userToUpdate.password
        }

        try {

            // Buscar usuario y actualizar datos
            let userUpdated = await User.findByIdAndUpdate({ _id: userIdentity.id }, userToUpdate, { new: true })
            if (!userUpdated) {
                return res.status(400).send({
                    status: "error",
                    message: "Error al actualizar"
                })
            }

            // Devolver una respuesta
            return res.status(200).send({
                status: "success",
                message: "metodo update datos usuario",
                userUpdated
            })

        } catch (error) {
            return res.status(500).send({
                status: "error",
                message: "Error al actualizar"
            })
        }
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error en la consulta de usuarios"
        })
    }
}

const upload = async (req, res) => {

    // Configuracion de subida (multer) 
    // Cofnigurado en las rutas

    // Recoger fichero de imagen y comprobar si existe
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "La petición no incluye la imagen"
        })
    }

    // Conseguir el nombre del archivo
    let image = req.file.originalname

    // Sacar info de la imagen
    const imageSplit = image.split("\.")
    const extension = imageSplit[1]

    // Comprobar si la extension es valida
    if (extension != "png" && extension != "jpeg" && extension != "jpg" && extension != "gif") {
        // Borrar archivo
        const filePath = req.file.path
        const fileDeleted = fs.unlinkSync(filePath)

        // Devolver mensaje de error
        return res.status(404).send({
            status: "error",
            message: "La extension no es valida"
        })
    }

    try {
        // Si es correcto guardar la imagen en la bbdd
        const userUpdated = await User.findOneAndUpdate({ _id: req.user.id }, { image: req.file.filename }, { new: true })

        if (!userUpdated) {
            return res.status(404).send({
                status: "error",
                message: "No se ha actualizado el usuario",
            })
        }
        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            file: req.file,
            userUpdated
        })
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al actualizar el usuario",
            file: req.file
        })
    }
}

const avatar = (req, res) => {
    // Sacar el parametro de la url
    const file = req.params.file

    // Montar e path real de la imagen
    const filePath = "./uploads/avatars/"+file

    // Comprobar que existe el fichero
    fs.stat(filePath, (error, exists) => {
        if(error || !exists){
            return res.status(404).send({
                status: "error",
                message: "No existe la imagen"
            })
        }
    })

    return res.sendFile(path.resolve(filePath))

    // Devolver el fichero
}

// exportar acciones
module.exports = {
    prueba,
    register,
    login,
    profile,
    update,
    upload,
    avatar
}