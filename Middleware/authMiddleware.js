const jwt = require("jsonwebtoken");

// Middleware to protect routes by verifying JWT token
exports.protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check for authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authorized, token missing" });
    }

    const token = authHeader.split(" ")[1];

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Attach user data to the request object
    req.user = decoded;

    next(); // Continue to the next middleware or route handler
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
