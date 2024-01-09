CREATE TABLE Users (
    user_id int NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(60) NOT NULL,

    PRIMARY KEY (user_id)
);

insert into Users (first_name, last_name, email, password) values ('Gleb', 'Sokolovski', 's2015488@ed.ac.uk', '$2a$12$lqOJOQQqbfbfz9RnZSHdquHSOiYjbMvxXOHHZo7PuosyG7/nkOuKe')