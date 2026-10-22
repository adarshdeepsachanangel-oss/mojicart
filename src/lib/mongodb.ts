import { MongoClient, Db } from "mongodb";
import dns from "dns";

// Ensure DNS resolution works reliably for SRV records across all network environments
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore in environments where setting DNS servers is restricted
}

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://adarshdeepsachanangel_db_user:uiV0couiG6YVKJ3m@mojicart.oqkp3m9.mongodb.net/mojicart?retryWrites=true&w=majority";

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getMongoDb(dbName = "mojicart"): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export async function getMongoCollection(collectionName: string, dbName = "mojicart") {
  const db = await getMongoDb(dbName);
  return db.collection(collectionName);
}

export { clientPromise };
export default clientPromise;
