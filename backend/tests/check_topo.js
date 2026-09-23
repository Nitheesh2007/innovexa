const mongoose = require('mongoose');
const connectDB = require('../config/db');

(async () => {
  await connectDB();
  const topo = mongoose.connection.client.topology?.description;
  console.log('Topology type:', topo?.type);
  const isReplicaSet = topo?.type === 'ReplicaSetWithPrimary' || topo?.type === 'ReplicaSetNoPrimary' || topo?.type === 'Sharded';
  console.log('Is replica set?', isReplicaSet);
  process.exit(0);
})();
