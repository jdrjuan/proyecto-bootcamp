import config from '../../config.js';
import mongoose from "mongoose";

class DBMongoDB {

    static READY_STATE_DISCONNECTED = 0;
    static READY_STATE_CONNECTED = 1;
    static READY_STATE_CONNECTING = 2;
    static READY_STATE_DISCONNECTING = 3;

    static oldIdPropertyName = '_id';
    static newIdPropertyName = 'id';

    static getObjectWithId(obj) {
        // console.log('ANTES:', obj);
        if (Array.isArray(obj)) {
            obj.forEach(element => DBMongoDB.replaceIdProperty(element));
        } else {
            DBMongoDB.replaceIdProperty(obj);
        }
        // console.log('DESPUÉS:', obj);

        return obj;
    }

    static replaceIdProperty(obj) {
        if (!obj[DBMongoDB.oldIdPropertyName]) {
            return;
        }
        obj[DBMongoDB.newIdPropertyName] = obj[DBMongoDB.oldIdPropertyName];
        delete obj[DBMongoDB.oldIdPropertyName];
    }

    static async connectDB() {
        try {
            // console.log('mongoose.connection.readyState:', mongoose.connection.readyState);
            if (mongoose.connection.readyState === DBMongoDB.READY_STATE_CONNECTED) {
                // console.log('Ya conectado');
                return true;
            }
            await mongoose.connect(config.MONGODB_CONNECTION_STR, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: config.MONGODB_TIMEOUT
            });
            console.log('Conexión con MongoDB exitosa.');
            return true;
        } catch (error) {
            console.error(`Error al intentar establecer la conexión con MongoDB. Detalle: ${error.message}`);
            return false;
        }
    }

}

export default DBMongoDB;
