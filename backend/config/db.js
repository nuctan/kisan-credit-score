const mongoose = require('mongoose');
const dns = require('dns');
const { Resolver } = dns.promises;

const connectDB = async () => {
  // First try Atlas connection
  try {
    const resolver = new Resolver();
    resolver.setServers(['8.8.8.8', '8.8.4.4']);

    const hosts = [
      'ac-k7hbhwb-shard-00-00.4mhnecz.mongodb.net',
      'ac-k7hbhwb-shard-00-01.4mhnecz.mongodb.net',
      'ac-k7hbhwb-shard-00-02.4mhnecz.mongodb.net',
    ];

    const lookupMap = {};
    for (const host of hosts) {
      try {
        const addrs = await resolver.resolve4(host);
        if (addrs.length > 0) lookupMap[host] = addrs[0];
      } catch (e) { /* skip */ }
    }

    const originalLookup = dns.lookup;
    dns.lookup = (hostname, options, callback) => {
      if (typeof options === 'function') { callback = options; options = {}; }
      if (lookupMap[hostname]) return callback(null, lookupMap[hostname], 4);
      return originalLookup(hostname, options, callback);
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    return true;
  } catch (atlasError) {
    console.warn(`Atlas connection failed: ${atlasError.message}`);
    console.log('Falling back to in-memory MongoDB...');
  }

  // Fallback: use in-memory MongoDB
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const conn = await mongoose.connect(uri);
    console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
    console.log('Note: Data will be lost when the server restarts. Atlas will be used in production.');
    return true;
  } catch (memError) {
    console.error(`In-Memory MongoDB Error: ${memError.message}`);
    console.warn('Server will continue running without database.');
    return false;
  }
};

module.exports = connectDB;
