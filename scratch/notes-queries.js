'use strict';

const knex = require('../knex');

knex.select('id', 'title', 'content')
  .from('notes')
  .where('title', 'like', '%cats%')
  .limit()
  .then(res => {
    console.log(res);
  });
