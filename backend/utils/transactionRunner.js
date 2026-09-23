const mongoose = require('mongoose');

/**
 * Executes a callback within a MongoDB replica-set transaction if available,
 * or directly with graceful fallback if running on a standalone/single-instance MongoDB.
 */
async function withTransaction(callback) {
  const topo = mongoose.connection.client?.topology?.description;
  const isReplicaSet = topo?.type === 'ReplicaSetWithPrimary' || topo?.type === 'ReplicaSetNoPrimary' || topo?.type === 'Sharded';

  if (!isReplicaSet) {
    // Single standalone MongoDB instance (does not support multi-document transaction numbers)
    return await callback(null);
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    if (session) {
      try { await session.abortTransaction(); } catch (_) {}
    }
    throw error;
  } finally {
    if (session) {
      try { await session.endSession(); } catch (_) {}
    }
  }
}

module.exports = { withTransaction };
