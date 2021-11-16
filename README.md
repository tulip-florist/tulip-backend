# Tulip Backend

> Backend for [Tulip](https://github.com/tulip-florist/tulip) open source document reader

## Development setup

Local development setup for the Tulip (backend) application.

Clone the repository

Install the dependencies

    npm install

Create a `.env` file with the following variables to connect to mongoDb Atlas and setup JWT auth.

```
PORT=8080
DB_USERNAME=<mongoDb_user_name>
DB_PASSWORD=<mongoDb_user_password>
DB_NAME=<mongoDb_db_name>
JWT_SECRET=<your_custom_jwt_secret>

```

Run the application in dev mode

    npm run serve
