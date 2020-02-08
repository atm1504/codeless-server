const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const multer = require('multer');

const errorController = require('./controllers/error');
const User = require('./models/user');
const Edu = require("./models/edu");
const Hospi = require("./models/hospi");
const Uidai = require("./models/uidai");

const MONGODB_URI =
    'mongodb+srv://atm1504:11312113@cluster0-yb5xu.mongodb.net/codeless?retryWrites=true&w=majority';
const app = express();
// const store = new MongoDBStore({uri: MONGODB_URI, collection: 'sessions'});
const csrfProtection = csrf();

// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'images');
//   },
//   filename: (req, file, cb) => {
//     cb(null, new Date().toISOString() + '-' + file.originalname);
//   }
// });

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' ||
//       file.mimetype === 'image/jpeg') {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

const eduRoutes = require('./routes/edu');
const hospiRoutes = require('./routes/hospi');
const uidaiRoutes = require('./routes/uidai');

app.use(bodyParser.urlencoded({extended: false}));
// app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
// app.use(express.static(path.join(__dirname, 'public')));
// app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(csrfProtection);

app.use('/edu', eduRoutes);
app.use('/hospi',hospiRoutes);
app.use('uidai',uidaiRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
});

mongoose.connect(MONGODB_URI)
    .then(result => {
      app.listen(3000);
      console.log("Connected to the server successfully");
    })
    .catch(err => {
      console.log(err);
    });
