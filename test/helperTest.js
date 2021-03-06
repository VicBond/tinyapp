const { assert } = require('chai');
const { getUserByEmail } = require('../helpers.js');


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

describe('guetUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user2@example.com", testUsers);
    const expectedOutput = "user2RandomID";
    assert.equal(expectedOutput, user.id);
  });
  it('should return undefined with an invalid email', function() {
    const user = getUserByEmail("user3@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(expectedOutput, user.id);
  });
});
