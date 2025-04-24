const express = require("express");
const jwt = require("jsonwebtoken");
const books = require("./booksdb.js");
const regd_users = express.Router();

const SECRET = "shhhh";

let users = [
  { username: "zohidjon", password: "12345678" },
  { username: "user1", password: "veryStrongPassword007" },
];

const isValid = (username) => {
  return (
    typeof username === "string" &&
    username.length >= 3 &&
    /^[a-zA-Z0-9_]+$/.test(username)
  );
};

const authenticatedUser = (username, password) => {
  return users.some((u) => u.username === username && u.password === password);
};

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ username }, SECRET, { expiresIn: "1h" });
  // store in session
  if (req.session) {
    req.session.authorization = { token, username };
  }
  return res.status(200).json({ message: "Login successful", token });
});

regd_users.post("/register", (req, res) => {
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

regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "Login required" });
  }
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }
  books[isbn].reviews[username] = review;
  return res.status(200).json({
    message: "Review added/updated",
    reviews: books[isbn].reviews,
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "Login required" });
  }
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!books[isbn].reviews[username]) {
    return res
      .status(404)
      .json({ message: "No review by this user to delete" });
  }
  delete books[isbn].reviews[username];
  return res.status(200).json({
    message: "Review deleted",
    reviews: books[isbn].reviews,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
