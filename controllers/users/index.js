const express = require('express')
const router = express.Router()

const { body, validationResult } = require('express-validator')

/*
Pour avoir au moins deux utilisateurs à l'init de
l'application
*/
const users = [
    {
        username: 'panpan',
        email: 'panpan@toutbeau.fr',
        age: '10',
        town: 'Paris',
    },
    {
        username: 'winnie',
        email: 'winnie@tiananmen.com',
        age: '33',
        town: 'Tokyo',
    }
]

/*
La liste des villes nues, pour utiliser dans validator
*/
const towns = ['Paris', 'Tokyo', 'Los Angeles']

/*
Ici on renvoie une liste de villes qui sont des objets avec
un nom et un booléen indiquant si la ville a été choisie ou
non (à partir du nom passé en paramètre). Utilisé pour
prépeupler le formulaire en cas d'erreurs
*/
function getTowns(selected=null){
    return towns.map(t => {
        return {
            name: t,
            selected: t === selected
        }
    })
}

/*
Une petite fonction pour faciliter l'initialisation des
champs et leur prépeuplement en cas d'erreur. Finalement,
nous ne nous en serons pas vraiment...oops. Refactoring
ahead!
*/
function initInput(value='', error=false, ermsg=''){
    return {
        value,
        error,
        ermsg,
    }
}

/*
Nos valeurs initiales, tout est vide (ou non selectionné
pour les villes) et il n'y a pas d'erreur
*/
const initValues = {
    username: initInput(),
    email: initInput(),
    age: initInput(),
    towns: getTowns()
}

/*
En cas d'erreur il faut renvoyer le formulaire préremplis
qui contient les valeurs correctes (dans le req.body mais
pas validationResult) et les erreurs (dans
validationResult). L'idée est d'unifier les erreurs et le
corps de la requête
*/
function formReqToValues(errors, reqValues){
    /*
    Le corps de la requête n'est pas au format que vous
    voulons utiliser, nous le transformons
    */
    for(const key in reqValues){
        reqValues[key] = initInput(reqValues[key])
    }
    /*
    Petite subtilité pour towns, le req.body contient une
    ville avec la clef town, nous voulons towns, au pluriel,
    qui est un array de {name: xx, selected: true|false }
    pour préremplir le select et selectionner la ville qui
    nous a été envoyé
    */
    reqValues.towns = getTowns(reqValues.town.value)
    /*
    Pour chaque erreur, nous trouvons le champs correpondant
    dans reqValues et assignons les propriétés error et
    ermsg
    */
    errors.forEach(err => {
        reqValues[err.param].error = true
        reqValues[err.param].ermsg = err.msg
    })
    return reqValues
}

router.get('/', async (req, res) => {
    res.render('userlist', {users})
})

router.get('/add', async(req, res) => {
    res.render('form', {...initValues})
})

router.post('/',
body('username').isLength({min: 4}).withMessage('veuillez entrer un username d`au moins 4 charactères').trim().escape(),
body('email').isEmail().withMessage('cet email est invalide').normalizeEmail(),
body('age').isInt({min: 1, max: 99}).withMessage('votre age doit être entre 1 et 99. Allez savoir.'),
body('town').isIn(towns).withMessage('Cette ville est inconnue. Très fort avec un dropdown...'),
(req, res) => {
    const errors = validationResult(req)
    const reqValues = req.body
    if(!errors.isEmpty()){
        res.render('form', formReqToValues(errors.array(), reqValues))
    }else{
        users.push(req.body)
        res.redirect('/users')
    }
})

router.get('/:username', async (req, res) => {
    const { username } = req.params
    const maybeUser = users.find(u => u.username === username)
    if(maybeUser){
        res.render('userDetails', {...maybeUser})
    }else{
        res.render('userNotFound', {username})
    }
})

router.get('/email/:email', async (req, res) => {
    const { email } = req.params
    const maybeUser = users.find(u => u.email === email)
    if(maybeUser){
        res.render('userDetails', {...maybeUser})
    }else{
        res.render('userNotFound', {email})
    }
})

module.exports = router