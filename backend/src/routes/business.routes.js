const express = require('express')
const router = express.Router()
const businessController = require('../controllers/business.controller')
const { jwtAuth } = require('../middleware/jwtAuth')
const { validate } = require('../middleware/zodValidator')
const { businessSchema, uuidParamSchema, slugParamSchema } = require('../utils/validators')

router.get('/my', jwtAuth, businessController.getMyBusiness)
router.get('/slug/:slug', validate(slugParamSchema, 'params'), businessController.getBusinessBySlug)
router.get('/:id', validate(uuidParamSchema, 'params'), businessController.getBusiness)
router.post('/', jwtAuth, validate(businessSchema), businessController.createBusiness)
router.put('/:id', jwtAuth, validate(uuidParamSchema, 'params'), businessController.updateBusiness)

module.exports = router
