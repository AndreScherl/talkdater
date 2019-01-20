import config = require("config");
import express = require("express");
import session = require("express-session");
import { MongoClient } from "mongodb";
import { Ooth } from "ooth";
import oothLocal from "ooth-local";
import emailer from "ooth-local-emailer";
import { OothMongo } from "ooth-mongo";
import oothUser from "ooth-user";
import * as i18nDE from "../i18n/de.json";
import * as i18nEN from "../i18n/en.json";
import mail from "./mail";
// import { Usermanager } from "./usermanager";

const start = async () => {
    try {
        // connect to mongo db
        // Problem vielleicht damit lösen: https://stackoverflow.com/questions/41467801/how-to-create-an-application-specific-config-file-for-typescript
        const mongoCfg = config.get("mongo");
        const client = await MongoClient.connect(mongoCfg.url, {
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
        const oothMongo = new OothMongo(db);

        // new ooth instance - main instance for user authentication
        const ooth = new Ooth({
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
        oothLocal({ ooth });

        oothUser({ ooth });

        // settings for email interaction, including localization.
        emailer({
            ooth,
            from: config.get("mail.from"),
            siteName: config.get("siteName"),
            sendMail: mail(),
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
        await new Promise((res, rej) =>
            app.listen(config.get("port"), (e) => (e ? rej(e) : res(e)))
        );
        // tslint:disable-next-line:no-console
        console.info(`Online at ${config.get("host")}:${config.get("port")}`);
    } catch (e) {
        // tslint:disable-next-line:no-console
        console.error(e);
    }
};

void start();
