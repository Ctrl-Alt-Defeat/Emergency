DROP TABLE IF EXISTS schedule;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS contact;
DROP TABLE IF EXISTS reply;
DROP TABLE IF EXISTS answer;
DROP TABLE IF EXISTS ask;
DROP TABLE IF EXISTS users;

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
    day VARCHAR(255),
    user_id int,
    text VARCHAR(255),
    owner_id  int,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id)
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
    que numeric,
    is_answered VARCHAR(250),
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

INSERT INTO  users(full_name,role,location,img,type_of_work,email,password,phone_num,status,exp,username) VALUES
 ('full_name','1','qweqqe','https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MXx8aHVtYW58ZW58MHx8MHw%3D&ixlib=rb-1.2.1&w=1000&q=80','Carpenter','areej.obaid@yahoo.com','23242rerwe','07966666666','Not working',2,'userame');


-- INSERT INTO  ###(title,,description) VALUES ('1','2');
