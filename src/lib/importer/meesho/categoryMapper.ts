import prisma from "@/lib/prisma";

export interface CategoryMatch {
  categoryId: string;
  categoryName: string;
  parentName?: string;
  confidence: number; // 0 to 1
  reason: string;
}

/**
 * Intelligent category resolution and suggestion for Meesho products
 */
export async function suggestCategory(
  categoryHint: {
    name?: string;
    subCategory?: string;
    hierarchy?: string[];
  },
  productTitle: string
): Promise<CategoryMatch | null> {
  const allCategories = await prisma.category.findMany({
    where: { isActive: true },
    include: { parent: true },
  });

  if (allCategories.length === 0) return null;

  const hintStrings = [
    categoryHint.subCategory || "",
    categoryHint.name || "",
    ...(categoryHint.hierarchy || []),
    productTitle,
  ]
    .map((s) => s.toLowerCase().trim())
    .filter(Boolean);

  let bestMatch: CategoryMatch | null = null;
  let highestScore = 0;

  for (const cat of allCategories) {
    const catName = cat.name.toLowerCase();
    const parentName = cat.parent ? cat.parent.name.toLowerCase() : "";

    let score = 0;
    let matchReason = "";

    // 1. Direct exact subcategory match (highest confidence)
    if (categoryHint.subCategory && catName === categoryHint.subCategory.toLowerCase()) {
      score = 0.95;
      matchReason = `Exact match for subcategory "${categoryHint.subCategory}"`;
    }
    // 2. Exact category name match
    else if (categoryHint.name && catName === categoryHint.name.toLowerCase()) {
      score = 0.85;
      matchReason = `Exact match for category "${categoryHint.name}"`;
    }
    // 3. Hierarchy match
    else if (
      categoryHint.hierarchy?.some((h) => h.toLowerCase() === catName)
    ) {
      score = 0.8;
      matchReason = `Matched hierarchy keyword in "${cat.name}"`;
    }
    // 4. Keyword / Substring match in title or hint
    else {
      // Common e-commerce mappings:
      const keywords = catName.split(/[\s,&/-]+/).filter((k) => k.length > 2);
      let matchedCount = 0;

      for (const kw of keywords) {
        if (hintStrings.some((h) => h.includes(kw))) {
          matchedCount++;
        }
      }

      if (matchedCount > 0) {
        score = Math.min(0.75, 0.4 + matchedCount * 0.15);
        matchReason = `Partial keyword match with "${cat.name}"`;
      }
    }

    // Boost score if child category matches specific terms (e.g. Kurtis > Women Ethnic)
    if (cat.parentId && score > 0) {
      score += 0.05;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = {
        categoryId: cat.id,
        categoryName: cat.name,
        parentName: cat.parent?.name,
        confidence: Math.min(1, Math.round(score * 100) / 100),
        reason: matchReason,
      };
    }
  }

  // Fallback to top-level first category if no specific match
  if (!bestMatch || highestScore < 0.2) {
    const defaultCat = allCategories.find((c) => !c.parentId) || allCategories[0];
    return {
      categoryId: defaultCat.id,
      categoryName: defaultCat.name,
      parentName: defaultCat.parent?.name,
      confidence: 0.1,
      reason: "Default category fallback (Please review and adjust)",
    };
  }

  return bestMatch;
}
