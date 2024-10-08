const axios = require('axios');
require('dotenv').config();

class BitqueryClient {
  constructor() {
    this.apiUrl = 'https://graphql.bitquery.io';
    this.apiKey = process.env.BITQUERY_API_KEY;
    this.bearerToken = process.env.BITQUERY_BEARER_TOKEN;
  }

  async query(queryString, variables = {}) {
    const config = {
      method: 'post',
      url: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': this.apiKey,
        'Authorization': `Bearer ${this.bearerToken}`
      },
      data: JSON.stringify({
        query: queryString,
        variables: JSON.stringify(variables)
      })
    };

    try {
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error('Error querying Bitquery API:', error.message);
      throw error;
    }
  }
}

module.exports = BitqueryClient;