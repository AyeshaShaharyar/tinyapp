//tests for findUserByEmail function
const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.isOk(user, expectedUserID);
  });

  it('should return a undefined with invalid email', function() {
    const user = findUserByEmail("user123@example.com", testUsers)
    
    assert.isNotOk(user, undefined);
  });
});