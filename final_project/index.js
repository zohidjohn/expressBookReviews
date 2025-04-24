const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const SECRET = "shhhh";

const app = express();
app.use(express.json());

app.use(
  session({
    secret: SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/auth", (req, res, next) => {
  const auth = req.session.authorization;
  if (!auth || !auth.token) {
    return res.status(401).json({ message: "Login required" });
  }
  try {
    req.user = jwt.verify(auth.token, SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

app.use("/", genl_routes); 
app.use("/", customer_routes); 

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
