"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("config");
const mongodb_1 = require("mongodb");
class Usermanager {
    constructor() {
        // tslint:disable-next-line:no-console
        console.log("construct");
        this.db = this.connect_to_mongo(config_1.default.get("mongo"));
        // tslint:disable-next-line:no-console
        console.log(this.db);
    }
    register_methods(serverapp) {
        // do something
    }
    async connect_to_mongo(mcfg) {
        const client = await mongodb_1.MongoClient.connect(mcfg.url, {
            auth: {
                password: mcfg.pwd,
                user: mcfg.user,
            },
            authSource: mcfg.db,
            useNewUrlParser: true,
        });
        return client.db(mcfg.db);
    }
}
exports.Usermanager = Usermanager;
