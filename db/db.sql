-- https://www.oracle.com/database/technologies/appdev/quickstartnodeonprem.html#macos-tab
-- https://chat.openai.com/c/d3001033-d23d-45c4-b5cc-529a570face6

CREATE TABLE Users (
    username VARCHAR(20) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(60),
    rank NUMBER DEFAULT 0 NOT NULL,
    wins NUMBER DEFAULT 0 NOT NULL,
    losses NUMBER DEFAULT 0 NOT NULL,
    draws NUMBER DEFAULT 0 NOT NULL,
    PRIMARY KEY (username)
);

CREATE TABLE Clashes (
    clash_id VARCHAR(57) NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration NUMBER DEFAULT NULL,
    winner_username VARCHAR(20) DEFAULT NULL,
    PRIMARY KEY (clash_id),
    FOREIGN KEY (winner_username) REFERENCES Users (username)
);

CREATE TABLE UserClashes (
    clash_id VARCHAR(57) NOT NULL,
    username VARCHAR(20) NOT NULL,
    start_rank NUMBER NOT NULL,
    end_rank NUMBER DEFAULT NULL,
    PRIMARY KEY (clash_id, username),
    FOREIGN KEY (clash_id) REFERENCES Clashes (clash_id),
    FOREIGN KEY (username) REFERENCES Users (username)
);


-- CREATE USER admin IDENTIFIED BY semply37;
-- grant create session to admin;
-- GRANT SELECT, INSERT, UPDATE, DELETE, ALTER ON system.Users TO admin;
-- GRANT SELECT, INSERT, UPDATE, DELETE, ALTER ON system.Games TO admin;
-- GRANT SELECT, INSERT, UPDATE, DELETE, ALTER ON system.UserGames TO admin;


insert into Users values ('glebby', 'Gleb Sokolovski', 's2015488@ed.ac.uk', '$2a$12$2yhgD8tqwizEVDpzI.9mBezWftbYxcEF9D46v7g1x0RrFDGHAweiS')