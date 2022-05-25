//Import Modules 
const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const connectDB = require('./config/db')
const cors = require('cors')
const { application } = require('express')


//CONFIGS 
//load config
dotenv.config({path: './config/config.env'})

//passtport config
require('./config/passport')(passport)


//CONNECT DB
connectDB()

//Initailize app
const app = express()

//Body Parser
app.use(express.urlencoded({ extends: false}))
app.use(express.json())

//MethodOverride
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  }))


//MIDDLEWARE
app.use(cors())
//Logging
if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}


//Handlebars helper
const { formatDate, stripTags, truncate, editIcon, select  } = require('./helpers/hbs')
//Handlebars 
app.engine('.hbs', exphbs.engine({ helpers:{
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select,
    },
    defaultLayout : 'main',
    extname : '.hbs'} ))
app.set('view engine', '.hbs')

//session middleware
app.use(session({
    secret : 'keyborad cat',
    resave : false,
    saveUninitialized : false,
    store: MongoStore.create({mongoUrl: process.env.MONGO_URI})
}))

//passport middleware
app.use(passport.initialize()) 
app.use(passport.session())

//Set Global variable 
app.use(function (req, res, next){
    res.locals.user = req.user || null
    next(   )
})

//Static Folder
app.use(express.static(path.join(__dirname, 'public')))



//route
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))


const port = process.env.PORT || 5000
//Start listening
app.listen(
    port,
    console.log(`server running in ${process.env.NODE_ENV} mode on port ${port}`)
    );