// mongoDBTester.js — quick script to exercise Mongoose models and watchlists service
// Usage: node mongoDBTester.js
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const User = require('./models/User');
const Market = require('./models/Market');
const Watchlists = require('./models/Watchlists');
const Note = require('./models/Note');
const Category = require('./models/Category');
const watchlistsService = require('./services/watchlistsService');

const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/polyWatchDB';

async function runDemo() {
  console.log('Connecting to', mongoURI);
  await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

  // Create or get a demo user
  const user = await User.findOneAndUpdate(
    { email: 'demo@example.com' },
    { $setOnInsert: { username: 'demouser', passwordHash: 'demo-hash' } },
    { upsert: true, new: true }
  );
  console.log('User:', { id: user._id.toString(), email: user.email, username: user.username });

  // Create or get demo category
  const category = await Category.findOneAndUpdate(
    { name: 'Demo' },
    { $setOnInsert: { name: 'Demo' } },
    { upsert: true, new: true }
  );
  console.log('Category:', { id: category._id.toString(), name: category.name });

  // Create or get demo market
  const market = await Market.findOneAndUpdate(
    { polymarketId: 'demo-1' },
    { $setOnInsert: { polymarketId: 'demo-1', title: 'Demo Market', categoryId: category._id } },
    { upsert: true, new: true }
  );
  console.log('Market:', { id: market._id.toString(), polymarketId: market.polymarketId, title: market.title });

  // Add to watchlists using service
  try {
    const watchlists = await watchlistsService.addToWatchlists(user._id.toString(), market._id.toString());
    console.log('Watchlists after add:', watchlists.map(m => ({ id: m._id.toString(), title: m.title })));
  } catch (err) {
    console.error('Error adding to watchlists:', err.message);
  }

  // Get watchlists using service
  try {
    const watchlists = await watchlistsService.getUserWatchlists(user._id.toString());
    console.log('Retrieved watchlists:', watchlists.map(m => ({ id: m._id.toString(), title: m.title })));
  } catch (err) {
    console.error('Error getting watchlists:', err.message);
  }

  // Remove from watchlists using service
  try {
    await watchlistsService.removeFromWatchlists(user._id.toString(), market._id.toString());
    console.log('Removed from watchlists successfully');
  } catch (err) {
    console.error('Error removing from watchlists:', err.message);
  }

  // Verify removal
  try {
    const watchlists = await watchlistsService.getUserWatchlists(user._id.toString());
    console.log('Watchlists after remove:', watchlists.map(m => ({ id: m._id.toString(), title: m.title })));
  } catch (err) {
    console.error('Error getting watchlists after remove:', err.message);
  }

  // Create a note (always create a new one for demo)
  const note = await Note.create({ userId: user._id, marketId: market._id, content: 'Demo note created by demo.js' });
  console.log('Note created:', { id: note._id.toString(), content: note.content });

  await mongoose.disconnect();
  console.log('Demo finished — disconnected.');
}

runDemo().catch(err => {
  console.error('Demo error:', err);
  process.exit(1);
});
