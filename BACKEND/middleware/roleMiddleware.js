const authorizeRoles =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Accès refusé - vous êtes ${req.user.role}`,
      });
    }

    next();
  };

module.exports = { authorizeRoles };
