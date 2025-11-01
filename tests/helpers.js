const jwt = require("jsonwebtoken");

function getTokenForUser(user) {
return jwt.sign(
      {
        user: {
          id: user._id,
          email: user.email,
          roles: user.roles,
        },
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
}

module.exports = { getTokenForUser };