import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Mojicart Database Seed...");

  // Clear existing data safely
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.sellerSettlement.deleteMany();
  await prisma.seller.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.supportMessage.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.homepageSection.deleteMany();
  await prisma.cMSBanner.deleteMany();
  await prisma.globalSetting.deleteMany();

  const hashedPw = await bcrypt.hash("password123", 10);
  const adminPw = await bcrypt.hash("admin123", 10);

  // 1. Create Users & Staff
  console.log("👤 Creating Users and Admins...");
  const superAdmin = await prisma.user.create({
    data: {
      name: "Rajesh Kumar (Super Admin)",
      email: "admin@mojicart.com",
      phone: "+919876543210",
      passwordHash: adminPw,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  const catalogManager = await prisma.user.create({
    data: {
      name: "Sneha Patel (Catalog Manager)",
      email: "catalog@mojicart.com",
      phone: "+919876543211",
      passwordHash: hashedPw,
      role: "CATALOG_MANAGER",
      status: "ACTIVE",
      isEmailVerified: true,
    },
  });

  const orderManager = await prisma.user.create({
    data: {
      name: "Vikas Joshi (Order Manager)",
      email: "orders@mojicart.com",
      phone: "+919876543212",
      passwordHash: hashedPw,
      role: "ORDER_MANAGER",
      status: "ACTIVE",
      isEmailVerified: true,
    },
  });

  const supportStaff = await prisma.user.create({
    data: {
      name: "Ananya Iyer (Support Specialist)",
      email: "support@mojicart.com",
      phone: "+919876543213",
      passwordHash: hashedPw,
      role: "SUPPORT_STAFF",
      status: "ACTIVE",
      isEmailVerified: true,
    },
  });

  // Customers
  const customer1 = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "priya@gmail.com",
      phone: "+919988776655",
      passwordHash: hashedPw,
      role: "CUSTOMER",
      status: "ACTIVE",
      isEmailVerified: true,
      addresses: {
        create: [
          {
            fullName: "Priya Sharma",
            phone: "+919988776655",
            pincode: "110001",
            addressLine1: "Flat 402, Lotus Greens, Barakhamba Road",
            addressLine2: "Near Rajiv Chowk Metro",
            city: "New Delhi",
            state: "Delhi",
            addressType: "HOME",
            isDefault: true,
          },
        ],
      },
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: "Rahul Verma",
      email: "rahul@gmail.com",
      phone: "+919812345678",
      passwordHash: hashedPw,
      role: "CUSTOMER",
      status: "ACTIVE",
      isEmailVerified: true,
      addresses: {
        create: [
          {
            fullName: "Rahul Verma",
            phone: "+919812345678",
            pincode: "560034",
            addressLine1: "Villa 18, Palm Meadows, Koramangala 4th Block",
            city: "Bengaluru",
            state: "Karnataka",
            addressType: "WORK",
            isDefault: true,
          },
        ],
      },
    },
  });

  // 2. Multi-Vendor Sellers
  console.log("🏪 Creating Multi-Vendor Sellers...");
  const seller1User = await prisma.user.create({
    data: {
      name: "Amit Singhania",
      email: "seller1@desivogue.in",
      phone: "+919822001122",
      passwordHash: hashedPw,
      role: "SELLER",
      status: "ACTIVE",
      isEmailVerified: true,
    },
  });

  const seller1 = await prisma.seller.create({
    data: {
      userId: seller1User.id,
      storeName: "DesiVogue Ethnic Apparels",
      storeSlug: "desivogue-ethnic",
      description: "Direct-from-weaver Jaipuri kurtis, Chanderi sarees & festive collections.",
      gstin: "07AABCS1429B1Z8",
      pan: "AABCS1429B",
      bankAccountName: "DesiVogue Retail LLP",
      bankAccountNumber: "50200034567890",
      bankIfsc: "HDFC0000123",
      bankName: "HDFC Bank",
      commissionRate: 10.0,
      status: "APPROVED",
      rating: 4.7,
      totalSales: 489200.0,
    },
  });

  const seller2User = await prisma.user.create({
    data: {
      name: "Karan Mehta",
      email: "seller2@bharatelec.in",
      phone: "+919833002233",
      passwordHash: hashedPw,
      role: "SELLER",
      status: "ACTIVE",
      isEmailVerified: true,
    },
  });

  const seller2 = await prisma.seller.create({
    data: {
      userId: seller2User.id,
      storeName: "Bharat Electronics & Gadgets",
      storeSlug: "bharat-electronics",
      description: "Authorized genuine retailer for audio gear, smart watches and mobile power accessories.",
      gstin: "27AAGCB2314Q1ZL",
      pan: "AAGCB2314Q",
      bankAccountName: "Bharat Electronics Pvt Ltd",
      bankAccountNumber: "00112233445566",
      bankIfsc: "SBIN0001234",
      bankName: "State Bank of India",
      commissionRate: 8.5,
      status: "APPROVED",
      rating: 4.8,
      totalSales: 890500.0,
    },
  });

  const seller3User = await prisma.user.create({
    data: {
      name: "Meenakshi Sundaram",
      email: "seller3@gharshringar.in",
      phone: "+919844003344",
      passwordHash: hashedPw,
      role: "SELLER",
      status: "ACTIVE",
      isEmailVerified: true,
    },
  });

  const seller3 = await prisma.seller.create({
    data: {
      userId: seller3User.id,
      storeName: "GharShringar Home Decor",
      storeSlug: "gharshringar-decor",
      description: "Artisanal bedsheets, terracotta lamps, kitchen storage and traditional handicraft.",
      gstin: "33AATCS9988C1ZR",
      pan: "AATCS9988C",
      bankAccountName: "Ghar Shringar Handlooms",
      bankAccountNumber: "98765432101234",
      bankIfsc: "ICIC0000987",
      bankName: "ICICI Bank",
      commissionRate: 12.0,
      status: "APPROVED",
      rating: 4.5,
      totalSales: 245000.0,
    },
  });

  // Pending seller for approval testing
  const pendingSellerUser = await prisma.user.create({
    data: {
      name: "Rohit Agarwal",
      email: "rohit@freshcrafts.in",
      phone: "+919855004455",
      passwordHash: hashedPw,
      role: "SELLER",
      status: "PENDING_VERIFICATION",
    },
  });

  await prisma.seller.create({
    data: {
      userId: pendingSellerUser.id,
      storeName: "FreshCrafts Essentials",
      storeSlug: "freshcrafts-essentials",
      description: "Handcrafted natural bamboo cutlery, organic kitchenware and utility bags.",
      gstin: "08BBACS1122D1Z3",
      pan: "BBACS1122D",
      bankAccountName: "FreshCrafts LLP",
      bankAccountNumber: "44556677889900",
      bankIfsc: "PUNB0004567",
      bankName: "Punjab National Bank",
      commissionRate: 10.0,
      status: "PENDING",
      rating: 0.0,
      totalSales: 0.0,
    },
  });

  // 3. Warehouses
  console.log("🏭 Creating Warehouses...");
  const whDelhi = await prisma.warehouse.create({
    data: {
      name: "Delhi NCR Central Fulfillment Hub",
      code: "DEL-01",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110037",
    },
  });

  await prisma.warehouse.create({
    data: {
      name: "Bhiwandi Western Hub",
      code: "BHW-01",
      city: "Bhiwandi",
      state: "Maharashtra",
      pincode: "421302",
    },
  });

  // 4. Categories & Brands
  console.log("📁 Creating Categories and Brands...");
  const catWomen = await prisma.category.create({
    data: {
      name: "Women Ethnic",
      slug: "women-ethnic",
      description: "Kurtis, Sarees, Dupattas and Festive Suits",
      icon: "Sparkles",
      displayOrder: 1,
      level: 1,
      commissionRate: 10.0,
    },
  });

  const catKurtis = await prisma.category.create({
    data: {
      name: "Kurtis & Kurtas",
      slug: "kurtis-and-kurtas",
      parentId: catWomen.id,
      displayOrder: 1,
      level: 2,
      commissionRate: 10.0,
    },
  });

  const catSarees = await prisma.category.create({
    data: {
      name: "Sarees & Lehengas",
      slug: "sarees-and-lehengas",
      parentId: catWomen.id,
      displayOrder: 2,
      level: 2,
      commissionRate: 10.0,
    },
  });

  const catElectronics = await prisma.category.create({
    data: {
      name: "Electronics & Gadgets",
      slug: "electronics",
      description: "Smart audio, chargers, smartwatches and accessories",
      icon: "Headphones",
      displayOrder: 2,
      level: 1,
      commissionRate: 8.0,
    },
  });

  const catAudio = await prisma.category.create({
    data: {
      name: "Headphones & TWS",
      slug: "headphones-tws",
      parentId: catElectronics.id,
      displayOrder: 1,
      level: 2,
      commissionRate: 8.0,
    },
  });

  const catHome = await prisma.category.create({
    data: {
      name: "Home & Kitchen",
      slug: "home-kitchen",
      description: "Bedsheets, cookware, organizers and decor",
      icon: "Home",
      displayOrder: 3,
      level: 1,
      commissionRate: 12.0,
    },
  });

  const catBudget199 = await prisma.category.create({
    data: {
      name: "Under ₹199 Store",
      slug: "under-199",
      description: "Super budget essentials, earrings, hair accessories and small gadgets",
      icon: "Tag",
      displayOrder: 4,
      level: 1,
      commissionRate: 5.0,
    },
  });

  const catBudget499 = await prisma.category.create({
    data: {
      name: "Under ₹499 Store",
      slug: "under-499",
      description: "Trending t-shirts, kitchenware, dupattas and daily essentials",
      icon: "BadgePercent",
      displayOrder: 5,
      level: 1,
      commissionRate: 7.0,
    },
  });

  // Brands
  const brandDesi = await prisma.brand.create({
    data: { name: "DesiVogue", slug: "desivogue", isFeatured: true },
  });
  const brandNoise = await prisma.brand.create({
    data: { name: "Noise", slug: "noise", isFeatured: true },
  });
  const brandBoat = await prisma.brand.create({
    data: { name: "boAt", slug: "boat", isFeatured: true },
  });
  const brandGhar = await prisma.brand.create({
    data: { name: "GharShringar", slug: "gharshringar", isFeatured: true },
  });

  // 5. Products
  console.log("🛍️ Creating Products, Variants, and Images...");

  // Product 1: Anarkali Kurti Set
  const p1 = await prisma.product.create({
    data: {
      title: "Anarkali Pure Cotton Embroidered Kurta with Pant & Dupatta Set",
      slug: "anarkali-pure-cotton-embroidered-kurta-set",
      description: "Crafted from breathable 100% cambric cotton with exquisite thread embroidery on the yoke and lace detailing. Features matching straight pants and a soft mulmul printed dupatta.",
      categoryId: catKurtis.id,
      brandId: brandDesi.id,
      sellerId: seller1.id,
      status: "APPROVED",
      basePrice: 699.0,
      mrp: 1999.0,
      discountPercent: 65.0,
      taxRate: 5.0,
      isFeatured: true,
      isBestSeller: true,
      rating: 4.8,
      reviewCount: 342,
      totalSold: 1250,
      returnPolicyDays: 7,
      sku: "DV-KURTA-001",
      stock: 150,
      highlights: "100% Breathable Cambric Cotton\nThread embroidery with gota patti borders\nIncludes Kurta, Pant & Mulmul Dupatta\nCalf length with round neck",
      specs: JSON.stringify({
        Fabric: "100% Cotton",
        Pattern: "Floral Embroidered",
        "Sleeve Length": "3/4 Sleeves",
        Fit: "Regular A-Line",
        "Wash Care": "Hand wash or gentle machine wash",
      }),
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
            isPrimary: true,
            displayOrder: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
            isPrimary: false,
            displayOrder: 2,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "DV-KURTA-001-M",
            title: "Size: M (Bust 38 in)",
            price: 699.0,
            mrp: 1999.0,
            stock: 50,
            attributes: JSON.stringify({ Size: "M", Color: "Emerald Green" }),
          },
          {
            sku: "DV-KURTA-001-L",
            title: "Size: L (Bust 40 in)",
            price: 699.0,
            mrp: 1999.0,
            stock: 60,
            attributes: JSON.stringify({ Size: "L", Color: "Emerald Green" }),
          },
          {
            sku: "DV-KURTA-001-XL",
            title: "Size: XL (Bust 42 in)",
            price: 699.0,
            mrp: 1999.0,
            stock: 40,
            attributes: JSON.stringify({ Size: "XL", Color: "Emerald Green" }),
          },
        ],
      },
    },
  });

  // Product 2: Wireless ANC Earbuds
  const p2 = await prisma.product.create({
    data: {
      title: "boAt Airdopes 141 True Wireless Earbuds with 42H Playtime & Beast Mode",
      slug: "boat-airdopes-141-tws-earbuds",
      description: "Immerse yourself in rich signature audio with boAt Airdopes 141. Equipped with ENx environmental noise cancellation for crystal clear calls, low latency gaming mode, and IPX4 sweat resistance.",
      categoryId: catAudio.id,
      brandId: brandBoat.id,
      sellerId: seller2.id,
      status: "APPROVED",
      basePrice: 999.0,
      mrp: 2990.0,
      discountPercent: 67.0,
      taxRate: 18.0,
      isFeatured: true,
      isBestSeller: true,
      rating: 4.6,
      reviewCount: 1820,
      totalSold: 8400,
      returnPolicyDays: 7,
      sku: "BOAT-AD141-BLK",
      stock: 300,
      highlights: "Up to 42 hours total playtime\nENx technology for crystal calls\nASAP Fast Charge (5 mins = 75 mins playtime)\nBluetooth v5.2 with instant wake & pair",
      specs: JSON.stringify({
        "Playback Time": "42 Hours Total",
        "Bluetooth Version": "v5.2",
        "Water Resistance": "IPX4",
        Driver: "8mm Dynamic Drivers",
        Warranty: "1 Year Manufacturer",
      }),
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
            isPrimary: true,
            displayOrder: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=800&q=80",
            isPrimary: false,
            displayOrder: 2,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "BOAT-AD141-BLK-C",
            title: "Color: Carbon Black",
            price: 999.0,
            mrp: 2990.0,
            stock: 180,
            attributes: JSON.stringify({ Color: "Carbon Black" }),
          },
          {
            sku: "BOAT-AD141-WHT-C",
            title: "Color: Pure White",
            price: 999.0,
            mrp: 2990.0,
            stock: 120,
            attributes: JSON.stringify({ Color: "Pure White" }),
          },
        ],
      },
    },
  });

  // Product 3: Pure Cotton Double Bedsheet
  const p3 = await prisma.product.create({
    data: {
      title: "GharShringar 100% Glace Cotton King Size Bedsheet with 2 Pillow Covers",
      slug: "gharshringar-glace-cotton-king-size-bedsheet",
      description: "Upgrade your bedroom aesthetics with this breathable 240 TC glazed cotton bedsheet with vibrant botanical sanganeri block print that does not fade after multiple washes.",
      categoryId: catHome.id,
      brandId: brandGhar.id,
      sellerId: seller3.id,
      status: "APPROVED",
      basePrice: 449.0,
      mrp: 1299.0,
      discountPercent: 65.0,
      taxRate: 12.0,
      isFeatured: false,
      isBestSeller: true,
      isUnder499: true,
      rating: 4.5,
      reviewCount: 420,
      totalSold: 2100,
      returnPolicyDays: 7,
      sku: "GS-BED-099",
      stock: 95,
      highlights: "King Size (90 x 100 inches)\nIncludes 2 matching zipper pillow covers\nColor-fast anti-shrink fabric\nSoft touch breathable weave",
      specs: JSON.stringify({
        Material: "Glace Cotton",
        "Thread Count": "240 TC",
        Dimensions: "90 x 100 inches",
        "Care Instructions": "Machine wash cold",
      }),
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
            isPrimary: true,
            displayOrder: 1,
          },
        ],
      },
    },
  });

  // Product 4: Under ₹199 - Oxidised Jhumka Earrings
  const p4 = await prisma.product.create({
    data: {
      title: "Traditional German Silver Oxidised Tribal Kashmiri Jhumka Earrings",
      slug: "traditional-german-silver-oxidised-jhumka",
      description: "Stunning vintage mirror work dangling Afghani tribal earrings. Lightweight, skin friendly and nickel free for all-day comfort.",
      categoryId: catBudget199.id,
      sellerId: seller1.id,
      status: "APPROVED",
      basePrice: 149.0,
      mrp: 499.0,
      discountPercent: 70.0,
      taxRate: 5.0,
      isFeatured: true,
      isUnder199: true,
      rating: 4.9,
      reviewCount: 950,
      totalSold: 4100,
      returnPolicyDays: 7,
      sku: "DV-JHUMKA-149",
      stock: 250,
      highlights: "Rust-resistant German silver finish\nLightweight antique design\nComfortable fishhook closure",
      specs: JSON.stringify({
        Type: "Dangler Jhumkas",
        Material: "Oxidised Alloy",
        Weight: "22 grams",
      }),
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            isPrimary: true,
            displayOrder: 1,
          },
        ],
      },
    },
  });

  // Product 5: Under ₹199 - Cable Protector & Organizer Set
  const p5 = await prisma.product.create({
    data: {
      title: "Spiral Cable Protector 6-Pack with Silicone Cable Tie Cord Organizers",
      slug: "spiral-cable-protector-6-pack",
      description: "Prevent lightning and Type-C cables from breaking at the joints. Flexible durable silicone sleeves with cute cartoon cable clips.",
      categoryId: catBudget199.id,
      sellerId: seller2.id,
      status: "APPROVED",
      basePrice: 99.0,
      mrp: 299.0,
      discountPercent: 67.0,
      taxRate: 18.0,
      isFeatured: false,
      isUnder199: true,
      rating: 4.4,
      reviewCount: 190,
      totalSold: 1100,
      returnPolicyDays: 7,
      sku: "BE-CABLE-099",
      stock: 400,
      highlights: "Prolongs phone charging cable lifespan\nUniversal fit for Apple & Android cables\nNon-toxic tear-resistant silicone",
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
            isPrimary: true,
            displayOrder: 1,
          },
        ],
      },
    },
  });

  // Product 6: Under ₹499 - Stainless Steel Spice Jar Set
  const p6 = await prisma.product.create({
    data: {
      title: "Airtight Transparent Window Stainless Steel Spice Canister Set (4 Pcs)",
      slug: "airtight-window-steel-spice-canister-set",
      description: "Food grade rust-free stainless steel spice containers with clear acrylic viewing window. Rotating lids with pour and sprinkle holes.",
      categoryId: catBudget499.id,
      sellerId: seller3.id,
      status: "APPROVED",
      basePrice: 389.0,
      mrp: 999.0,
      discountPercent: 61.0,
      taxRate: 12.0,
      isFeatured: true,
      isUnder499: true,
      rating: 4.6,
      reviewCount: 310,
      totalSold: 1450,
      returnPolicyDays: 7,
      sku: "GS-SPICE-389",
      stock: 80,
      highlights: "Food Grade 304 Stainless Steel\nClear visual see-through window\nRotating 3-way dispenser cap\nCapacity: 250ml per jar",
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
            isPrimary: true,
            displayOrder: 1,
          },
        ],
      },
    },
  });

  // Product 7: Noise ColorFit Pulse Smartwatch
  const p7 = await prisma.product.create({
    data: {
      title: "Noise ColorFit Pulse Grand 1.69\" HD Display Smart Watch with 60 Sports Modes",
      slug: "noise-colorfit-pulse-grand-smartwatch",
      description: "Stay fit in style. Features vibrant 1.69-inch color LCD display, 24/7 heart rate and SpO2 blood oxygen tracking, 150+ customizable watch faces, and 7-day battery life.",
      categoryId: catElectronics.id,
      brandId: brandNoise.id,
      sellerId: seller2.id,
      status: "APPROVED",
      basePrice: 1299.0,
      mrp: 3999.0,
      discountPercent: 68.0,
      taxRate: 18.0,
      isFeatured: true,
      isBestSeller: true,
      rating: 4.7,
      reviewCount: 2200,
      totalSold: 11000,
      returnPolicyDays: 7,
      sku: "NOISE-CF-PULSE",
      stock: 210,
      highlights: "1.69\" LCD full touch display\nIP68 waterproof rating\nContinuous Heart Rate & SpO2\nCall vibration and notification alerts",
      specs: JSON.stringify({
        Display: "1.69 inch HD Curved Glass",
        Battery: "Up to 7 days standby",
        Sensors: "Optical Heart Rate, SpO2, Accelerometer",
        Compatibility: "Android 5.0+ and iOS 10.0+",
      }),
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
            isPrimary: true,
            displayOrder: 1,
          },
        ],
      },
    },
  });

  // Stock movements
  await prisma.stockMovement.create({
    data: {
      warehouseId: whDelhi.id,
      productId: p1.id,
      changeQty: 150,
      reason: "PURCHASE",
      referenceType: "INITIAL_STOCK",
    },
  });

  // 6. Verified Reviews
  console.log("⭐ Creating Reviews...");
  await prisma.review.create({
    data: {
      productId: p1.id,
      userId: customer1.id,
      rating: 5,
      title: "Stunning fitting and very comfortable cotton!",
      comment: "The embroidery is top notch, looks even better in real life than photos. Very soft pure cotton and true to size! Received in 2 days in Delhi.",
      isVerifiedPurchase: true,
      status: "APPROVED",
      helpfulVotes: 19,
    },
  });

  await prisma.review.create({
    data: {
      productId: p2.id,
      userId: customer2.id,
      rating: 5,
      title: "Best TWS under 1000 INR!",
      comment: "Heavy punchy bass and call quality in traffic is impressive. Battery easily lasted 4 days of daily office commute.",
      isVerifiedPurchase: true,
      status: "APPROVED",
      helpfulVotes: 32,
    },
  });

  // 7. Active Coupons
  console.log("🏷️ Creating Coupons...");
  await prisma.coupon.create({
    data: {
      code: "WELCOME100",
      description: "Flat ₹100 Off on your first order above ₹499",
      discountType: "FIXED",
      discountValue: 100.0,
      minOrderValue: 499.0,
      usageLimit: 5000,
      perUserLimit: 1,
      startDate: new Date(),
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: "MOJI15",
      description: "15% discount on all festive apparel & home decor",
      discountType: "PERCENTAGE",
      discountValue: 15.0,
      minOrderValue: 799.0,
      maxDiscount: 300.0,
      usageLimit: 2000,
      perUserLimit: 2,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  // 8. Sample Customer Orders
  console.log("📦 Creating Sample Customer Orders...");
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "MOJI-2026-89410",
      customerId: customer1.id,
      totalAmount: 699.0,
      subtotal: 699.0,
      discountAmount: 0.0,
      shippingFee: 0.0,
      taxAmount: 33.28,
      paymentMethod: "RAZORPAY",
      paymentStatus: "PAID",
      orderStatus: "DELIVERED",
      deliveryAddress: JSON.stringify({
        fullName: "Priya Sharma",
        phone: "+919988776655",
        pincode: "110001",
        addressLine1: "Flat 402, Lotus Greens, Barakhamba Road",
        city: "New Delhi",
        state: "Delhi",
      }),
      shippingCarrier: "Delhivery Express",
      trackingNumber: "DELH9847192841",
      estimatedDeliveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            sellerId: seller1.id,
            productId: p1.id,
            title: p1.title,
            price: 699.0,
            mrp: 1999.0,
            quantity: 1,
            total: 699.0,
            commissionAmount: 69.9,
            sellerPayout: 629.1,
            status: "DELIVERED",
          },
        ],
      },
      statusHistory: {
        create: [
          { fromStatus: "PENDING", toStatus: "CONFIRMED", comment: "Online payment verified via Razorpay" },
          { fromStatus: "CONFIRMED", toStatus: "PACKED", comment: "Packed and labeled at seller warehouse" },
          { fromStatus: "PACKED", toStatus: "SHIPPED", comment: "Handed over to Delhivery logistics" },
          { fromStatus: "SHIPPED", toStatus: "DELIVERED", comment: "Delivered to customer with OTP" },
        ],
      },
      payments: {
        create: [
          {
            transactionId: "pay_MOJI_Rzp9928172",
            provider: "RAZORPAY",
            amount: 699.0,
            currency: "INR",
            status: "PAID",
            idempotencyKey: "idemp_order1_001",
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: "MOJI-2026-91204",
      customerId: customer2.id,
      totalAmount: 999.0,
      subtotal: 999.0,
      discountAmount: 0.0,
      shippingFee: 0.0,
      taxAmount: 152.38,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      orderStatus: "SHIPPED",
      deliveryAddress: JSON.stringify({
        fullName: "Rahul Verma",
        phone: "+919812345678",
        pincode: "560034",
        addressLine1: "Villa 18, Palm Meadows, Koramangala 4th Block",
        city: "Bengaluru",
        state: "Karnataka",
      }),
      shippingCarrier: "BlueDart Express",
      trackingNumber: "BD992847110",
      estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            sellerId: seller2.id,
            productId: p2.id,
            title: p2.title,
            price: 999.0,
            mrp: 2990.0,
            quantity: 1,
            total: 999.0,
            commissionAmount: 84.91,
            sellerPayout: 914.09,
            status: "SHIPPED",
          },
        ],
      },
      statusHistory: {
        create: [
          { fromStatus: "PENDING", toStatus: "CONFIRMED", comment: "Cash on delivery order verified" },
          { fromStatus: "CONFIRMED", toStatus: "SHIPPED", comment: "In transit via BlueDart" },
        ],
      },
    },
  });

  // 9. Seller Settlements
  console.log("💰 Creating Seller Settlements...");
  await prisma.sellerSettlement.create({
    data: {
      sellerId: seller1.id,
      settlementNumber: "SETTL-2026-OCT-01",
      periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      periodEnd: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      grossSales: 154200.0,
      totalCommission: 15420.0,
      totalTaxTds: 1542.0,
      netPayout: 137238.0,
      status: "PAID",
      payoutDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      bankReference: "NEFT-HDFC-99281729",
    },
  });

  // 10. Support Tickets
  console.log("🎫 Creating Support Tickets...");
  await prisma.supportTicket.create({
    data: {
      ticketNumber: "TICK-2026-1001",
      customerId: customer1.id,
      orderId: order1.id,
      subject: "Query regarding fabric wash care for Kurtis",
      priority: "LOW",
      status: "RESOLVED",
      assignedStaffId: supportStaff.id,
      messages: {
        create: [
          {
            senderId: customer1.id,
            senderRole: "CUSTOMER",
            message: "Hi, can this embroidered kurti be washed in a standard washing machine or is dry cleaning recommended?",
          },
          {
            senderId: supportStaff.id,
            senderRole: "STAFF",
            message: "Hello Priya, gentle cold machine wash or hand wash with mild liquid detergent is completely safe. Avoid direct harsh sunlight drying to protect the vibrant dye.",
          },
        ],
      },
    },
  });

  // 11. Homepage CMS Banners & Sections
  console.log("🎨 Creating CMS Banners & Dynamic Homepage Sections...");
  await prisma.cMSBanner.createMany({
    data: [
      {
        title: "Grand Indian Festive Mahabachat Sale!",
        subtitle: "Up to 70% Off on Pure Cotton Kurtas, Sarees & Ethnic Sets",
        imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80",
        linkUrl: "/category/women-ethnic",
        tagText: "MEGA FESTIVE DEAL",
        displayOrder: 1,
        isActive: true,
      },
      {
        title: "Audio & Smart Gadget Carnival",
        subtitle: "Best Selling TWS Earbuds, Calling Smartwatches & Chargers from ₹99",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80",
        linkUrl: "/category/electronics",
        tagText: "MIN 50% OFF",
        displayOrder: 2,
        isActive: true,
      },
      {
        title: "Meesho-Style Direct-From-Manufacturer Deals",
        subtitle: "Unbeatable wholesale pricing with Zero Shipping Fee & Easy 7-Day Returns",
        imageUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1600&q=80",
        linkUrl: "/category/under-199",
        tagText: "UNDER ₹199 ZONE",
        displayOrder: 3,
        isActive: true,
      },
    ],
  });

  await prisma.homepageSection.createMany({
    data: [
      {
        sectionKey: "HERO_BANNER_SLIDER",
        title: "Festive Top Highlights",
        sectionType: "HERO_SLIDER",
        displayOrder: 1,
        isActive: true,
      },
      {
        sectionKey: "CATEGORY_ICONS_BAR",
        title: "Explore Popular Categories",
        sectionType: "CATEGORY_TILES",
        displayOrder: 2,
        isActive: true,
      },
      {
        sectionKey: "DEALS_OF_THE_DAY",
        title: "⚡ Lightning Deals of the Day",
        subtitle: "Special limited-period discounts ending tonight",
        sectionType: "DEALS_GRID",
        displayOrder: 3,
        isActive: true,
      },
      {
        sectionKey: "UNDER_199_BUDGET_ZONE",
        title: "🏷️ Under ₹199 Super Budget Zone",
        subtitle: "Direct factory pricing with free delivery",
        sectionType: "BUDGET_ZONE",
        displayOrder: 4,
        isActive: true,
      },
      {
        sectionKey: "UNDER_499_BUDGET_ZONE",
        title: "🌟 Under ₹499 Best Seller Picks",
        subtitle: "High quality home decor, clothing and kitchen organizers",
        sectionType: "BUDGET_ZONE",
        displayOrder: 5,
        isActive: true,
      },
      {
        sectionKey: "BEST_SELLING_PRODUCTS",
        title: "🔥 Top Trending Products",
        subtitle: "Most ordered by over 50,000+ happy customers this week",
        sectionType: "BEST_SELLERS",
        displayOrder: 6,
        isActive: true,
      },
    ],
  });

  // 12. Global Marketplace Settings
  console.log("⚙️ Creating Global Marketplace Settings...");
  await prisma.globalSetting.createMany({
    data: [
      { key: "STORE_NAME", value: "Mojicart", description: "Marketplace brand name" },
      { key: "STORE_TAGLINE", value: "Bharat Ka Apna Marketplace - Quality Products at Wholesale Prices", description: "Store slogan" },
      { key: "SUPPORT_PHONE", value: "1800-200-6654", description: "Toll-free customer care number" },
      { key: "SUPPORT_EMAIL", value: "care@mojicart.in", description: "Customer care email" },
      { key: "DEFAULT_COMMISSION_RATE", value: "10.0", description: "Default platform commission percentage" },
      { key: "COD_ENABLED", value: "true", description: "Cash on delivery availability flag" },
      { key: "FREE_SHIPPING_THRESHOLD", value: "499.0", description: "Minimum cart value for automatic free shipping" },
      { key: "STANDARD_SHIPPING_FEE", value: "49.0", description: "Delivery fee when cart is below free shipping threshold" },
      { key: "RETURN_WINDOW_DAYS", value: "7", description: "Default return window in days" },
    ],
  });

  console.log("✅ Seed completed successfully!");
  console.log(`
  ═════════════════════════════════════════════════════════════════════════
  🎉 MOJICART SEEDED CREDENTIALS:
  ─────────────────────────────────────────────────────────────────────────
  👑 Super Admin:       admin@mojicart.com        (Password: admin123)
  🏷️  Catalog Manager:   catalog@mojicart.com      (Password: password123)
  📦 Order Manager:     orders@mojicart.com       (Password: password123)
  🎧 Support Staff:     support@mojicart.com      (Password: password123)
  🏪 Seller 1 (Ethnic): seller1@desivogue.in      (Password: password123)
  🏪 Seller 2 (Gadgets):seller2@bharatelec.in     (Password: password123)
  🏪 Seller 3 (Home):   seller3@gharshringar.in   (Password: password123)
  🛍️ Customer (Priya):  priya@gmail.com           (Password: password123)
  🛍️ Customer (Rahul):  rahul@gmail.com           (Password: password123)
  ═════════════════════════════════════════════════════════════════════════
  `);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
