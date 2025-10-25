## Setup

### Current configuration

- Frontend panel Port: 5174
- Frontend sudoku Port: 5175
- Backend Port: 5003 


### Common features

1. Place clientsettings.json in root frontend/public
2. Update each game project's **vite.config.ts**:
    - Enable access to common and root public
    - Set port explicitly 

    ```ts
    import path from 'path';
    export default defineConfig({
      publicDir: path.resolve(__dirname, '../public'),
      resolve: {
        alias: {
          '@common': path.resolve(__dirname, '../common'),     
        },
      },
      server: { port: 5174 }
    });
    ```
3. Add common path to **tsconfig.json**:

    ```json
    "paths": {
      "@common/*": ["../common/*"]
    }
    ```
4. Use alias when importing common component

    ```ts
    import { sendGETRequest } from '@common/restAPI';
    import { loadCommonConfig } from '@common/config';
    ```

5. Adding new frontend project

  - Run from terminal:
    ```powershell
    npm create vite@latest panel -- --template react-ts
    ```
  - Add workspace to frontend/package.json:
    ```json
    {
      "private": true,
      "workspaces": [
        "common",
        "sudoku",
        "panel"
      ],
      "dependencies": {
        "http-status-codes": "^2.3.0"
      }
    }
    ```
  - Update vite.config.ts
  - Update .gitignore
  - Add CORS policy entry to backend

  

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


