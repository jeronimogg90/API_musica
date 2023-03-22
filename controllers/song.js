const Song = require("../models/song")

// accion de prueba
const prueba = (req, res) => {
    return res.status(200).send({
        status: "success",
        message: "Mensaje enviado desde: controllers/song.js"
    })
}

const save = async (req, res) => {
    // recoger los datos que me llegan por el body
    const data = req.body

    // Crear un objeto con mi modelo
    let song = new Song(data)

    // Guardar datos
    try {

        const songStored = await song.save()

        if (!songStored) {
            throw new Error("No se puedo guardar la canción")
        }

        // Devolver datos
        return res.status(200).send({
            status: "success",
            songStored
        })

    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: error.toString()
        })
    }
}

const one = async (req, res) => {
    let songId = req.params.id

    try {
        let song = await Song.findById(songId).populate("album")

        if (!song) {
            throw new Error("no sixte la cancion")
        }

        return res.status(200).send({
            status: "success",
            song
        })
    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: error.toString()
        })
    }

}

const list = async (req, res) => {
    let albumId = req.params.albumId

    try {
        let songList = await Song.find({ album: albumId })
            .populate({
                path: "album",
                populate: {
                    path: "artist",
                    model: "Artist"
                }
            })
            .sort("track")
        if (!songList) {
            throw new Error("No hay canciones")
        }

        return res.status(200).send({
            status: "success",
            songList
        })
    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: error.toString()
        })
    }

}

const update = async (req, res) => {
    // Recoger parametro por url id cancino
    let songId = req.params.songId

    // Recoger datos para guardar
    let params = req.body

    try {
        // Busqueda y actualizacion
        let songUpdated = await Song.findByIdAndUpdate(songId, params, {new: true})

        if(!songUpdated){
            throw new Error("No se ha podido actualizar la cancion")
        }

        return res.status(200).send({
            status: "success",
            songUpdated
        })

        // DEvolver datos actualizados
    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: error.toString()
        })
    }

}

const remove = async (req, res) => {
    const songId = req.params.id

    try{
        const songDeleted = await Song.findByIdAndDelete(songId)

        if(!songDeleted){
            throw new Error("No se ha podido eliminar la cancion")
        }

        return res.status(200).send({
            status: "success",
            songDeleted
        })
    } catch( error ){
        return res.status(404).send({
            status: "error",
            message: error.toString()
        })
    }
}

// exportar acciones
module.exports = {
    prueba,
    save,
    one,
    list,
    update,
    remove
}