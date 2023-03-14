class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;

    // console.log(`query: ${this.query}\nqueryStr: ${this.queryStr}`);
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          // applying query on product name
          name: {
            $regex: this.queryStr.keyword,
            $options: "i", // to make case insensitive
          },
        }
      : {};

    // console.log("keyword: ", keyword);
    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    // const queryCopy = this.queryStr //passed by reference, so it wil change the original queryStr object (error)
    // so using spread operator to create a copy
    const queryCopy = { ...this.queryStr };
    // console.log('Before removing', queryCopy);

    // Removing some fields for category
    const removeFields = ["keyword", "page", "limit"];
    removeFields.forEach((key) => {
      delete queryCopy[key];
    });
    // console.log('After removing', queryCopy);

    // Filter For Price and Rating
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  pagination(resultsPerPage) {
    const currPage = Number(this.queryStr.page) || 1;

    // if total 50 page, if currPage=1 -> skip 0 product & show (1-10 products), if resPerPage=10
    // if total 50 page, if currPage=2 -> skip 10 product & show (11-20 products), if resPerPage=10
    const skipProdCount = resultsPerPage * (currPage - 1);
    this.query = this.query.limit(resultsPerPage).skip(skipProdCount);

    return this;
  }
}

export default ApiFeatures;
