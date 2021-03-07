DROP TABLE IF EXISTS schedule;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS contact;
DROP TABLE IF EXISTS reply;
DROP TABLE IF EXISTS answer;
DROP TABLE IF EXISTS ask;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255),
    role numeric,
    location VARCHAR(255),
    img VARCHAR(255),
    type_of_work VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    phone_num VARCHAR(255) UNIQUE,
    status numeric,
    exp numeric,
    username VARCHAR(255) UNIQUE
  );


  CREATE TABLE schedule (
    id SERIAL PRIMARY KEY,
    day VARCHAR(255),
    user_id int,
    hours_avl VARCHAR(255),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id)
  );


    CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    user_id int,
    text VARCHAR(255),
    owner_id  int,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_owner_id FOREIGN KEY (owner_id) REFERENCES users (id)
  );


    CREATE TABLE contact (
    id SERIAL PRIMARY KEY,
    user_id int,
    mess VARCHAR(500),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE ask (
    id SERIAL PRIMARY KEY,
    user_id int,
    que VARCHAR(1000),
    subject VARCHAR(250),
    type_of_work VARCHAR(250),
    is_answered numeric,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id)
  );
  
  CREATE TABLE answer (
    id SERIAL PRIMARY KEY,
    user_id int,
    que_id int,
    answer VARCHAR(500),
    is_true VARCHAR(250),
    CONSTRAINT fk_que_id FOREIGN KEY (que_id) REFERENCES ask (id),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id)
  );


    CREATE TABLE reply (
    id SERIAL PRIMARY KEY,
    user_id int,
    ans_id int,
    mess VARCHAR(500),
    CONSTRAINT fk_ans_id FOREIGN KEY (ans_id) REFERENCES answer (id),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id)
  );
