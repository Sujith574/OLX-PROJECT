/**
 * APIFeatures class to handle filtering, sorting, searching, and pagination
 * of Mongoose queries with URL query parameters.
 */
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  /**
   * Filter by category, type, status
   */
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Remove empty values
    Object.keys(queryObj).forEach((key) => {
      if (queryObj[key] === '' || queryObj[key] === 'all') delete queryObj[key];
    });

    this.query = this.query.find(queryObj);
    return this;
  }

  /**
   * Full-text search on indexed fields
   */
  search() {
    if (this.queryString.search) {
      const searchTerm = this.queryString.search.trim();
      this.query = this.query.find({
        $text: { $search: searchTerm },
      });
    }
    return this;
  }

  /**
   * Sort results
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  /**
   * Limit returned fields
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }

  /**
   * Pagination
   */
  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 12;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.page = page;
    this.limit = limit;
    return this;
  }
}

module.exports = APIFeatures;
