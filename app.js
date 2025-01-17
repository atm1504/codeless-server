const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');

// Models
const User = require('./models/user');
const Edu = require("./models/edu");
const Hospi = require("./models/hospi");
const Uidai = require("./models/uidai");

const MONGODB_URI =
    'mongodb+srv://atm1504:11312113@cluster0-yb5xu.mongodb.net/codeless?retryWrites=true&w=majority';
const app = express();
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

// Routers
const eduRoutes = require('./routes/edu');
const hospiRoutes = require('./routes/hospi');
const uidaiRoutes = require('./routes/uidai');
const userRoutes = require("./routes/user");

app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'public')));
app.use('/controllers',express.static(path.join(__dirname, 'controllers')));
app.use('/images', express.static(path.join(__dirname, 'images')));
// app.use(csrfProtection);

app.use('/edu', eduRoutes);
app.use('/hospi',hospiRoutes);
app.use('/uidai', uidaiRoutes);
app.use('/user', userRoutes);


app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode;
  const message = error.message;
  const data = error.data;
  res.status(status).json({message: message, data: data});
});


mongoose
    .connect(MONGODB_URI)
    .then(result => {
      console.log('Connected Database');
      app.listen(3000, function() {
        console.log('App listening on port ' + 3000 + '!');
      });
    })
    .catch(err => {
      console.log(err);

    });
