const Album = require("../models/album")

// accion de prueba
const prueba = (req, res) => {
    return res.status(200).send({
        status: "success",
        message: "Mensaje enviado desde: controllers/album.js"
    })
}

const save = async (req, res) => {

    // Sacar datos enviados en el body
    let params = req.body

    // Crear Objeto
    let album = new Album(params)

    try {
        // Guardar el objeto
        const albumStored = await album.save()
        if (!albumStored) {
            throw new Error("Ha fallado el servicio de guardar un album")
        }

        return res.status(200).send({
            status: "success",
            message: "metodo de guardar un album",
            albumStored
        })
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: error.toString()
        })
    }
}

const one = async (req, res) => {

    // Sacar el id del album
    const albumId = req.params.id

    try {
        // find y popular info del artista
        // podemos poner la sintaxis de populate con el path o sin el path
        const album = await Album.findById(albumId).populate({ path: "artist" })

        if (!album) {
            throw new Error("No se ha encontrado ningun algum")
        }

        // Devolver datos
        return res.status(200).send({
            status: "success",
            album
        })
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: error.toString()
        })
    }

}

const list = async (req, res) => {
    // Sacar el id del artista
    const artistId = req.params.artistId

    try {
        // podemos poner la sintaxis de populate con el path o sin el path
        const listAlbums = await Album.find({artist: artistId}).populate("artist")

        if(!listAlbums){
            throw new Error("No se han encontrado albums")
        }

        // devolver resutlado
        return res.status(200).send({
            status: "success",
            listAlbums
        })

    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: error.toString()
        })
    }

}

const update = async (req, res) => {
    // Recoger id de la url
    const albumId = req.params.albumId

    // recoger el body
    const data = req.body

    // hacer un find and update
    try{
        const albumUpdated = await Album.findByIdAndUpdate(albumId, data, {new:true})
        if(!albumUpdated){
            throw new Error("No se ha actualizado el album")
        }

        return res.status(200).send({
            status: "success",
            albumUpdated
        })
    } catch(error){
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
    update
}