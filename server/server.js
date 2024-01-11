import express from 'express';
// import sequelize from './db.js';
import router from './routes.js';


// DATABASE: ------------------------------------------------
import oracledb from 'oracledb';

async function runApp()
{
    let connection;
    let result;
    try {
        connection = await oracledb.getConnection({ user: "admin", password: "semply37", connectionString: "localhost/xepdb1" });
        console.log("Successfully connected to Oracle Database");

        // Now query the rows back
        result = await connection.execute( `select username, full_name from system.Users`, [], { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT });
        const rs = result.resultSet; let row;
        while ((row = await rs.getRow())) {
            console.log(row.USERNAME + " " + row.FULL_NAME);
        }
        await rs.close();
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}
runApp();

// ----------------------------------------------------------



const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});


app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(router);

// sequelize.sync(); 

// start server
app.listen(3000, () => {
    console.log(`Server listening on port ${3000}.`)
})