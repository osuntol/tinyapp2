const { assert } = require('chai');

const { getUserByEmail } = require('../helper.js');

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const email = "user@example.com"
    const user = getUserByEmail(testUsers, email )
    const expectedUserID = "userRandomID";
    assert.notStrictEqual(user, expectedUserID)
  });
  it('should return undefined if the user passes an email not in the data base', function(){
    const user = getUserByEmail("user23@example.com", testUsers)
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID)
    
  })
});