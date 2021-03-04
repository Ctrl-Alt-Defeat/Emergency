DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255),
    role numeric,
    location VARCHAR(255),
    img VARCHAR(255),
    type_of_work VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255),
    phone_num VARCHAR(255),
    status VARCHAR(255),
    exp VARCHAR(255),
    userame VARCHAR(255)
  );

DROP TABLE IF EXISTS schedule;

  CREATE TABLE schedule (
    id SERIAL PRIMARY KEY,
    day VARCHAR(255),
    user_id int,
    hours_avl VARCHAR(255),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id)
  );

DROP TABLE IF EXISTS feedback;

    CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    day VARCHAR(255),
    user_id int,
    text numeric,
    hours_avl VARCHAR(255),
    owner_id  int,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id)
  );

DROP TABLE IF EXISTS contact;

    CREATE TABLE contact (
    id SERIAL PRIMARY KEY,
    user_id int,
    text numeric,
    mess VARCHAR(500),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id)
  );

DROP TABLE IF EXISTS ask;

    CREATE TABLE ask (
    id SERIAL PRIMARY KEY,
    user_id int,
    que numeric,
    is_answered VARCHAR(250),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id)
  );
  
  DROP TABLE IF EXISTS answer;

    CREATE TABLE answer (
    id SERIAL PRIMARY KEY,
    user_id int,
    que_id int,
    answer VARCHAR(500),
    is_true VARCHAR(250),
    CONSTRAINT fk_que_id FOREIGN KEY (que_id) REFERENCES ask (id),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id)
  );

  DROP TABLE IF EXISTS reply;

    CREATE TABLE reply (
    id SERIAL PRIMARY KEY,
    user_id int,
    ans_id int,
    mess VARCHAR(500),
    CONSTRAINT fk_ans_id FOREIGN KEY (ans_id) REFERENCES answer (id),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id)
  );




-- INSERT INTO  ###(title,,description) VALUES ('1','2');
