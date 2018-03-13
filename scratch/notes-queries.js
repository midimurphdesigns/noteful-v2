'use strict';

const express = require('express');
const knex = require('../knex');



//get all notes

// knex.select('id', 'title', 'content')
//   .from('notes')
//   .where('title', 'like', '%cats%')
//   .limit()
//   .then(res => {
//     console.log(res);
//   })
//  .catch(err => next(err));





// get note with id

// knex.select('id', 'title', 'content')
//   .from('notes')
//   .where({ id: 1001 })
//   .then(item => {
//     console.log(item);
//     if (item) {
//       // res.json(item);
//     } else {
//       next();
//     }
//   })
//   .then(res => {
//     console.log(res);
//   })
//   .catch(err => next(err));




//put or update

// knex
//   .from('notes')
//   .where({ id: 1001 })
//   .update({ id: 1001, title: 'testing', content: 'testingtesting' })
//   .returning('id', 'title', 'content')
//   .then(item => {
//     console.log(item);
//     // if (item) {
//     //   // res.json(item);
//     // } else {
//     //   next();
//     // }
//   })
//   .then(res => {
//     console.log(res);
//   });
//   // .catch(err => next(err));




//post

// knex
//   .insert({ title: 'title', content: 'content' })
//   .into('notes')
//   .returning(['id', 'title', 'content'])
//   .then(res => {
//     console.log(JSON.stringify(res, null, 4));
//   });





//delete

// knex
//   .from('notes')
//   .where({ id: 1001 })
//   .del()
//   .returning('id', 'title', 'content')
//   .then(count => {
//     console.log(count)
//     // if (count) {
//     //   res.status(204).end();
//     // } else {
//     //   next();
//     // }
//   });








