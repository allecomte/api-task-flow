function getFiltersFromQuery(req, value) {
  const { page, limit, sort, ...rest } = value;
  const filters = buildFilters(rest);

  req.filters = filters;
  req.pagination = {
    page,
    limit,
    skip: (page - 1) * limit,
  };
  req.sort = sort;
}

function buildFilters(validatedQuery) {
  const filters = {};
  const excluded = ["page", "limit", "sort"];

  for (const key in validatedQuery) {
    if (excluded.includes(key)) continue;

    const value = validatedQuery[key];

    if (typeof value === "object" && (value.gte || value.lte)) {
      filters[key] = {};
      if (value.gte) filters[key].$gte = value.gte;
      if (value.lte) filters[key].$lte = value.lte;
    } else {
      filters[key] = value;
    }
  }

  return filters;
}

module.exports = { getFiltersFromQuery };
