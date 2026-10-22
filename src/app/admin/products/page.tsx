"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Star,
  Sparkles,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  AlertTriangle,
  Flame,
  Download,
  Edit2,
  ExternalLink,
  Tag,
  Save,
  Image as ImageIcon,
  Upload,
  Trash2,
  EyeOff,
  Loader2,
} from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  // Multi-select & Batch Actions State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    isBulk: boolean;
    productId?: string;
    productTitle?: string;
    count?: number;
  } | null>(null);

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editBasePrice, setEditBasePrice] = useState("");
  const [editMrp, setEditMrp] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("APPROVED");
  const [editSourceUrl, setEditSourceUrl] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.allCategories || []))
      .catch((err) => console.error(err));
  }, []);

  const fetchProducts = async (status = filterStatus) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/products?limit=100&status=${status}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(filterStatus);
  }, [filterStatus]);

  const handleUpdateStatus = async (productId: string, status: string, reason?: string) => {
    try {
      const res = await fetch(`/api/v1/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejectionReason: reason }),
      });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSingle = async (productId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/products/${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setToastMessage("Product deleted successfully.");
        setTimeout(() => setToastMessage(null), 5000);
        setSelectedIds((prev) => prev.filter((id) => id !== productId));
        fetchProducts();
      } else {
        alert(data.error || "Failed to delete product");
      }
    } catch (err: any) {
      alert("Error deleting product: " + err.message);
    } finally {
      setLoading(false);
      setDeleteConfirmModal(null);
    }
  };

  const executeBulkAction = async (action: "APPROVE" | "UNPUBLISH" | "DELETE") => {
    if (selectedIds.length === 0) return;
    setBulkProcessing(true);
    try {
      const res = await fetch("/api/v1/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          productIds: selectedIds,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setToastMessage(data.message || `Bulk ${action.toLowerCase()} completed.`);
        setTimeout(() => setToastMessage(null), 5000);
        setSelectedIds([]);
        fetchProducts();
      } else {
        alert(data.error || `Failed to ${action.toLowerCase()} selected products`);
      }
    } catch (err: any) {
      alert("Bulk action error: " + err.message);
    } finally {
      setBulkProcessing(false);
      setDeleteConfirmModal(null);
    }
  };

  const handleToggleBadge = async (productId: string, field: "isFeatured" | "isBestSeller", currentValue: boolean) => {
    try {
      const res = await fetch(`/api/v1/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !currentValue }),
      });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setEditTitle(p.title || "");
    setEditCategoryId(p.categoryId || "");
    setEditBasePrice(String(p.basePrice || ""));
    setEditMrp(String(p.mrp || ""));
    setEditStock(String(p.stock || "0"));
    setEditDescription(p.description || "");
    setEditStatus(p.status || "APPROVED");
    setEditSourceUrl(p.sourceUrl || "");
    setEditImages((p.images || []).map((img: any) => (typeof img === "string" ? img : img.url)));
    setNewImageUrl("");
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setEditImages([...editImages, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const handleUploadImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/v1/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setEditImages((prev) => [...prev, data.url]);
      } else {
        alert(data.error || "Failed to upload image");
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/v1/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          basePrice: parseFloat(editBasePrice),
          mrp: parseFloat(editMrp),
          stock: parseInt(editStock),
          description: editDescription,
          status: editStatus,
          categoryId: editCategoryId || undefined,
          sourceUrl: editSourceUrl || undefined,
          images: editImages,
        }),
      });
      if (res.ok) {
        setEditingProduct(null);
        setToastMessage("Product updated successfully! New price, category, images, and content are now live on the storefront.");
        setTimeout(() => setToastMessage(null), 5000);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEdit(false);
    }
  };

  const filtered = products.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const allVisibleIds = filtered.map((p) => p.id);
  const isAllSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));
  const isSomeSelected = allVisibleIds.some((id) => selectedIds.includes(id)) && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allVisibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {toastMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Product Catalog Moderation & Quality Control
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Approve seller listings, audit imported products, and control publication status
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/imports/meesho"
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Import from Meesho</span>
          </Link>

          {/* Filter Bar */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search title or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Selected Items Quick Actions Banner */}
      {selectedIds.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-200 px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-semibold">
              <strong className="text-white">{selectedIds.length}</strong> products selected for catalog batch action
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              disabled={bulkProcessing}
              onClick={() => executeBulkAction("APPROVE")}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-3 py-1 rounded-lg flex items-center gap-1 transition shadow-sm"
            >
              <Check className="w-3.5 h-3.5" /> Approve Selected
            </button>
            <button
              disabled={bulkProcessing}
              onClick={() => executeBulkAction("UNPUBLISH")}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-amber-300 font-bold px-3 py-1 rounded-lg flex items-center gap-1 border border-amber-500/20 transition shadow-sm"
            >
              <EyeOff className="w-3.5 h-3.5" /> Unpublish Selected
            </button>
            <button
              disabled={bulkProcessing}
              onClick={() =>
                setDeleteConfirmModal({
                  isOpen: true,
                  isBulk: true,
                  count: selectedIds.length,
                })
              }
              className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold px-3 py-1 rounded-lg flex items-center gap-1 transition shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-slate-400 hover:text-white font-medium px-2 py-1 transition"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500 cursor-pointer accent-rose-600"
                    title={isAllSelected ? "Deselect all visible" : "Select all visible"}
                  />
                </th>
                <th className="p-4">Product</th>
                <th className="p-4">Category & SKU</th>
                <th className="p-4">Price / MRP</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Promotional Badges</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Loading products...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    No products matching your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr
                    key={prod.id}
                    className={`hover:bg-slate-900/50 transition ${
                      selectedIds.includes(prod.id) ? "bg-rose-950/20" : ""
                    }`}
                  >
                    <td className="p-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(prod.id)}
                        onChange={() => toggleSelect(prod.id)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500 cursor-pointer accent-rose-600"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {prod.images && prod.images[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={prod.images[0].url}
                            alt={prod.title}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-800 shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white max-w-xs line-clamp-1">
                              {prod.title}
                            </span>
                            {prod.importSource === "MEESHO" && (
                              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-black px-1.5 py-0.2 rounded shrink-0">
                                MEESHO
                              </span>
                            )}
                          </div>
                          {prod.seller?.storeName && (
                            <span className="text-[10px] text-amber-400 block font-medium">
                              Seller: {prod.seller.storeName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-slate-300 block">
                        {prod.category?.name || "Uncategorized"}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">{prod.sku}</span>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-white">₹{prod.basePrice.toFixed(0)}</span>
                      <span className="text-slate-500 text-[11px] ml-1.5 line-through">
                        ₹{prod.mrp.toFixed(0)}
                      </span>
                      {prod.discountPercent > 0 && (
                        <span className="text-emerald-400 text-[10px] block font-bold">
                          {prod.discountPercent}% OFF
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-bold text-slate-300">{prod.stock} units</td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleBadge(prod.id, "isFeatured", prod.isFeatured)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                            prod.isFeatured
                              ? "bg-amber-500 text-slate-950 font-black shadow"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                          title="Toggle Deals Spotlight"
                        >
                          Featured
                        </button>
                        <button
                          onClick={() => handleToggleBadge(prod.id, "isBestSeller", prod.isBestSeller)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                            prod.isBestSeller
                              ? "bg-rose-600 text-white font-black shadow"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                          title="Toggle Best Seller Badge"
                        >
                          BestSeller
                        </button>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          prod.status === "APPROVED"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : prod.status === "DRAFT"
                            ? "bg-slate-800 text-slate-300"
                            : prod.status === "PENDING_APPROVAL"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {prod.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-2 py-1 rounded-lg text-xs transition flex items-center gap-1"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        {prod.status !== "APPROVED" && (
                          <button
                            onClick={() => handleUpdateStatus(prod.id, "APPROVED")}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-lg text-xs transition flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                        )}
                        {prod.status === "APPROVED" && (
                          <button
                            onClick={() => handleUpdateStatus(prod.id, "DRAFT")}
                            className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-2.5 py-1 rounded-lg text-xs transition flex items-center gap-1 border border-amber-500/20"
                            title="Unpublish to draft"
                          >
                            <EyeOff className="w-3 h-3 text-amber-400" />
                            <span>Unpublish</span>
                          </button>
                        )}

                        <button
                          onClick={() =>
                            setDeleteConfirmModal({
                              isOpen: true,
                              isBulk: false,
                              productId: prod.id,
                              productTitle: prod.title,
                            })
                          }
                          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 font-bold px-2 py-1 rounded-lg text-xs transition flex items-center gap-1"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-in zoom-in-95 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-base text-white">Edit Product</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">SKU: {editingProduct.sku}</p>
              </div>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-amber-400 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editBasePrice}
                    onChange={(e) => setEditBasePrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">MRP (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editMrp}
                    onChange={(e) => setEditMrp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Target Category</label>
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none"
                  >
                    <option value="">Keep Current / Uncategorized</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Publication Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-bold focus:outline-none"
                  >
                    <option value="APPROVED">Approved (Visible on Storefront)</option>
                    <option value="DRAFT">Draft (Hidden from Storefront)</option>
                    <option value="PENDING_APPROVAL">Pending Approval</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Storefront Link</label>
                  <Link
                    href={`/product/${editingProduct.slug || editingProduct.id}`}
                    target="_blank"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-rose-400 hover:text-white flex items-center justify-between transition group h-[38px]"
                  >
                    <span className="truncate text-xs font-semibold">View Live Product Page</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1.5 text-rose-400 group-hover:text-white" />
                  </Link>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-300">Meesho Original Link</label>
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded">
                      Admin Only
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="url"
                      value={editSourceUrl}
                      onChange={(e) => setEditSourceUrl(e.target.value)}
                      placeholder="https://www.meesho.com/..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500 h-[38px]"
                    />
                    {(editSourceUrl || editingProduct.sourceUrl) && (
                      <a
                        href={editSourceUrl || editingProduct.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-pink-950/40 hover:bg-pink-900/60 border border-pink-500/40 text-pink-300 hover:text-white px-2.5 rounded-lg shrink-0 transition flex items-center justify-center h-[38px]"
                        title="Open Meesho listing in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              {/* Product Images Gallery */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block font-bold text-slate-300">Product Images ({editImages.length})</label>
                  <span className="text-[10px] text-slate-500">First image is primary thumbnail</span>
                </div>
                {editImages.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-1 bg-slate-950 p-2 rounded-lg border border-slate-800">
                    {editImages.map((img, idx) => (
                      <div key={idx} className="relative group w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-slate-700 bg-black">
                        <img src={img} alt="preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setEditImages(editImages.filter((_, i) => i !== idx))}
                          className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition"
                          title="Remove image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add image URL..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                  >
                    Add
                  </button>
                  <label className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 text-xs">
                    <Upload className="w-3.5 h-3.5 text-rose-400" />
                    <span>{uploadingImage ? "Uploading..." : "Upload"}</span>
                    <input type="file" accept="image/*" disabled={uploadingImage} onChange={handleUploadImageFile} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border border-slate-800 rounded-lg text-slate-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-5 py-2 rounded-lg flex items-center gap-1.5 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingEdit ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl rounded-2xl px-5 py-3.5 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-5 text-xs text-white max-w-2xl w-[92%] sm:w-auto">
          <div className="flex items-center gap-2 border-r border-slate-700 pr-3">
            <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black flex items-center justify-center text-[11px]">
              {selectedIds.length}
            </span>
            <span className="font-bold text-slate-200 hidden sm:inline">
              Selected
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={bulkProcessing}
              onClick={() => executeBulkAction("APPROVE")}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
              title="Approve selected products"
            >
              {bulkProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>Approve ({selectedIds.length})</span>
            </button>

            <button
              type="button"
              disabled={bulkProcessing}
              onClick={() => executeBulkAction("UNPUBLISH")}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-amber-300 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 border border-amber-500/20 shadow-sm"
              title="Unpublish selected products"
            >
              {bulkProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
              <span>Unpublish ({selectedIds.length})</span>
            </button>

            <button
              type="button"
              disabled={bulkProcessing}
              onClick={() =>
                setDeleteConfirmModal({
                  isOpen: true,
                  isBulk: true,
                  count: selectedIds.length,
                })
              }
              className="bg-rose-600/20 hover:bg-rose-600/30 disabled:opacity-50 text-rose-300 hover:text-white border border-rose-500/40 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
              title="Delete selected products"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Delete ({selectedIds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 transition flex items-center gap-1"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Deselect</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 text-xs">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">
                  {deleteConfirmModal.isBulk
                    ? `Delete ${deleteConfirmModal.count} Products?`
                    : "Delete Product?"}
                </h3>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  {deleteConfirmModal.isBulk
                    ? `Are you sure you want to permanently delete these ${deleteConfirmModal.count} selected products? This will remove them from the store catalog.`
                    : `Are you sure you want to delete "${deleteConfirmModal.productTitle || "this product"}"? This will remove it from the store catalog.`}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(null)}
                className="px-4 py-2 border border-slate-800 rounded-xl text-slate-400 font-semibold hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading || bulkProcessing}
                onClick={() => {
                  if (deleteConfirmModal.isBulk) {
                    executeBulkAction("DELETE");
                  } else if (deleteConfirmModal.productId) {
                    handleDeleteSingle(deleteConfirmModal.productId);
                  }
                }}
                className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow"
              >
                {loading || bulkProcessing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
