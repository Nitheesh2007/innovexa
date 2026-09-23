const app = require('../backend/server');

module.exports = (req, res) => {
  // Normalize req.url so Express routes mounted on /api match seamlessly
  // whether Vercel passes /api/... or strips the prefix during rewrites
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
};
