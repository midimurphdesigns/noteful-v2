'use strict';

const express = require('express');
const knex = require('../knex');
const router = express.Router();

//Get all folders endpoint
router.get('/', (req, res, next) => {
  knex.select('id', 'name')
    .from('folders')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

//Get folder by id
router.get('/:id', (req, res, next) => {
  const folderId = req.params.id;

  knex.first('id', 'name')
    .from('folders')
    .where({ id: folderId })
    .then(results => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => next(err));

});

//Update folder
router.put('/:id', (req, res, next) => {
  const folderId = req.params.id;
  const updateObj = {};
  const updateableFields = ['id', 'name'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  if (!updateObj.id) {
    const err = new Error('Missing `id` in request body');
    err.status = 400;
    return next(err);
  }

  knex.select('id', 'name')
    .from('folders')
    .where({ id: folderId })
    .update(updateObj)
    .returning(['id', 'name'])
    .then(([results]) => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => next(err));

});

//Create folder
router.post('/', (req, res, next) => {
  const { id, name } = req.body;
  const newItem = { id, name };

  knex
    .insert(newItem)
    .into('folders')
    .returning(['id', 'name'])
    .then(results => {
      if (results) {
        res.location(`http://${req.headers.host}/folders/${results.id}`).status(201).json(results);
      }
      res.json();
    })
    .catch(err => next(err));

});

//Delete folder
router.delete('/:id', (req, res, next) => {
  const folderId = req.params.id;

  knex.select('id', 'name')
    .from('folders')
    .where({ id: folderId })
    .del()
    .then(count => {
      if (count) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch(err => next(err));
});


module.exports = router;