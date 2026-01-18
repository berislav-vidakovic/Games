# 🎮 Games – Full Stack Game Platform




**Games** is a full‑stack web application showcasing classic games like **Sudoku** and **Connect4** with a modern architecture:
React frontend, **Java Spring Boot backend**, **MySQL database**, and both **REST & GraphQL APIs**, including **WebSocket** support for real‑time features.

<div style="margin-bottom: 12px;">
<img src = "docs/images/ts.png" style="margin-right: 15px;" /> 
<img src = "docs/images/react.png" style="margin-right: 15px;" /> 
<img src = "docs/images/rest.png" style="margin-right: 15px;" /> 
<img src = "docs/images/GraphQL.png"  style="margin-right: 15px;" /> 
<img src = "docs/images/java.png" style="margin-right: 15px;" /> 
<img src = "docs/images/spring1.png" style="margin-right: 15px;" /> 
<img src = "docs/images/mysql.png" style="margin-right: 15px;" /> 
<img src = "docs/images/CI-CD.png" style="margin-right: 15px;" /> 
<img src = "docs/images/docker.png" style="margin-right: 15px;" /> 
</div>


This project is designed as a **portfolio project** demonstrating real‑world full‑stack development and deployment practices.

---

## 📑 Table of Contents

- [🎯 Project Overview](#project-overview)
- [🚀 Features / Live Demo](#features--live-demo)
- [🧰 Tech Stack](#tech-stack)
- [📁 Repository Structure](#repository-structure)
- [🛠️ Local Development](#local-development)
- [🐳 Docker Test Environment](#docker-test-environment)
- [⚙️ Environment Variables](#environment-variables)
- [🌐 Deployment](#deployment)
- [🧠 Skills demonstrated](#skills-demonstrated)
- [📫 Contact](#contact)
- [📄 License](#license)

---

## Project Overview

The repository contains a complete, production‑style application stack:

- Multiple browser‑playable games
- Modular frontend applications
- Backend APIs with REST and GraphQL
- Persistent storage using MySQL
- Docker‑based test environments
- CI/CD automation and Nginx reverse proxy configuration

---

## Features / Live Demo

- 🎲 Classic games: **Sudoku**, **Connect4**
- ⚙️ Spring Boot backend with layered architecture
- 🔗 **REST + GraphQL APIs**
- 🧠 Game logic handled server‑side
- 📡 **WebSocket** support for real‑time updates
- 🗄️ **MySQL** persistence
- 🐳 Docker & Docker Compose support
- 🔄 GitHub Actions CI/CD pipelines
- 🌍 Nginx configuration for production & test environments

> 🔗 Demo: https://games-test.barryonweb.com/ 

- Test instructions:
  - Either register new users or use existing ones all having password abc  
  - Select language on Game panel (English is default)
  - Sudoku
    - After login select Sudoku image and click Run top open Sudoku in new Browser tab
    - Select particular game by moving with Next button
    - Select Start to start game
  - Connect4
    - Open 2 browsers and login with 2 different users 
    - User1 needs to invite User2, and invitation needs to be accepted to play game
    - Both users need to select Connect4 image and click Run
    - Before game start users can choose their color
    - After one user clicks Start game is running


📸 Screenshot of Games in action:

![Games Screenshot](/docs/images/games.png "Games App in action")



---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite

### Backend
- Java 21
- Spring Boot
- Spring Web
- Spring GraphQL
- WebSocket support

### APIs
- REST
- GraphQL

### Database
- MySQL

### Infrastructure & DevOps
- Docker & Docker Compose
- Nginx (reverse proxy)
- GitHub Actions
- systemd service management

---

## Repository Structure

```
/
├── backend/                          # Spring Boot backend
├── frontend/                         # React frontend apps
├── nginx/                            # Nginx configs for Dev, Test and Prod 
├── .github/workflows/                # CI/CD pipelines GitHub
├── .gitlab-ci.yaml                   # CI/CD pipeline GitLab
├── games-dev.barryonweb.com          # Nginx config (dev)
├── games-test.barryonweb.com         # Nginx config (test)
├── docker-compose.test.yml           # Docker test setup
└── runTestStack.sh                   # Container rebuild script
```

---

## Local Development

### Backend

```bash
cd backend
mvn clean package -DskipTests
java -jar target/*.jar
```

The backend starts on port `8082` by configuration in application.yaml

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Each game is served as a separate frontend module during development.

---

## Docker Test Environment

### Build Image

```bash
docker build -t games-backend-test .
docker build -t games-frontend-test .
```

### Run Container

```bash
docker compose -f docker-compose.test.yml up -d --remove-orphans
```

### Stop & Cleanup

```bash
docker compose -f docker-compose.test.yml down 
```

There are separate documents with detailed steps on 
- Docker containerization of <a href="docs/ContainerTest.md">Test environment with host DB</a> 
- Full stack app Docker containerization of <a href="docs/ContainerProd.md">Production environment including DB containerization</a>

---

## Environment variables

Example backend configuration:

```env
SPRING_DATASOURCE_URL=jdbc:mysql://<host>:3306/games_test
SPRING_DATASOURCE_USERNAME=<user>
SPRING_DATASOURCE_PASSWORD=<password>
SPRING_PROFILES_ACTIVE=prod
JAVA_OPTS="-Xms256m -Xmx512m"
```

---

## Deployment

The project includes:
- Nginx reverse proxy configurations
- SSL‑ready setup
- Dockerized test environments
- GitHub Actions automated deployments

---

## Skills demonstrated

- Full‑stack Java development
- API design with REST and GraphQL
- Real‑time WebSocket communication
- Database modeling with MySQL
- Containerization and DevOps workflows
- Production‑style deployment setup

---

## Contact

**Berislav Vidakovic**  
- GitHub: https://github.com/berislav-vidakovic 
- Blog: https://barrytheanalyst.eu 
- LinkedIn: https://www.linkedin.com/in/berislav-vidakovic/
- E-mail: berislav.vidakovic@gmail.com

---

## License

MIT License
