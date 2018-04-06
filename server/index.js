const {MongoClient, ObjectId} = require('mongodb')
const express = require('express')
const session = require('express-session')
const {promisify} = require('util')
const Ooth = require('ooth')
const oothLocal = require('ooth-local')
const oothLocalTalkdater = require('./ooth-local-talkdater')
const OothMongo = require('ooth-mongo')
const config = require('config')
const mail = require('./mail')
const emailer = require('./ooth-local-emailer-talkdater')

const DEFAULT_LANGUAGE = 'de'

const start = async () => {
    try {
        // connect to mongo db
        const mongo_cfg = config.get("mongo")
        const client = await MongoClient.connect(mongo_cfg.url + '/' + mongo_cfg.db, {
            auth: {
                user: mongo_cfg.user,
                password: mongo_cfg.pwd,
            },
        })
        const db = client.db(mongo_cfg.db)
        
        // new express instance, including ooth session
        const app = express()
        app.use(session({
            name: 'api-session-id',
            secret: config.get("ooth.sessionSecret"),
            resave: false,
            saveUninitialized: true,
        }))

        // prevent x-powered-by attacks (see http://expressjs.com/en/advanced/best-practice-security.html#use-helmet)
        app.disable('x-powered-by')

        // new ooth instance - main instance for user authentication
        const ooth = new Ooth({
            sharedSecret: config.get("ooth.sharedSecret"),
            path: config.get("ooth.path"),
        })

        // connect ooth to mongodb backend with own api, and start ooth.
        const oothMongo = new OothMongo(db, ObjectId)
        await ooth.start(app, oothMongo)

        // settings for email interaction, including localization.
        const url = config.get("host")+":"+config.get("port")
        const mailOnEvents = emailer({
            from: config.get("mail.from"),
            siteName: config.get("siteName"),
            url: url,
            sendMail: mail(),
            translations: {
                de: require('./i18n/de.json'),
                en: require('./i18n/en.json')
            },
            urls: {
                verifyEmail: url + config.get("ooth.path") + config.get("mail.urls.verifyEmail"),
                resetPassword: url + config.get("ooth.path") + config.get("mail.urls.resetPassword")   
            },
            language: 'de'
        })

        // add the local authentication method to ooth instance. Customized for TalkDater.
        ooth.use('local', oothLocalTalkdater(oothLocal(mailOnEvents), mailOnEvents.onVerify))

        // define route for main entry of app.
        app.get('/', (req, res) => res.sendFile(`${__dirname}/index.html`))

        // start listenting for requests.
        await promisify(app.listen)(config.get("port"))
        console.info(`Online at ${config.get("host")}:${config.get("port")}`)
    } catch (e) {
        console.error(e)
    }
}

start()
