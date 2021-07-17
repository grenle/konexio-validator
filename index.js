const PORT = 8000

const express = require('express')
const exphbs  = require('express-handlebars')
const cors = require('cors')

const hbs = exphbs.create({
    helpers: {
    }
})

const users = require('./controllers/users')

const app = express()
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')

// this route serves no real purpose now, sad...
app.get('/', (req, res) => res.redirect('/users'))

app.use('/users', users)

app.listen(PORT, () => console.log(`[HTTP] listening on port ${PORT}`))