import { open } from "sqlite";
import { Database, verbose } from "sqlite3";

class SQLite {
  private _db;

  constructor() {}

  async connect() {
    // console.log(`SQLITE >> Opening db`);
    try {
      this._db = await open({
        filename: "./sqlite.db",
        driver: Database,
      });
      verbose();

      await this._db.exec(
        "CREATE TABLE IF NOT EXISTS WALLETS (pkey TEXT, isPrimary NUM) "
      );

      // console.log('SQLITE >> DB Opened')
    } catch (e) {
      console.error(`SQLITE >> Error while reading db`, e);
      process.exit(109);
    }
  }

  async getWallets() {
    return await this._db.all(`SELECT * from WALLETS`);
  }

  async addWallet(key: string) {
    // this._db
    return await this._db.exec(`INSERT INTO WALLETS VALUES ("${key}", 0)`);
  }

  removeWallet(key: string) {
    // this._db
    return this._db.exec(`DELETE FROM WALLETS WHERE pkey = '${key}'`);
  }

  markPrimaryWallet(key: string) {
    return new Promise(async (res, rej) => {
      try {
        await this._db.exec(`UPDATE WALLETS SET isPrimary = 0`);
        await this._db.exec(
          `UPDATE WALLETS SET isPrimary = 1 WHERE pkey = '${key}'`
        );
        res(true);
      } catch (e) {
        rej(e);
      }
    });
  }
}

export default new SQLite();
