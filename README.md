# 💸 Transactions App (Paytm-Like Wallet)

A robust, production-ready digital wallet and peer-to-peer (P2P) transaction platform built with Node.js. This application allows users to securely sign up, manage their wallet balances, and transfer funds to other users in real-time with strict ACID compliance to prevent double-spending.

## 🚀 Tech Stack
- **Backend:** Node.js, Express.js (or Next.js API Routes)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JSON Web Tokens (JWT) & bcrypt
- **Architecture:** Monorepo (Turborepo) / Standard MVC

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) (Running locally or via cloud like Aiven/Neon)
- Git

---

## 🔐 Environment Variables

Create a `.env` file in the root of your backend directory and add the following secrets. **Never commit this file to version control.**

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/transactions_db"

# Authentication
JWT_SECRET="your_super_secret_jwt_key_here"

# Server Configuration
PORT=3000
```

## 🛠️ Setup & Installation Guide

**1. Clone the repository**
git clone [https://github.com/meraj-its-official/Transactions-App.git](https://github.com/meraj-its-official/Transactions-App.git)
```
cd Transactions-App
```

**2. Install dependencies**
```
npm install
```
**3. Set up the Database (Migrations)**
See the Database Migration Steps section below for detailed instructions.
```
    npx prisma migrate dev --name init
    npx prisma generate
```
**4. Start the development server**
```
npm run dev
```
The server should now be running on http://localhost:3000.

## 🗄️ Database Migration Steps
We use Prisma to manage our database schema. Whenever you clone the project or update the schema.prisma file, follow these steps:

**1.Push schema to the database (Development):**
```
npx prisma migrate dev --name describe_your_changes
```
This creates a new migration file and applies it to your Postgres database.

**2.Generate the Prisma Client:**
```
npx prisma generate
```
This updates the auto-generated TypeScript types for your database queries.

**3.Reset the database (Optional / If things break):**
```
npx prisma migrate reset
```
Warning: This will wipe all local data and re-apply migrations.

## 📡 API Endpoints
Below is the list of primary REST API endpoints available in the application. All protected routes require a valid Bearer <Token> in the Authorization header.


**Authentication (/api/v1/auth)**
<ul>
<strong> **Method**           |           **Endpoint**                  |                **Description**                           |        **Protected** </strong> <br>
POST                 |           /signup                       |  Register a new user and create an empty wallet          |           No <br>
POST                 |           /signin                       |  Authenticate user and return JWT                        |           No
</ul>


**User & Wallet (/api/v1/user)**
**Method**           |           **Endpoint**                  |                **Description**                           |        **Protected**
GET                  |           /profile                      |       Get logged-in user's details                       |           Yes
GET                  |           /balance                      |      Retrieve current wallet balance                     |           Yes
GET                  |           /bulk                         |   Search users to send money to (with filtering)         |           Yes

**Transactions (/api/v1/account)**
**Method**           |           **Endpoint**                  |                **Description**                                       |        **Protected**
POST                 |           /transfer                     | Send money to another user (Requires { to: "userId", amount: 100 })  |           Yes
GET                  |           /history                      |          Retrieve current wallet balance                             |           Yes


## 🛡️ Security & Scalability Highlights

<ul>
<li>ACID Transactions: Money transfers are wrapped in database transactions.If the sender's debit succeeds but the receiver's credit fails, the entire operation rolls back.</li>
<li>Password Hashing: Plain-text passwords are never stored. Always hashed via bcrypt.</li>
<li>Stateless Auth: Horizontally scalable authentication using JWT.</li>
</ul>

Developed by MD MERAJ ALAM