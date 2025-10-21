// knexfile.js
require('dotenv').config({ path: './.env' });

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'seu_usuario_postgres',
      password: process.env.DB_PASSWORD || 'sua_senha_secreta',
      database: process.env.DB_NAME || 'consultor_ia_db',
    },
    migrations: {
      directory: './src/database/migrations',
    },
    seeds: {
      directory: './src/database/seeds'
    }
  },
};