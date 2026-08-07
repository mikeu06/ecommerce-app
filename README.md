# Containerization & Deployment of a demo E-Commerce Application

See `TASK.md` for the full containerization exercise.

## Project Layout
```
ecommerce-app/
├── frontend/        React application 
├── backend/         Spring Boot REST API 
├── database/        init.sql seed script for PostgreSQL
└── TASK.md          The exercise instructions
```

## Running services locally (without Docker) to understand them first

**Backend** (requires JDK 17 + Maven, and a local PostgreSQL running):
```bash
cd backend
mvn spring-boot:run
```

**Frontend** (requires Node.js 18+):
```bash
cd frontend
npm install
npm start
```

**Database**: install PostgreSQL locally, create a database named `ecommercedb`, and run `database/init.sql` against it.

Once you understand how the pieces fit together, move on to `TASK.md`.
