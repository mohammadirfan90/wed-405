// One-off: dedupe User collection on email AND rebuild partial unique indexes.
//   1. Find every email/phone that appears on more than one row.
//   2. Keep the oldest row; null out the value on every duplicate.
//   3. Drop the legacy unique indexes (if any) so the partial indexes defined
//      in the model can take effect on the next boot.
require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[fix-email] Connected.');

    // 1. Drop legacy indexes that conflict with our new partial indexes.
    const coll = mongoose.connection.collection('users');
    const idxs = await coll.indexes();
    for (const idx of idxs) {
      if ((idx.key?.email === 1 || idx.key?.phone === 1) && idx.unique && !idx.partialFilterExpression) {
        try {
          await coll.dropIndex(idx.name);
          console.log(`[fix-email] Dropped legacy index: ${idx.name}`);
        } catch (e) {
          console.log(`[fix-email] Could not drop ${idx.name}: ${e.message}`);
        }
      }
    }

    // 2. Email duplicates.
    const dupEmails = await coll.aggregate([
      { $match: { email: { $type: 'string' } } },
      { $group: { _id: '$email', ids: { $push: '$_id' }, n: { $sum: 1 } } },
      { $match: { n: { $gt: 1 } } },
    ]).toArray();
    for (const d of dupEmails) {
      const users = await coll.find({ _id: { $in: d.ids } }).sort({ createdAt: 1 }).toArray();
      const keeper = users[0];
      for (const u of users.slice(1)) {
        await coll.updateOne({ _id: u._id }, { $unset: { email: '' } });
        console.log(`[fix-email] Email ${d._id}: kept ${keeper._id}, nulled ${u._id}`);
      }
    }

    // 3. Phone duplicates.
    const dupPhones = await coll.aggregate([
      { $match: { phone: { $type: 'string' } } },
      { $group: { _id: '$phone', ids: { $push: '$_id' }, n: { $sum: 1 } } },
      { $match: { n: { $gt: 1 } } },
    ]).toArray();
    for (const d of dupPhones) {
      const users = await coll.find({ _id: { $in: d.ids } }).sort({ createdAt: 1 }).toArray();
      const keeper = users[0];
      for (const u of users.slice(1)) {
        await coll.updateOne({ _id: u._id }, { $unset: { phone: '' } });
        console.log(`[fix-phone] Phone ${d._id}: kept ${keeper._id}, nulled ${u._id}`);
      }
    }

    console.log('[fix-email] Done.');
    process.exit(0);
  } catch (err) {
    console.error('[fix-email] Failed:', err);
    process.exit(1);
  }
})();
