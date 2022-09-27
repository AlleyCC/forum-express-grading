const path = require('path')
const express = require('express')
const engine = require('express-handlebars')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const session = require('express-session')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const passport = require('passport')
const handlebarsHelpers = require('./helpers/handlebars-helpers')
const { getUser } = require('./helpers/auth-helpers')

const { pages, apis } = require('./routes')

const app = express()
const port = process.env.PORT || 3000
const SESSION_SECRET = 'MySecret'

app.engine('hbs', engine({ defaultLayout: 'main', extname: '.hbs', helpers: handlebarsHelpers }))
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))
app.use('/upload', express.static(path.join(__dirname, 'upload')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json()) // for parsing application/json
app.use(methodOverride('_method'))

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.currentUser = getUser(req)
  next()
})
app.use('/api', apis) // 條件較app.use(pages)嚴格因此放較前面
app.use(pages)
app.listen(port, () => {
  console.info(`Example app listening on port ${port}!`)
})

module.exports = app // 因測試環境會用到app.js，必須exports
