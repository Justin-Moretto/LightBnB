const properties = require('./json/properties.json');
const users = require('./json/users.json');
const {Pool} = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool.query(`
  SELECT * FROM users
  WHERE email = $1;
  `, [email || null])
  .then(res => res.rows[0]);
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithId = function(id) {
  const values = [id]
  const sqlQuery = `
  SELECT * FROM users
  WHERE id = $1`;
  return pool.query(sqlQuery, values)
  .then(res => res.rows[0]);
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  const values = [user.name, user.email, user.password];
  return pool.query(`
  INSERT INTO users (name, email, password)
  VALUES ($1, $2, $3)
  RETURNING *;
  `, values)
  .then(res => res.rows[0]);
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  const query = {
    text: `SELECT reservations.*, properties.*, AVG(rating) AS average_rating
    FROM property_reviews
    JOIN reservations ON reservations.id = property_reviews.reservation_id
    JOIN properties ON properties.id = reservations.property_id
    WHERE reservations.guest_id = $1
    AND reservations.end_date <> now()::date
    GROUP BY reservations.id, properties.id
    ORDER BY reservations.start_date
    LIMIT $2;`,
    values: [guest_id, limit]
  };

  return pool
    .query(query)
    .then(result => result.rows)
    .catch(err => console.error('query error', err.stack));
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {

  //this will get passed to the promise along with the query string
  const queryParams = [];

  //suppose the user leave all search fields empty
  let queries = false;

  //found non-empty value in options object
  for (const key in options) {
    if (options[key] !== '') {
      queries = true;
      break;
    }
  }

  //basic query with no conditions added
  if (!queries) {
    let queryString = `
    SELECT properties.*, AVG(property_reviews.rating) AS average_rating
    FROM properties
    JOIN property_reviews ON property_id = properties.id
    GROUP BY properties.id`;

    queryParams.push(limit);
    queryString += `
    LIMIT $${queryParams.length}`;

    return pool
      .query(queryString, queryParams)
      .then(result => result.rows)
      .catch(err => console.error('query error', err.stack));

  } else {

    //controls query format
    let needWhere = true;
    let queryString = `
    SELECT properties.*, AVG(property_reviews.rating) AS average_rating
    FROM properties
    LEFT JOIN property_reviews ON property_id = properties.id`;
    
    //if an owner_id is passed in the options object
    if (options.owner_id) {
      queryParams.push(options.owner_id);
      queryString += ` WHERE properties.owner_id=$${queryParams.length} `;
      needWhere = false;
    }

    //if a city is provided
    //LOWER is added to include results when user inputs all lower case city name
    if (options.city) {
      queryParams.push(`%${options.city}%`);
      if (!needWhere) {
        queryString += ' AND ';
      } else {
        queryString += ' WHERE ';
        needWhere = false;
      }
      
      queryString += ` LOWER(city) LIKE LOWER($${queryParams.length}) `;
    }
  
    //if price range is provided
    if (options.minimum_price_per_night && options.maximum_price_per_night) {
      queryParams.push(options.minimum_price_per_night);
      queryParams.push(options.maximum_price_per_night);
      
      if (!needWhere) {
        queryString += ' AND ';
      } else {
        queryString += ' WHERE ';
      }
      
      queryString += `cost_per_night / 100 > $${queryParams.length - 1}
      AND cost_per_night / 100 < $${queryParams.length}`;
    }

    //clause needed no matter what conditions apply to query
    queryString += ` GROUP BY properties.id`;
    

    //if minimum rating is provided
    if (options.minimum_rating) {
      queryParams.push(options.minimum_rating);
      queryString += ` HAVING AVG(property_reviews.rating) >= $${queryParams.length}`;
    }
      
    //set search limit - will be 10 by default
    queryParams.push(limit);
    queryString += `
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};
    `;

    return pool
      .query(queryString, queryParams)
      .then(result => result.rows)
      .catch(err => console.error('query error', err.stack));

  }
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
