-- https://www.oracle.com/database/technologies/appdev/quickstartnodeonprem.html#macos-tab
-- https://chat.openai.com/c/d3001033-d23d-45c4-b5cc-529a570face6

CREATE TABLE Users ( 
    username VARCHAR(20) NOT NULL, 
    full_name VARCHAR(255) NOT NULL, 
    email VARCHAR(255) NOT NULL, 
    password VARCHAR(60),

    PRIMARY KEY (username)
);

insert into Users values ('glebby', 'Gleb Sokolovski', 's2015488@ed.ac.uk', '$2a$12$2yhgD8tqwizEVDpzI.9mBezWftbYxcEF9D46v7g1x0RrFDGHAweiS')