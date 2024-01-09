// import DB_PASS from './server.js';
const DB_PASS = "semply37";
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('clashofsudokers', 'root', `${DB_PASS}`, {
    dialect: 'mysql',
    host: 'localhost', 
});

export default sequelize;