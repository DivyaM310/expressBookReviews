const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = []; // Store registered users

const isValid = (username) => { 
  // Check if username is not empty and does not already exist
  if (!username || users.some(user => user.username === username)) {
    return false; // Invalid if empty or already exists
  }
  return true; // Valid if unique
};

const authenticatedUser = (username, password) => { 
  // Check if there is a matching user
  const user = users.find(user => user.username === username);
  return user && user.password === password; // Return true if found and password matches
};

const secretKey = "superSecretKey12345!"; // Replace with your secret key

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body; // Get username and password from request body

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the user exists and the password matches
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate JWT token
  const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });

  // Send the token back to the client
  return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params; // Get ISBN from URL parameter
    const { review } = req.query; // Get review from query parameters
    
    // Check if review is provided
    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    // Check if the book exists
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Initialize reviews if not present
    if (!book.reviews) {
        book.reviews = {};
    }

    // Add or modify the review
    const username = req.user.username; // Ensure user is authenticated
    book.reviews[username] = review; // Add or update the review for the user

    return res.status(200).json({ message: "Review added/modified successfully", reviews: book.reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params; // Get the ISBN from the request parameters
    const username = req.user.username; // Get the username from the session (set by auth middleware)

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user has a review for this book
    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found" });
    }

    // Delete the user's review
    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Review deleted successfully" });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
