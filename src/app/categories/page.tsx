import Link from "next/link";
import prisma from "@/lib/prisma";
import { Tag, ChevronRight } from "lucide-react";

export default async function CategoriesPage() {
  const rootCategories = await prisma.category.findMany({
    where: { isActive: true, level: 1 },
    include: {
      children: {
        where: { isActive: true },
        include: {
          _count: { select: { products: true } },
        },
      },
      _count: { select: { products: true } },
    },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          All Shopping Categories
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Browse Indian apparel, gadgets, home essentials & budget zones
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rootCategories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                  <Tag className="w-6 h-6" />
                </div>
                <div>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="font-black text-base text-slate-900 hover:text-amber-600 transition"
                  >
                    {cat.name}
                  </Link>
                  <p className="text-xs text-slate-400">
                    {cat._count.products > 0
                      ? `${cat._count.products} products available`
                      : "Products coming soon"}
                  </p>
                </div>
              </div>

              {/* Subcategories list */}
              {cat.children && cat.children.length > 0 && (
                <div className="mt-4 space-y-2">
                  {cat.children.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/category/${sub.slug}`}
                      className="flex items-center justify-between text-xs text-slate-600 hover:text-amber-600 hover:bg-slate-50 p-2 rounded-lg transition"
                    >
                      <span className="font-medium">{sub.name}</span>
                      <div className="flex items-center gap-1 text-slate-400">
                        <span>
                          {sub._count.products > 0
                            ? `(${sub._count.products})`
                            : "(Coming soon)"}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100">
              <Link
                href={`/category/${cat.slug}`}
                className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
              >
                Browse all in {cat.name} <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
