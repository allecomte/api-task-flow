const mongoose = require("mongoose");

async function getPaginationInfo(model, pagination) {
  const total = await model.countDocuments();
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
