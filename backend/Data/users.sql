-- Initialize db_games MySQL Database
START TRANSACTION;

DELETE FROM users;

INSERT INTO users (user_id, login, full_name) VALUES
  (1,'shelly','Sheldon'),
  (2,'lenny','Leonard'),
  (3,'raj','Rajesh'),
  (4,'howie','Howard');


COMMIT;
