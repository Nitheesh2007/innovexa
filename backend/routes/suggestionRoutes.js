const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createSuggestion,
  getSuggestions,
  updateSuggestionStatus,
  upvoteSuggestion
} = require('../controllers/suggestionController');

router.use(protect);

router.route('/')
  .post(createSuggestion)
  .get(getSuggestions);

router.route('/:id/status')
  .put(updateSuggestionStatus);

router.route('/:id/upvote')
  .put(upvoteSuggestion);

module.exports = router;
