const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
// Import Routes
const userRoutes = require('./routes/users.routes');
const projectRoutes = require('./routes/projects.routes');
const taskRoutes = require('./routes/tasks.routes');
const tagRoutes = require('./routes/tags.routes');

dotenv.config();

const app = express();

app.use(
  '/swagger-ui',
  express.static(path.join(__dirname, '../node_modules/swagger-ui-dist'))
);

const setUpSwagger = require('./swagger'); 

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
app.use('/api/tasks', taskRoutes);
app.use('/api', tagRoutes);
//#endregion

setUpSwagger(app);

module.exports = app;
