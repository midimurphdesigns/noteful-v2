'use strict';

const express = require('express');
const knex = require('../knex');
const router = express.Router();
const hydrateNotes = require('../utils/hydrateNotes');

/* ========== GET/READ ALL NOTES ========== */
router.get('/', (req, res, next) => {
  const { searchTerm, folderId, tagId } = req.query;

  knex.select('notes.id', 'title', 'content', 'folders.id as folder_Id', 'folders.name as folderName', 'tags.name as tags_name')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags', 'notes_tags.tag_id', 'tags.id')
    .modify(function (queryBuilder) {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
    })
    .modify(function (queryBuilder) {
      if (folderId) {
        queryBuilder.where('folder_id', folderId);
      }
    })
    .modify(function (queryBuilder) {
      if (tagId) {
        queryBuilder.where('tag_id', tagId);
      }
    })
    .orderBy('notes.id')
    .then(result => {
      if (result) {
        const hydrated = hydrateNotes(result);
        res.json(hydrated);
      } else {
        next();
      }
    })
    .catch(err => next(err));

});

/* ========== GET/READ SINGLE NOTES ========== */
router.get('/:id', (req, res, next) => {
  const noteId = req.params.id;
  const folderId = req.params.folderId;
  //maybe it's tagsId??
  const tagId = req.params.tagId;

  knex.select('notes.id as id', 'title', 'content', 'folders.id as folder_Id', 'folders.name as folderName', 'tags.name as tags_name')
    .from('notes')
    .where({ 'notes.id': noteId })
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags', 'notes_tags.tag_id', 'tags.id')
    .orderBy('notes.id')
    .then(result => {
      if (result) {
        const hydrated = hydrateNotes(result);
        res.json(hydrated[0]);
      } else {
        next();
      }
    })
    .catch(err => next(err));

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const noteId = req.params.id;
  const updateObj = {};
  const updateableFields = ['title', 'content', 'folder_id'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex.select('notes.id as note_Id')
    .from('notes')
    .where({ 'notes.id': noteId })
    .update(updateObj)
    .then(() => {
      // Using the new id, select the new note and the folder
      return knex.select('notes.id', 'title', 'content',
        'folders.id as folder_id', 'folders.name as folder_name',
        'tags.id as tagId', 'tags.name as tagName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
        .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
        .where('notes.id', noteId);
    })
    .then(result => {
      if (result) {
        const hydrated = hydrateNotes(result)[0];
        res.location(`${req.originalUrl}/${result.id}`).status(201).json(hydrated);
      } else {
        next();
      }
    })
    .catch(err => next(err));

});

/* ========== POST/CREATE ITEM ========== */
router.post('/', (req, res, next) => {
  const { title, content, folder_id, tags } = req.body; // Add `folder_id`

  const newItem = {
    title: title,
    content: content,
    folder_id: folder_id  // Add `folder_id`
  };

  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  let noteId;

  // Insert new note, instead of returning all the fields, just return the new `id`
  knex.insert(newItem)
    .into('notes')
    .returning('id')
    .then(([id]) => {
      noteId = id;
      const tagsInsert = tags.map(tagId => ({ note_id: noteId, tag_id: tagId }));
      return knex.insert(tagsInsert).into('notes_tags');
    })
    .then(() => {
      // Using the new id, select the new note and the folder
      return knex.select('notes.id', 'title', 'content',
        'folder_id', 'folders.name as folder_name',
        'tags.id as tagId', 'tags.name as tagName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
        .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
        .where('notes.id', noteId);
    })
    .then(result => {
      if (result) {
        const hydrated = hydrateNotes(result)[0];
        res.location(`${req.originalUrl}/${hydrated.id}`).status(201).json(hydrated);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .from('notes')
    .where({ id: id })
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