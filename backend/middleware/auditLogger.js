const ActivityLog = require('../models/ActivityLog');

const auditLogger = (req, res, next) => {
  // We only want to log mutating requests automatically
  const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  
  if (!mutatingMethods.includes(req.method)) {
    return next();
  }

  // Hook into the response finish event to ensure we only log if the action succeeded or to capture the final status
  res.on('finish', async () => {
    try {
      // Don't log if it failed validation before doing anything significant, unless you want failed attempts logged
      // if (res.statusCode >= 400) return; 

      // Extract entity from URL (e.g., /api/products -> Product)
      const pathParts = req.originalUrl.split('?')[0].split('/');
      // Path is usually /api/collectionName/...
      const apiIndex = pathParts.indexOf('api');
      let entity = 'System';
      if (apiIndex !== -1 && pathParts.length > apiIndex + 1) {
        let rawEntity = pathParts[apiIndex + 1];
        // Capitalize and remove 's' if exists to make it singular (naive but works for most standard REST)
        entity = rawEntity.charAt(0).toUpperCase() + rawEntity.slice(1);
        if (entity.endsWith('s')) {
          entity = entity.slice(0, -1);
        }
        if (entity === 'Inventorie') entity = 'Inventory';
        if (entity === 'Categorie') entity = 'Category';
      }

      // Determine action type
      let action = 'OTHER';
      if (req.method === 'POST') {
        action = req.originalUrl.includes('/login') ? 'LOGIN' : 'CREATE';
      } else if (req.method === 'PUT' || req.method === 'PATCH') {
        action = 'UPDATE';
      } else if (req.method === 'DELETE') {
        action = 'DELETE';
      }

      // Generate details
      let details = `${action} action performed on ${entity}`;
      if (action === 'CREATE' && req.body && Object.keys(req.body).length > 0) {
        const nameField = req.body.name || req.body.productName || req.body.title;
        if (nameField) details = `Created ${entity.toLowerCase()} "${nameField}"`;
      } else if (action === 'UPDATE') {
        details = `Updated ${entity.toLowerCase()} record`;
      } else if (action === 'DELETE') {
        details = `Deleted ${entity.toLowerCase()} record`;
      } else if (action === 'LOGIN') {
        details = `User logged into the system`;
      }

      const logEntry = new ActivityLog({
        user: req.user ? req.user._id : null,
        action,
        entity,
        details,
        endpoint: req.originalUrl,
        method: req.method,
        ipAddress: req.ip || req.connection.remoteAddress,
        status: res.statusCode
      });

      await logEntry.save();
    } catch (err) {
      console.error('Audit Log Error:', err);
    }
  });

  next();
};

module.exports = auditLogger;
