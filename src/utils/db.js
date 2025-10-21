const knexfile = require('../../knexfile');
const knex = require('knex');

const db = knex(knexfile.development);

module.exports = db;