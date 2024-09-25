const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    // Get username and password from query parameters
    const { username, password } = req.query; 
  
    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
  
    // Check if the username already exists
    const userExists = users.find((user) => user.username === username);
    if (userExists) {
      return res.status(400).json({ message: "Username already exists" });
    }
  
    // Register the new user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
  });
  

public_users.get('/books/callback', (req, res) => {
  axios.get('http://localhost:5000')
    .then(response => {
      return res.status(200).json(response.data);
    })
    .catch(error => {
      console.error(error);
      return res.status(500).json({ message: "Error fetching book list" });
    });
});

// Get book details based on ISBN
public_users.get('/isbn/callback/:isbn', (req, res) => {
    const isbn = req.params.isbn; // Retrieve the ISBN from request parameters
  
    axios.get(`http://localhost:5000/isbn/${isbn}`)
      .then(response => {
        if (response.data) {
          return res.status(200).json(response.data); // Return the book details
        } else {
          return res.status(404).json({ message: "Book not found" }); // If book not found
        }
      })
      .catch(error => {
        console.error(error);
        return res.status(500).json({ message: "Error fetching book details" });
      });
  });
  
public_users.get('/author/callback/:author', (req, res) => {
  const author = req.params.author.toLowerCase(); // Retrieve the author from request parameters
  const booksByAuthor = [];
  axios.get('http://localhost:5000')
    .then(response => {
     Object.keys(response.data).forEach((key) => {
        if (response.data[key].author.toLowerCase() === author) {
          booksByAuthor.push(response.data[key]);}
      });
      if (booksByAuthor.length > 0) {
        return res.status(200).json(booksByAuthor); // Return the books by the author
      } else {
        return res.status(404).json({ message: "Books by the author not found" }); // If no books found
      }})
    .catch(error => {
      console.error(error);
      return res.status(500).json({ message: "Error fetching books" });
    });
});


public_users.get('/title/callback/:title', (req, res) => {
    const title = req.params.title.toLowerCase(); // Retrieve the title from request parameters
    let bookByTitle = null;
    axios.get('http://localhost:5000')
      .then(response => {
        Object.keys(response.data).forEach((key) => {
          if (response.data[key].title.toLowerCase() === title) {
            bookByTitle = response.data[key];
          }});
        if (bookByTitle) {
          return res.status(200).json(bookByTitle); // Return the found book
        } else {
          return res.status(404).json({ message: "Book with the given title not found" }); // If no book found
        } })
      .catch(error => {
        console.error(error);
        return res.status(500).json({ message: "Error fetching books" });
      });
  });

// Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Check if the book with the given ISBN exists
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
