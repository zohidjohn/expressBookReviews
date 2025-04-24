const express = require("express");
let booksdb = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username format" });
  }
  if (users.some((u) => u.username === username)) {
    return res.status(409).json({ message: "User already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered" });
});

public_users.get("/", (req, res) => {
  return res.status(200).json(booksdb);
});

public_users.get("/isbn/:isbn", (req, res) => {
  const { isbn } = req.params;
  const book = booksdb[isbn];
  if (book) {
    return res.status(200).json(book);
  }
  return res.status(404).json({ message: "Book not found" });
});

public_users.get("/author/:author", (req, res) => {
  const author = decodeURIComponent(req.params.author);
  const results = Object.values(booksdb).filter((b) => b.author === author);
  if (results.length > 0) {
    return res.status(200).json(results);
  }
  return res.status(404).json({ message: "No books found by that author" });
});

public_users.get("/title/:title", (req, res) => {
  const title = decodeURIComponent(req.params.title);
  const book = Object.values(booksdb).find((b) => b.title === title);
  if (book) {
    return res.status(200).json(book);
  }
  return res.status(404).json({ message: "No book found with that title" });
});

public_users.get("/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const book = booksdb[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  }
  return res.status(404).json({ message: "Book not found" });
});

const axios = require("axios");

function fetchAllBooks() {
  axios.get("http://localhost:5000/")
    .then(response => {
      console.log("All books:", JSON.stringify(response.data, null, 2));
    })
    .catch(error => {
      console.error("Error fetching all books:", error.message);
    });
}

async function fetchBookByISBN(isbn) {
  try {
    const resp = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    console.log(`Book ${isbn}:`, JSON.stringify(resp.data, null, 2));
  } catch (err) {
    console.error(`Error fetching ISBN ${isbn}:`, err.message);
  }
}

function fetchBooksByAuthor(author) {
  axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`)
    .then(resp => {
      console.log(`Books by ${author}:`, JSON.stringify(resp.data, null, 2));
    })
    .catch(err => {
      console.error(`Error fetching author ${author}:`, err.message);
    });
}

async function fetchBooksByTitle(title) {
  try {
    const resp = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
    console.log(`Title "${title}":`, JSON.stringify(resp.data, null, 2));
  } catch (err) {
    console.error(`Error fetching title ${title}:`, err.message);
  }
}

// fetchAllBooks();          
// fetchBookByISBN("1");     
// fetchBooksByAuthor("Chinua Achebe"); 
// fetchBooksByTitle("Things Fall Apart");


module.exports.general = public_users;
