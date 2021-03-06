'use strict';

const express = require('express')
const router = express.Router()

const rolesController = require('./roles.journal.controller')

router.post('/', rolesController.createRole);
router.put('/:id', rolesController.modifyRight);
router.delete('/:id', rolesController.deleteRole);
router.get('/:id', rolesController.getRoleById);
router.get('/user/all/:id?', rolesController.getUserRoles);
router.get('/all/:id_journal/:right(editor|associate_editor|user)?',
  rolesController.getJournalUsers);

module.exports = router;
