// Importar mongoose
const mongoose = require("mongoose")

// Metodo de conexion
const connection = async() => {
    try{
        mongoose.set('strictQuery', false)
        await mongoose.connect("mongodb+srv://root:root@cluster0.rirelou.mongodb.net/app_musica");

        console.log("Conectado correctamente a la bd: app_musica")
    } catch(error){
        console.log(error)
        throw new Error("No se ha establecido la conexion a la bbdd !!")
    }
}

// Exportar conexion
module.exports = connection