## Setup

### Create Model on backend, connect to DB and expose GET endpoint

1. Create Model that matches table and columns, [Key] on PK column
2. Create DbContext-based class
    - Add DbSet member
    - Connect to DB table in OnModelCreating
3. Add ConnectionString to appsettings.json
4. Create Controller with 1 endpoint
5. Add Services (Controllers and DbContext) to container and map Controllers

Sudoku:
  - Controller class: SudokuController
  - GET endpoint "board"
  - URL for browser check: http://localhost:5003/api/sudoku/board

### Connect Frontend to backend, initially send GET request


