import { MongoClient } from "mongodb";
import { PrismaClient } from "@prisma/client";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {}

const prisma = new PrismaClient();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://adarshdeepsachanangel_db_user:uiV0couiG6YVKJ3m@mojicart.oqkp3m9.mongodb.net/mojicart?retryWrites=true&w=majority";

async function main() {
  console.log("=== Mojicart MongoDB Atlas Data Synchronization ===");
  console.log("Connecting to MongoDB Atlas...");

  const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  await client.connect();
  const db = client.db("mojicart");
  console.log("Connected to MongoDB Atlas database: mojicart");

  // 1. Users
  const users = await prisma.user.findMany({ include: { addresses: true } });
  if (users.length > 0) {
    await db.collection("users").deleteMany({});
    await db.collection("users").insertMany(users.map((u) => ({ ...u, _id: u.id })));
    console.log(`Synced ${users.length} users to MongoDB Atlas.`);
  }

  // 2. Categories
  const categories = await prisma.category.findMany();
  if (categories.length > 0) {
    await db.collection("categories").deleteMany({});
    await db.collection("categories").insertMany(
      categories.map((c) => ({ ...c, _id: c.id }))
    );
    console.log(`Synced ${categories.length} categories to MongoDB Atlas.`);
  }

  // 3. Sellers
  const sellers = await prisma.seller.findMany();
  if (sellers.length > 0) {
    await db.collection("sellers").deleteMany({});
    await db.collection("sellers").insertMany(sellers.map((s) => ({ ...s, _id: s.id })));
    console.log(`Synced ${sellers.length} sellers to MongoDB Atlas.`);
  }

  // 4. Products (with images & variants)
  const products = await prisma.product.findMany({
    include: {
      images: true,
      variants: true,
    },
  });
  if (products.length > 0) {
    await db.collection("products").deleteMany({});
    await db.collection("products").insertMany(
      products.map((p) => ({ ...p, _id: p.id }))
    );
    console.log(`Synced ${products.length} products to MongoDB Atlas.`);
  }

  // 5. Orders (with items & status history)
  const orders = await prisma.order.findMany({
    include: {
      items: true,
      statusHistory: true,
    },
  });
  if (orders.length > 0) {
    await db.collection("orders").deleteMany({});
    await db.collection("orders").insertMany(orders.map((o) => ({ ...o, _id: o.id })));
    console.log(`Synced ${orders.length} orders to MongoDB Atlas.`);
  }

  // 6. CMS Banners
  const banners = await prisma.cMSBanner.findMany();
  if (banners.length > 0) {
    await db.collection("cms_banners").deleteMany({});
    await db.collection("cms_banners").insertMany(
      banners.map((b) => ({ ...b, _id: b.id }))
    );
    console.log(`Synced ${banners.length} CMS banners to MongoDB Atlas.`);
  }

  // 7. Reviews
  const reviews = await prisma.review.findMany();
  if (reviews.length > 0) {
    await db.collection("reviews").deleteMany({});
    await db.collection("reviews").insertMany(reviews.map((r) => ({ ...r, _id: r.id })));
    console.log(`Synced ${reviews.length} reviews to MongoDB Atlas.`);
  }

  console.log("=== Verification of MongoDB Atlas Collections ===");
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`- Collection '${col.name}': ${count} documents`);
  }

  await client.close();
  console.log("=== MongoDB Atlas Sync Complete! ===");
}

main()
  .catch((e) => console.error("Sync error:", e))
  .finally(() => prisma.$disconnect());
