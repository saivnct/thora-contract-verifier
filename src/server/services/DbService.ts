import config from "../../config";
const Pool = require('pg').Pool;

export const pool= new Pool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
})