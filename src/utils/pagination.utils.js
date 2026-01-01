const mongoose = require("mongoose");

async function getPaginationInfo(model, pagination, filters = {}) {
  const total = await model.countDocuments(filters);
  const totalPages = Math.ceil(total / pagination.limit);
  return {
    total,
    totalPages,
    page: pagination.page,
    limit: pagination.limit,
    hasNextPage: pagination.page < totalPages,
    hasPrevPage: pagination.page > 1,
  };
}

module.exports = { getPaginationInfo };
