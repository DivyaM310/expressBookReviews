const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Initialize session
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// Authentication middleware
// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from "Bearer <token>"
    
    if (token) {
        jwt.verify(token, "superSecretKey12345!", (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Invalid token" });
            } else {
                req.user = decoded; // Attach the decoded token (user info) to the request
                next(); // Proceed to the next middleware/route handler
            }
        });
    } else {
        return res.status(401).json({ message: "Unauthorized. No token provided." });
    }
});


const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
