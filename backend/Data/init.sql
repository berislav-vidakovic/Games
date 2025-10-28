-- Initialize db_games MySQL Database
START TRANSACTION;

-- 1) Tables
DROP TABLE IF EXISTS sudokuboards;
CREATE TABLE sudokuboards (
  board_id INT AUTO_INCREMENT PRIMARY KEY,
  board VARCHAR(81) NOT NULL,
  solution VARCHAR(81) NOT NULL,
  name VARCHAR(20) NOT NULL,
  level TINYINT NOT NULL,
  UNIQUE (board)
);

COMMIT;
