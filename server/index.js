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
        const mongo_cfg = config.get("mongo")
        const client = await MongoClient.connect(mongo_cfg.url + '/' + mongo_cfg.db, {
            auth: {
                user: mongo_cfg.user,
                password: mongo_cfg.pwd,
            },
        })
        const db = client.db(mongo_cfg.db)
    
        const app = express()
        app.use(session({
            name: 'api-session-id',
            secret: config.get("ooth.sessionSecret"),
            resave: false,
            saveUninitialized: true,
        }))

        const ooth = new Ooth({
            sharedSecret: config.get("ooth.sharedSecret"),
            path: config.get("ooth.path"),
        })
        const oothMongo = new OothMongo(db, ObjectId)
        await ooth.start(app, oothMongo)
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
        ooth.use('local', oothLocalTalkdater(oothLocal(mailOnEvents), mailOnEvents.onVerify))

        app.get('/', (req, res) => res.sendFile(`${__dirname}/index.html`))

        await promisify(app.listen)(config.get("port"))
        console.info(`Online at ${config.get("host")}:${config.get("port")}`)
    } catch (e) {
        console.error(e)
    }
}

start()
