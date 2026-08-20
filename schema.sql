-- Reference schema. Tables are created automatically by SQLAlchemy on first
-- run, as long as the `lyricdrop` database already exists (see README).

CREATE DATABASE IF NOT EXISTS lyricdrop CHARACTER SET utf8mb4;
USE lyricdrop;

CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prompt VARCHAR(200) NOT NULL,
    option_a VARCHAR(200) NOT NULL,
    option_b VARCHAR(200) NOT NULL,
    option_c VARCHAR(200) NOT NULL,
    option_d VARCHAR(200) NOT NULL,
    answer_index INT NOT NULL,
    `order` INT DEFAULT 0
);

CREATE TABLE scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_name VARCHAR(60) NOT NULL,
    score INT NOT NULL,
    best_streak INT DEFAULT 0,
    created_at DATETIME
);
