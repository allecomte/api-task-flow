const jwt = require("jsonwebtoken");

const authToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  try {
    const tokenContent = jwt.verify(token, process.env.JWT_SECRET);
    req.user = tokenContent.user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};

const authRoles = (rolesAllowed = []) => {
  return (req, res, next) => {
    try {
      if (rolesAllowed.length === 0) {
        return next();
      }

      const hasRole = req.user.roles.some((role) =>
        rolesAllowed.includes(role)
      );

      if (!hasRole) {
        return res.status(403).json({ message: "Acces denied" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Token is not valid" });
    }
  };
};

module.exports = {authToken, authRoles};
