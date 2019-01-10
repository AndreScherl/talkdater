const { MongoClient } = require("mongodb")
const express = require("express")
const session = require("express-session")
const { Ooth } = require("ooth")
const oothLocal = require("ooth-local").default
const oothUser = require("ooth-user").default
const emailer = require("ooth-local-emailer").default
const { OothMongo } = require("ooth-mongo")
const config = require("config")
const mail = require("./mail")

const DEFAULT_LANGUAGE = "de"

const start = async () => {
    try {
        // connect to mongo db
        const mongo_cfg = config.get("mongo")
        const client = await MongoClient.connect(mongo_cfg.url, {
            auth: {
                user: mongo_cfg.user,
                password: mongo_cfg.pwd,
            },
            authSource: mongo_cfg.db,
            useNewUrlParser: true,
        })
        const db = client.db(mongo_cfg.db)
        
        // new express instance, including ooth session
        const app = express()
        app.use(session({
            name: "api-session-id",
            secret: config.get("ooth.sessionSecret"),
            resave: false,
            saveUninitialized: true,
        }))

        // prevent x-powered-by attacks (see http://expressjs.com/en/advanced/best-practice-security.html#use-helmet)
        app.disable("x-powered-by")

        // connect ooth to mongodb backend with own api.
        const oothMongo = new OothMongo(db)
        
        // new ooth instance - main instance for user authentication
        const ooth = new Ooth({
            app,
            backend: oothMongo,
            sharedSecret: config.get("ooth.sharedSecret"),
            path: config.get("ooth.path"),
        })

        // local strategy
        oothLocal({ ooth })

        oothUser({ ooth })

        // settings for email interaction, including localization.
        emailer({
            ooth,
            from: config.get("mail.from"),
            siteName: config.get("siteName"),
            url: config.get("host"),
            sendMail: mail(),
            translations: {
                de: require("./i18n/de.json"),
                en: require("./i18n/en.json"),
            },
            urls: {
                verifyEmail: config.get("host") + "/api" + config.get("ooth.path") + config.get("mail.urls.verifyEmail"),
                resetPassword: config.get("host") + "/api" + config.get("ooth.path") + config.get("mail.urls.resetPassword"),
            },
            language: 'de',
        })

        // some events that may be implemented soon      
        ooth.on("local", "register", ({ email, verificationToken, _id }) => {
            console.log(`Someone registered.`)
        })
        ooth.on(
            "local",
            "generate-verification-token",
            ({ email, verificationToken }) => {
                console.log(`Someone requested a verification email.`)
            }
        )
        ooth.on("local", "verify", ({ email }) => {
            console.log("Someone verified their email")
        })
        ooth.on("local", "forgot-password", ({ email, passwordResetToken }) => {
            console.log("Someone forgot their password")
        })
        ooth.on("local", "reset-password", ({ email }) => {
            console.log("Someone reset their password")
        })

        // define route for main entry of app.
        app.get("/", (req, res) => res.sendFile(`${__dirname}/index.html`))

        // start listenting for requests.
        await new Promise((res, rej) =>
            app.listen(config.get("port"), e => (e ? rej(e) : res(e)))
        )
        console.info(`Online at ${config.get("host")}:${config.get("port")}`)
    } catch (e) {
        console.error(e)
    }
}

start()
