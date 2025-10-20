const express = require("express");
const { connectDB } = require("./config");
const dotenv = require("dotenv");
// Import Routes
const userRoutes = require('./routes/users.routes');
const projectRoutes = require('./routes/projects.routes');

dotenv.config();

const app = express();

//#region Configuration
connectDB();

// Permet d'accéder au corps de la requête en JSON
app.use(express.json());

// Middleware CORS pour autoriser les requêtes cross-origin
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});
//#endregion

//#region Routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
//#endregion

module.exports = app;
