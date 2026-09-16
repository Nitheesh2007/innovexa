const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const crudFactory = require('../utils/crudFactory');

const createCrudRouter = (Model) => {
  const router = express.Router();
  
  router.route('/')
    .get(protect, crudFactory.getAll(Model))
    .post(protect, authorize('admin', 'staff'), crudFactory.createOne(Model));

  router.route('/:id')
    .get(protect, crudFactory.getOne(Model))
    .put(protect, authorize('admin', 'staff'), crudFactory.updateOne(Model))
    .delete(protect, authorize('admin'), crudFactory.deleteOne(Model));
    
  return router;
};

module.exports = createCrudRouter;
