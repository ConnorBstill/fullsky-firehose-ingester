import { db } from "./db/index";
import { createIdResolver } from "./id-resolver";
import { createIngester } from "./ingester";

const start = () => {
  const baseIdResolver = createIdResolver();
  const ingester = createIngester(db, baseIdResolver);

  ingester.start();
};

console.log("Server start on ", 8080);
start();
