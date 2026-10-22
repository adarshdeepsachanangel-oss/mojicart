import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const updates = [
  {
    idMatch: "7gigh9",
    title: "Gold Plated Fancy Jhumka Earrings for Women (Set of 6) Traditional Oxidised Gold Combo",
    slug: "gold-plated-fancy-jhumka-earrings-set-of-6-traditional-oxidised-gold",
    price: 299,
    mrp: 699,
    images: [
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1629224316810-9d8805b95e76?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Set of 6 traditional ethnic gold-plated jhumka earrings for women. Beautiful craftsmanship with intricate filigree peacock work, suitable for festivals, weddings, and parties.",
    specs: {
      "Brand": "DesiVogue Ethnic Apparels",
      "Type": "Jhumka Earrings Combo",
      "Plating": "Gold Plated",
      "Occasion": "Ethnic & Festive",
      "Net Quantity (N)": "6 Pairs",
      "Country of Origin": "India"
    }
  },
  {
    idMatch: "imuzp7",
    title: "Red Bridal Bangles Set for Women with Golden Floral Stone Work and Hanging Pearl Details",
    slug: "red-bridal-bangles-set-for-women-with-golden-floral-stone-work",
    price: 349,
    mrp: 799,
    images: [
      "https://images.unsplash.com/photo-1611591475155-428482329957?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Traditional bridal red chuda bangles set with golden floral stone work and hanging latkan pearl details. High quality velvet interior rim for skin-friendly comfortable wear.",
    specs: {
      "Brand": "DesiVogue Ethnic Apparels",
      "Type": "Bridal Bangles Set",
      "Base Material": "Acrylic & Brass",
      "Color": "Red & Gold",
      "Occasion": "Bridal & Wedding",
      "Country of Origin": "India"
    }
  },
  {
    idMatch: "7rydx2",
    title: "Stunning Oxidized Silver Jhumkas with Vibrant Red Green & Pink Hues Festive Combo",
    slug: "stunning-oxidized-silver-jhumkas-with-vibrant-hues",
    price: 279,
    mrp: 599,
    images: [
      "https://images.unsplash.com/photo-1629224316810-9d8805b95e76?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Stunning antique German oxidised silver jhumkas accented with vibrant red, green, and pink Meenakari work. Beautiful musical ghungroos add festive charm.",
    specs: {
      "Brand": "DesiVogue Ethnic Apparels",
      "Type": "Oxidized Jhumka Earrings",
      "Plating": "Oxidised Silver",
      "Occasion": "Navratri, Diwali & Festive",
      "Country of Origin": "India"
    }
  },
  {
    idMatch: "8rwisq",
    title: "Fancy Traditional Festive Earrings & Studs Combo Set",
    slug: "fancy-traditional-festive-earrings-studs-combo-set",
    price: 229,
    mrp: 499,
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1629224316810-9d8805b95e76?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Assorted fancy earrings and studs combo set for girls and women. High shine gold polish studded with premium crystal stones for everyday elegance and festive charm.",
    specs: {
      "Brand": "DesiVogue Ethnic Apparels",
      "Type": "Earrings & Studs",
      "Plating": "Gold Plated",
      "Occasion": "Daily & Festive",
      "Country of Origin": "India"
    }
  }
];

async function main() {
  const jewelleryCategory = await prisma.category.findFirst({
    where: { name: { contains: "jewel" } }
  });

  if (!jewelleryCategory) {
    console.error("Jewellery category not found!");
    return;
  }

  for (const item of updates) {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { title: { contains: item.idMatch } },
          { slug: { contains: item.idMatch } },
          { sku: { contains: item.idMatch.toUpperCase() } }
        ]
      }
    });

    if (product) {
      console.log(`Updating product: ${product.id} (${item.title})`);
      const discountPercent = Math.round(((item.mrp - item.price) / item.mrp) * 100);

      await prisma.product.update({
        where: { id: product.id },
        data: {
          title: item.title,
          slug: item.slug,
          basePrice: item.price,
          mrp: item.mrp,
          discountPercent,
          categoryId: jewelleryCategory.id,
          description: item.description,
          specs: JSON.stringify(item.specs),
          isUnder499: item.price <= 499,
          isUnder199: item.price <= 199,
        }
      });

      // Update images
      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      for (let i = 0; i < item.images.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: item.images[i],
            isPrimary: i === 0,
            displayOrder: i
          }
        });
      }

      // Update variants
      await prisma.productVariant.updateMany({
        where: { productId: product.id },
        data: {
          price: item.price,
          mrp: item.mrp
        }
      });

      // Update importItem record
      await prisma.importItem.updateMany({
        where: {
          OR: [
            { sourceProductId: item.idMatch },
            { productId: product.id }
          ]
        },
        data: {
          title: item.title,
          sourcePrice: item.price,
          sourceMrp: item.mrp,
          imagesFound: item.images.length,
          imagesDownloaded: item.images.length
        }
      });
      console.log(`SUCCESS: Product ${item.idMatch} updated!`);
    } else {
      console.log(`Product with idMatch ${item.idMatch} not found`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
