const mongoose = require('mongoose');

/**
 * Check if the data exists in the database from its ID
 * @param {mongoose.Model} model - Mongoose's model (ex: User, Project)
 * @param {string} id - ID to check
 * @returns {Promise<boolean>} - true if data exists otherwise false
 */
async function existsById(model, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }

  const count = await model.countDocuments({ _id: id });
  return count > 0;
}

/**
 * Check if the data exists in the database from an array of IDs
 * @param {mongoose.Model} model - Mongoose's model
 * @param {string[]} ids - array of IDs to check
 * @returns {Promise<boolean>} - true if all data exists otherwise false
 */
async function allExistByIds(model, ids) {
  if (!Array.isArray(ids) || ids.length === 0) return true; // rien à vérifier

  const count = await model.countDocuments({ _id: { $in: ids } });
  return count === ids.length;
}

module.exports = { existsById, allExistByIds };