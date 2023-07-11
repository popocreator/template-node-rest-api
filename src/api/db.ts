import { Sequelize } from "sequelize-typescript";

export default function connectDatabase() {
  const DB_USERNAME = process.env.DB_USERNAME ?? "";
  const DB_PASSWORD = process.env.DB_PASSWORD ?? "";
  const DB_HOST = process.env.DB_HOST ?? "";
  const DB_NAME = process.env.DB_NAME ?? "";

  const sequelize = new Sequelize({
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    host: DB_HOST,
    dialect: "mysql",
    models: [__dirname + "/**/*.model.js", __dirname + "/**/*.model.ts"],
    modelMatch: (filename, member) => {
      return (
        filename.substring(0, filename.indexOf(".model")) ===
        member.toLowerCase()
      );
    }
  });

  return sequelize;
}

