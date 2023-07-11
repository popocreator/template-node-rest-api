import { createServer } from "http";
import connectDatabase from "./api/db";
import app from "./api/server";

console.log("MODE :: " + process.env.NODE_ENV);

const server = createServer(app);
const db = connectDatabase();

server.listen(3000, () => {
  console.log(`Server listening on port ${3000}`);
});

export { server, db };
