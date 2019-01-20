"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require("config");
const express = require("express");
const session = require("express-session");
const mongodb_1 = require("mongodb");
const ooth_1 = require("ooth");
const ooth_local_1 = require("ooth-local");
const ooth_local_emailer_1 = require("ooth-local-emailer");
const ooth_mongo_1 = require("ooth-mongo");
const ooth_user_1 = require("ooth-user");
const i18nDE = require("../i18n/de.json");
const i18nEN = require("../i18n/en.json");
const mail_1 = require("./mail");
// import { Usermanager } from "./usermanager";
const start = async () => {
    try {
        // connect to mongo db
        // Problem vielleicht damit lösen: https://stackoverflow.com/questions/41467801/how-to-create-an-application-specific-config-file-for-typescript
        const mongoCfg = config.get("mongo");
        const client = await mongodb_1.MongoClient.connect(mongoCfg.url, {
            auth: {
                user: mongoCfg.user,
                password: mongoCfg.pwd,
            },
            authSource: mongoCfg.db,
            useNewUrlParser: true,
        });
        const db = client.db(mongoCfg.db);
        // new express instance
        const app = express();
        // prevent x-powered-by attacks (see http://expressjs.com/en/advanced/best-practice-security.html#use-helmet)
        app.disable("x-powered-by");
        // connect ooth to mongodb backend with own api.
        const oothMongo = new ooth_mongo_1.OothMongo(db);
        // new ooth instance - main instance for user authentication
        const ooth = new ooth_1.Ooth({
            app,
            backend: oothMongo,
            path: config.get("ooth.path"),
            session: session({
                name: "api-session-id",
                secret: config.get("ooth.sessionSecret"),
                resave: false,
                saveUninitialized: true,
            }),
        });
        // local strategy
        ooth_local_1.default({ ooth });
        ooth_user_1.default({ ooth });
        // settings for email interaction, including localization.
        ooth_local_emailer_1.default({
            ooth,
            from: config.get("mail.from"),
            siteName: config.get("siteName"),
            sendMail: mail_1.default(),
            translations: {
                de: i18nDE,
                en: i18nEN,
            },
            urls: {
                verifyEmail: config.get("host") + "/api" + config.get("ooth.path") + config.get("mail.urls.verifyEmail"),
                resetPassword: config.get("host") + "/api" + config.get("ooth.path") + config.get("mail.urls.resetPassword"),
            },
            defaultLanguage: "de",
        });
        // some events that may be implemented soon
        // ooth.on("local", "register", ({ email, verificationToken, _id }) => {
        //     // tslint:disable-next-line:no-console
        //     console.log(`Someone registered.`);
        // });
        // ooth.on(
        //     "local",
        //     "generate-verification-token",
        //     ({ email, verificationToken }) => {
        //         // tslint:disable-next-line:no-console
        //         console.log(`Someone requested a verification email.`);
        //     }
        // );
        // ooth.on("local", "verify", ({ email }) => {
        //     // tslint:disable-next-line:no-console
        //     console.log("Someone verified their email");
        // });
        // ooth.on("local", "forgot-password", ({ email, passwordResetToken }) => {
        //     // tslint:disable-next-line:no-console
        //     console.log("Someone forgot their password");
        // });
        // ooth.on("local", "reset-password", ({ email }) => {
        //     // tslint:disable-next-line:no-console
        //     console.log("Someone reset their password");
        // });
        // user management
        // const usermanager = new Usermanager();
        // define route for main entry of app.
        app.get("/", (req, res) => res.sendFile(`${__dirname}/index.html`));
        // start listenting for requests.
        await new Promise((res, rej) => app.listen(config.get("port"), (e) => (e ? rej(e) : res(e))));
        // tslint:disable-next-line:no-console
        console.info(`Online at ${config.get("host")}:${config.get("port")}`);
    }
    catch (e) {
        // tslint:disable-next-line:no-console
        console.error(e);
    }
};
void start();
