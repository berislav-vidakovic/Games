-- Initialize db_games MySQL Database
START TRANSACTION;

INSERT IGNORE INTO sudokuboards (board, solution,name,level) 
VALUES
      ( "080003000009150273000904100007649800000070300000030054703206400020000900000010530",
        "185723649649158273372964185537649821814572396296831754753296418421385967968417532",
        "Munich", 2 );

INSERT INTO users (user_id, login, full_name) VALUES
  (1,'shelly','Sheldon'),
  (2,'lenny','Leonard'),
  (3,'raj','Rajesh'),
  (4,'howie','Howard');


COMMIT;
