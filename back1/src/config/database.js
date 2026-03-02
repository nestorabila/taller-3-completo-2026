const { Sequelize } = require('sequelize');
const initModels = require('../modelos/init-models');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        }
    },
});

sequelize.authenticate()
    .then(() => console.log('Conectado a la base de datos!'))
    .catch(err => console.error('Error al conectar:', err));

const db = initModels(sequelize);
module.exports = { sequelize, db };
