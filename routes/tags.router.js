'use strict';

const express = require('express');
const knex = require('../knex');
const router = express.Router();

/* ========== Get all tags ========== */
router.get('/', (req, res, next) => {
  knex.select('id', 'name')
    .from('tags')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});


/* ========== Get tag by ID ========== */
router.get('/:id', (req, res, next) => {
  const tagId = req.params.id;

  knex.first('id', 'name')
    .from('tags')
    .where({ id: tagId})
    .then(results => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});


/* ========== Put/update tag ========== */
router.put('/:id', (req, res, next) => {
  const tagId = req.params.id;
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
    .from ('tags')
    .where({ id: tagId })
    .update(updateObj)
    .returning([ 'id', 'name' ])
    .then( ([results]) => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});


/* ========== Post/create tag ========== */
router.post('/', (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    const err = new Error('Missing `name` in request boddy');
    err.status = 400;
    return next(err);
  }

  const newItem = { name };

  knex.insert(newItem)
    .into('tags')
    .returning(['id', 'name'])
    .then (results => {
      // Uses Array index solution to get first item in results array
      const result = results;
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => next(err));
});


/* ========== Delete tag ========== */
router.delete('/:id', (req, res, next) => {
  const tagId = req.params.id;

  knex.select('id', 'name')
    .from('tags')
    .where({ id: tagId })
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
