import config from "config";
import { express } from "express";
import { MongoClient } from "mongodb";

export class Usermanager {
  private db: any;

  constructor() {
    // tslint:disable-next-line:no-console
    console.log("construct");
    this.db = this.connect_to_mongo(config.get("mongo"));
    // tslint:disable-next-line:no-console
    console.log(this.db);
  }

  public register_methods(serverapp: express.Application) {
    // do something
  }

  private async connect_to_mongo(mcfg) {
    const client = await MongoClient.connect(mcfg.url, {
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
