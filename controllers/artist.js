//Importaciones
const Artist = require("../models/artist")
const Album = require("../models/album")
const Song = require("../models/song")
const mongoosePagination = require("mongoose-pagination")

// accion de prueba
const prueba = (req, res) => {
    return res.status(200).send({
        status: "success",
        message: "Mensaje enviado desde: controllers/artist.js"
    })
}

// Accion de guardar un artista
const save = async (req, res) => {
    // Recoger datos a guardar
    let params = req.body

    // Crear el objeto a guardar
    let artist = new Artist(params)

    // Guardarlo
    try {
        let artistStored = await artist.save()

        if (!artistStored) {
            throw new Error("error al guardar el artista")
        }

        return res.status(200).send({
            status: "success",
            message: "Accion de guardar artista",
            artist: artistStored
        })
    } catch (error) {
        if (error) {
            return res.status(400).send({
                status: "error",
                message: "No se ha guardado el artista"
            })
        }
    }
}

const one = async (req, res) => {
    // Sacar un parametro por url
    const id = req.params.id

    // Find para buscar el artista
    try {
        const artist = await Artist.findById(id);

        if (!artist) {
            throw new Error("No se encontraron artistas");
        }

        return res.status(200).send({
            status: "success",
            artista: artist
        })

    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "Error al buscar un artista"
        })
    }

}

var list = async (req, res) => {
    // Sacar la posible pagina
    let page = 1;
    if (req.params.page) {
        page = req.params.page
    }

    // Definir cuantos elementos vamos a tener por pagina
    const itemsPerPage = 5

    // Find, ordenarlo y paginarlo
    try {
        const artists = await Artist.find()
            .sort("name")
            .paginate(page, itemsPerPage)

        if (!artists) {
            throw new Error("Ha fallado la busqueda de los artistas")
        }

        const total = await Artist.find();

        return res.status(200).send({
            status: "success",
            artistas: artists,
            total: total.length,
            page,
            itemsPerPage
        })

    } catch (error) {
        return res.status(404).send({
            status: "error",
            error: error.toString()
        })
    }

}

const update = async (req, res) => {
    // Recoger id artista url
    const id = req.params.id

    // Recoger datos body
    const data = req.body

    try {
        // Buyscar y actualizar
        const artistUpdated = await Artist.findByIdAndUpdate(id, data, { new: true })

        if (!artistUpdated) {
            throw new Error("No se han encontrado artistas")
        }

        return res.status(200).send({
            status: "success",
            artistUpdated
        })

    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: error.toString()
        })
    }
}

const remove = async (req, res) => {
    // sacar el id del artista de la url
    const id = req.params.id

    try {
        // Hacer consulta para buscar y eliminar el artista
        const artistRemoved = await Artist.findByIdAndDelete(id)
        if(!artistRemoved){
            throw new Error("No se puedo borrar el artista")
        }

        const albumRemoved = await Album.find({artist: artistRemoved._id}).deleteMany()
        if(!albumRemoved){
            throw new Error("No se puedo borrar el album")
        }

        const songRemoved = await Song.find({album: albumRemoved._id}).deleteMany()
        if(!songRemoved){
            throw new Error("No se puedo borrar las canciones")
        }
        
        // Devolver resultado
        return res.status(200).send({
            status: "success",
            artistRemoved,
            albumRemoved,
            songRemoved
        })

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al borrar un artista",
            error: error.toString()
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