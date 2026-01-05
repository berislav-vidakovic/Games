## Notes on Java, Spring, JPA/Hibernate

- Returns 0 or 1 record, for more than 1 throws Exception
  ```java
  Optional<SudokuBoard> findByBoard(String board); 
  ```

- To return 0 or many records
  ```java
  List<SudokuBoard> findAllByName(String name); 
  ```

- Immutable list - no add, remove
  ```java
  List<String> techstack = List.of(
      baseUrl + "/images/java.png",
      baseUrl + "/images/spring.png",
      baseUrl + "/images/mysql.png"
  );
  ```

- Mutable list
  ```java
  this.techstack = new ArrayList<>(techstack);
  ```

- Use environment variables optionally if exist, otherwise fall back to the default value
  ```yaml
  datasource:
    url: ${DB_URL:jdbc:mysql://barryonweb.com:3306/db_games}
    username: ${DB_USER:barry75}
    password: ${DB_PASSWORD:StrongPwd!}
  ```

- Build Java App
  ```bash
  mvn clean package -DskipTest
  ```

- Run Java App
  ```bash
  mvn spring-boot:run
  ```