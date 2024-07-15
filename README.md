# Wallet API

## Introduction

This is an API that maintains user wallets and allows inter wallet transactions between users. The transactions are made possible with acid compliant db transactions. To try the API yourself [click here](#getting-started).

## Getting started

1. Clone the repo in desired directory:

   ```bash
   git clone https://github.com/Lakshya-Kapoor/E-wallet-APIs.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. PostgreSQL setup:

   - Install postgreSQL and create a database to store the tables:

   - Now set following environment variables for db connection:

     - `DB_USER`
     - `DB_HOST`
     - `DB_NAME`
     - `DB_PASSWORD`
     - `DB_PORT`

   - Run all the commands inside the /utils/tableSchema.sql file to create all the tables

4. Setup following environment variables for jwt auth

   - `ACCESS_TOKEN_SECRET`
   - `REFRESH_TOKEN_SECRET`

5. Run the server:

   - Trying out api

     ```bash
     npm run start
     ```

   - For devlopment

     ```bash
     npm run dev
     ```

## API reference

### Auth

- `POST /auth/signup`: To store user info in database
- `POST /auth/login`: To generate JWT token

### User

- `GET /user/balance`: Get user wallet balance
- `POST /user/pay`: Pay another user
- `GET /user/transactions`: Get user transactions

### Admin

- `GET /admin/users`: Get data of all users
- `GET /admin/users/:phone_no`: Get data of particular user
- `GET /admin/transactions/:phone_no`: Get all transactions of a user
- `GET /admin/verify_transactions/:phone_no`: Verify correctness of all the transactions
