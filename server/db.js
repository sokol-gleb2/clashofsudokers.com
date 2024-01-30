import oracledb from 'oracledb';

// DATABASE: ------------------------------------------------

export default async function executeQuery(type, query, row_to_pass) {
    let connection;

    try {
        connection = await oracledb.getConnection({
            user: "admin", 
            password: "semply37", 
            connectionString: "localhost/xepdb1"
        });
        console.log("Successfully connected to Oracle Database");

        if (type == "GET") {
            let rows = [];

            const result = await connection.execute(query, row_to_pass, { resultSet: true });
            const rs = result.resultSet; 
            let row;

            while ((row = await rs.getRow())) {
                rows.push(row); // Add each row to the rows array
            }

            console.log(rows);

            await rs.close();
            return rows; // Return the collected rows

        } else if (type == "POST") {

            const result = await connection.execute(query, row_to_pass, { autoCommit: true });
            connection.commit();
            return result.rowsAffected;

        }

        
    } catch (err) {
        console.error(err);
        throw err; // or return null; or return { error: err.message };
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

// ----------------------------------------------------------