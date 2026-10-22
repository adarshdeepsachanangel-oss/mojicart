"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Download,
  Package,
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  X,
  ExternalLink,
  ChevronRight,
  Upload,
  FileText,
  Trash2,
  MoveLeft,
  MoveRight,
  Eye,
  Check,
  AlertTriangle,
  ArrowRight,
  Database,
  Tag,
  TrendingUp,
  Image as ImageIcon,
  StopCircle,
  Pencil,
  Save,
  Edit2,
  Percent,
  Plus,
} from "lucide-react";

export default function MeeshoImporterPage() {
  const [activeTab, setActiveTab] = useState<"single" | "bulk" | "history">("single");

  // Categories list
  const [categories, setCategories] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/v1/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.allCategories || []))
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  // Apify Token config state
  const [apifyTokenState, setApifyTokenState] = useState<{
    hasToken: boolean;
    maskedToken: string;
  }>({ hasToken: false, maskedToken: "" });
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [inputToken, setInputToken] = useState("");
  const [savingToken, setSavingToken] = useState(false);
  const [tokenMsg, setTokenMsg] = useState<string | null>(null);

  const fetchApifyConfig = async () => {
    try {
      const res = await fetch("/api/v1/admin/imports/meesho/config");
      if (res.ok) {
        const data = await res.json();
        setApifyTokenState({
          hasToken: data.hasToken,
          maskedToken: data.maskedToken,
        });
      }
    } catch (err) {
      console.error("Failed to load Apify config", err);
    }
  };

  useEffect(() => {
    fetchApifyConfig();
  }, []);

  const handleSaveApifyToken = async () => {
    setSavingToken(true);
    setTokenMsg(null);
    try {
      const res = await fetch("/api/v1/admin/imports/meesho/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: inputToken }),
      });
      const data = await res.json();
      if (res.ok) {
        setTokenMsg(data.message);
        setApifyTokenState({
          hasToken: data.hasToken,
          maskedToken: data.maskedToken,
        });
        setTimeout(() => setShowTokenModal(false), 1200);
      } else {
        setTokenMsg(data.error || "Failed to save token");
      }
    } catch (err: any) {
      setTokenMsg(err.message || "Failed to save token");
    } finally {
      setSavingToken(false);
    }
  };

  // -------------------------------------------------------------
  // TAB 1: SINGLE PRODUCT IMPORT STATE
  // -------------------------------------------------------------
  const [singleUrl, setSingleUrl] = useState("");
  const [fetchingSingle, setFetchingSingle] = useState(false);
  const [singleError, setSingleError] = useState<string | null>(null);
  const [extractedProduct, setExtractedProduct] = useState<any | null>(null);
  const [suggestedCategory, setSuggestedCategory] = useState<any | null>(null);
  const [duplicateInfo, setDuplicateInfo] = useState<any | null>(null);

  // Editable Form fields
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formHighlights, setFormHighlights] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formSellingPrice, setFormSellingPrice] = useState<number | string>("");
  const [formMrp, setFormMrp] = useState<number | string>("");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formSpecs, setFormSpecs] = useState<{ key: string; value: string }[]>([]);
  const [formVariants, setFormVariants] = useState<
    Array<{
      sku?: string;
      title: string;
      size?: string;
      price: number;
      mrp: number;
      stock: number;
      sourcePrice?: number;
      sourceMrp?: number;
    }>
  >([]);
  const [priceMarkupPercent, setPriceMarkupPercent] = useState<string>("20");
  const [allowUpdateDuplicate, setAllowUpdateDuplicate] = useState(true);
  const [savingSingle, setSavingSingle] = useState(false);
  const [saveSuccessResult, setSaveSuccessResult] = useState<any | null>(null);
  const [pasteHtmlMode, setPasteHtmlMode] = useState(false);
  const [rawHtmlText, setRawHtmlText] = useState("");
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);

  // Bookmarklet auto-import receiver
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const dataParam = params.get("meeshoData");
      if (dataParam) {
        try {
          const raw = JSON.parse(decodeURIComponent(dataParam));
          setFetchingSingle(true);
          fetch("/api/v1/admin/imports/meesho/preview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rawProduct: raw, url: raw.url }),
          })
            .then((r) => r.json())
            .then((data) => {
              if (data.product) {
                const prod = data.product;
                setExtractedProduct(prod);
                setSuggestedCategory(data.suggestedCategory);
                setDuplicateInfo(data.duplicate);
                setSingleUrl(raw.url || "");
                setFormTitle(prod.title || "");
                setFormSlug(prod.slug || "");
                setFormBrand(prod.brand || "");
                setFormDescription(prod.description || "");
                setFormHighlights((prod.highlights || []).join("\n"));
                setFormCategoryId(data.suggestedCategory?.categoryId || "");
                setFormSellingPrice(prod.pricing?.sourcePrice || 299);
                setFormMrp(prod.pricing?.sourceMrp || 499);
                setFormImages(prod.images || []);
                const specsArr = Object.entries(prod.specs || {}).map(([k, v]) => ({
                  key: k,
                  value: String(v),
                }));
                setFormSpecs(specsArr);

                if (Array.isArray(prod.variants) && prod.variants.length > 0) {
                  const baseProdPrice = prod.pricing?.sourcePrice || 299;
                  const baseProdMrp = prod.pricing?.sourceMrp || Math.round(baseProdPrice * 1.5);
                  setFormVariants(
                    prod.variants.map((v: any, idx: number) => {
                      const vPrice = v.price || baseProdPrice;
                      const vMrp = v.mrp && v.mrp > vPrice ? v.mrp : baseProdMrp;
                      const vSourcePrice = v.sourcePrice || vPrice;
                      const vSourceMrp = v.sourceMrp && v.sourceMrp > vSourcePrice ? v.sourceMrp : baseProdMrp;
                      return {
                        sku: v.sku || `${prod.slug || "item"}-${v.size || idx + 1}`,
                        title: v.title || v.size || `Option ${idx + 1}`,
                        size: v.size || "",
                        price: vPrice,
                        mrp: vMrp,
                        stock: v.stock ?? 50,
                        sourcePrice: vSourcePrice,
                        sourceMrp: vSourceMrp,
                      };
                    })
                  );
                } else {
                  setFormVariants([]);
                }
              }
            })
            .catch(console.error)
            .finally(() => setFetchingSingle(false));
        } catch (e) {
          console.error("Failed to parse bookmarklet payload:", e);
        }
      }
    }
  }, []);

  const handleFetchSingle = async (urlToFetch?: string) => {
    const targetUrl = (urlToFetch || singleUrl).trim();
    if (!targetUrl && !pasteHtmlMode) {
      setSingleError("Please enter a valid Meesho product URL.");
      return;
    }

    setFetchingSingle(true);
    setSingleError(null);
    setSaveSuccessResult(null);

    try {
      const payload: any = { url: targetUrl };
      if (pasteHtmlMode && rawHtmlText.trim()) {
        payload.html = rawHtmlText.trim();
      }

      const res = await fetch("/api/v1/admin/imports/meesho/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch product from Meesho");
      }

      const prod = data.product;
      setExtractedProduct(prod);
      setSuggestedCategory(data.suggestedCategory);
      setDuplicateInfo(data.duplicate);

      // Populate editable fields
      setFormTitle(prod.title || "");
      setFormSlug(prod.slug || "");
      setFormBrand(prod.brand || "");
      setFormDescription(prod.description || "");
      setFormHighlights((prod.highlights || []).join("\n"));
      setFormCategoryId(data.suggestedCategory?.categoryId || "");
      setFormSellingPrice(prod.pricing.sourcePrice || 299);
      setFormMrp(prod.pricing.sourceMrp || 499);
      setFormImages(prod.images || []);

      const specsArr = Object.entries(prod.specs || {}).map(([k, v]) => ({
        key: k,
        value: String(v),
      }));
      setFormSpecs(specsArr);

      if (Array.isArray(prod.variants) && prod.variants.length > 0) {
        const baseProdPrice = prod.pricing?.sourcePrice || 299;
        const baseProdMrp = prod.pricing?.sourceMrp || Math.round(baseProdPrice * 1.5);
        setFormVariants(
          prod.variants.map((v: any, idx: number) => {
            const vPrice = Number(v.price) > 0 ? Number(v.price) : baseProdPrice;
            const vSourcePrice = Number(v.sourcePrice) > 0 ? Number(v.sourcePrice) : vPrice;
            const vMrp = Number(v.mrp) > vPrice ? Number(v.mrp) : (baseProdMrp > vPrice ? Math.round(vPrice * (baseProdMrp / (baseProdPrice || 1))) : Math.round(vPrice * 1.5));
            const vSourceMrp = Number(v.sourceMrp) > vSourcePrice ? Number(v.sourceMrp) : vMrp;
            return {
              sku: v.sku || `${prod.slug || "item"}-${v.size || idx + 1}`,
              title: v.title || v.size || `Option ${idx + 1}`,
              size: v.size || "",
              price: vPrice,
              mrp: vMrp,
              stock: v.stock ?? 50,
              sourcePrice: vSourcePrice,
              sourceMrp: vSourceMrp,
            };
          })
        );
      } else {
        setFormVariants([]);
      }
    } catch (err: any) {
      console.error(err);
      setSingleError(err.message || "Failed to fetch Meesho product.");
    } finally {
      setFetchingSingle(false);
    }
  };

  // Adjust price of main product and all variations by percentage
  const handleApplyPercentagePriceAdjustment = (pctVal?: number) => {
    const pct = pctVal !== undefined ? pctVal : parseFloat(priceMarkupPercent);
    if (isNaN(pct)) return;

    const multiplier = 1 + pct / 100;

    // Recalculate main product selling price & MRP based on source prices
    const baseSourcePrice = extractedProduct?.pricing?.sourcePrice || Number(formSellingPrice) || 299;
    const baseSourceMrp =
      extractedProduct?.pricing?.sourceMrp ||
      (Number(formMrp) > Number(formSellingPrice)
        ? Math.round(Number(formMrp) / (1 + (parseFloat(priceMarkupPercent) || 0) / 100 || 1))
        : Math.round(baseSourcePrice * 1.5));
    
    const newMainSelling = Math.round(baseSourcePrice * multiplier);
    const newMainMrp = Math.round(baseSourceMrp * multiplier);

    setFormSellingPrice(newMainSelling);
    setFormMrp(newMainMrp);

    // Recalculate all variations - ensuring BOTH Selling Price and MRP are updated
    if (formVariants.length > 0) {
      setFormVariants((prev) =>
        prev.map((v) => {
          const vBasePrice = v.sourcePrice || v.price;
          const vBaseMrp =
            v.sourceMrp && v.sourceMrp > vBasePrice
              ? v.sourceMrp
              : baseSourceMrp > baseSourcePrice
              ? (vBasePrice === baseSourcePrice ? baseSourceMrp : Math.round(vBasePrice * (baseSourceMrp / (baseSourcePrice || 1))))
              : Math.round(vBasePrice * 1.5);

          return {
            ...v,
            price: Math.round(vBasePrice * multiplier),
            mrp: Math.round(vBaseMrp * multiplier),
          };
        })
      );
    }
  };

  const handleResetToSourcePrices = () => {
    if (!extractedProduct) return;
    const baseSourcePrice = extractedProduct.pricing?.sourcePrice || 299;
    const baseSourceMrp = extractedProduct.pricing?.sourceMrp || Math.round(baseSourcePrice * 1.5);
    setFormSellingPrice(baseSourcePrice);
    setFormMrp(baseSourceMrp);

    if (formVariants.length > 0) {
      setFormVariants((prev) =>
        prev.map((v) => {
          const vBasePrice = v.sourcePrice || baseSourcePrice;
          const vBaseMrp =
            v.sourceMrp && v.sourceMrp > vBasePrice
              ? v.sourceMrp
              : baseSourceMrp > baseSourcePrice
              ? (vBasePrice === baseSourcePrice ? baseSourceMrp : Math.round(vBasePrice * (baseSourceMrp / (baseSourcePrice || 1))))
              : Math.round(vBasePrice * 1.5);

          return {
            ...v,
            price: vBasePrice,
            mrp: vBaseMrp,
          };
        })
      );
    }
  };

  // Sync main MRP to all variations
  const handleSyncMrpToVariants = (targetMrp?: number | string) => {
    const newMrp = Number(targetMrp !== undefined ? targetMrp : formMrp);
    if (isNaN(newMrp) || newMrp <= 0) return;
    setFormVariants((prev) =>
      prev.map((v) => ({
        ...v,
        mrp: newMrp,
        sourceMrp: newMrp,
      }))
    );
  };

  // Sync main Selling Price to all variations
  const handleSyncPriceToVariants = (targetPrice?: number | string) => {
    const newPrice = Number(targetPrice !== undefined ? targetPrice : formSellingPrice);
    if (isNaN(newPrice) || newPrice <= 0) return;
    setFormVariants((prev) =>
      prev.map((v) => ({
        ...v,
        price: newPrice,
        sourcePrice: newPrice,
      }))
    );
  };

  // When user edits Mojicart Selling Price directly in the form
  const handleMainSellingPriceChange = (value: string) => {
    const oldPrice = Number(formSellingPrice);
    setFormSellingPrice(value);
    const numVal = Number(value);
    if (!isNaN(numVal) && numVal > 0 && formVariants.length > 0) {
      setFormVariants((prev) =>
        prev.map((v) => {
          if (!oldPrice || v.price === oldPrice) {
            return { ...v, price: numVal };
          }
          return v;
        })
      );
    }
  };

  // When user edits Mojicart MRP directly in the form
  const handleMainMrpChange = (value: string) => {
    const oldMrp = Number(formMrp);
    setFormMrp(value);
    const numVal = Number(value);
    if (!isNaN(numVal) && numVal > 0 && formVariants.length > 0) {
      setFormVariants((prev) =>
        prev.map((v) => {
          if (!oldMrp || v.mrp === oldMrp || v.mrp <= v.price) {
            return { ...v, mrp: numVal };
          }
          return v;
        })
      );
    }
  };

  const handleVariantChange = (
    index: number,
    field: "title" | "size" | "price" | "mrp" | "stock",
    value: any
  ) => {
    setFormVariants((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: field === "price" || field === "mrp" || field === "stock" ? Number(value) : value,
      };
      return copy;
    });
  };

  const handleRemoveVariant = (index: number) => {
    setFormVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    const basePrice = Number(formSellingPrice) || 299;
    const baseMrp = Number(formMrp) || Math.round(basePrice * 1.5);
    setFormVariants((prev) => [
      ...prev,
      {
        sku: `${formSlug || "variant"}-${prev.length + 1}`,
        title: `Size ${prev.length + 1}`,
        size: `V${prev.length + 1}`,
        price: basePrice,
        mrp: baseMrp,
        stock: 50,
        sourcePrice: basePrice,
        sourceMrp: baseMrp,
      },
    ]);
  };

  const handleSaveSingle = async (status: "DRAFT" | "APPROVED") => {
    if (!extractedProduct) return;
    setSavingSingle(true);
    setSingleError(null);

    try {
      const specsObj: Record<string, string> = {};
      formSpecs.forEach((s) => {
        if (s.key.trim()) specsObj[s.key.trim()] = s.value.trim();
      });

      const updatedProduct = {
        ...extractedProduct,
        title: formTitle,
        slug: formSlug,
        brand: formBrand,
        description: formDescription,
        highlights: formHighlights.split("\n").filter((h) => h.trim()),
        specs: specsObj,
        images: formImages,
      };

      const res = await fetch("/api/v1/admin/imports/meesho/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: updatedProduct,
          options: {
            status,
            categoryId: formCategoryId,
            customSellingPrice: parseFloat(String(formSellingPrice)),
            customMrp: parseFloat(String(formMrp)),
            customTitle: formTitle,
            customDescription: formDescription,
            selectedImages: formImages,
            variants: formVariants.length > 0 ? formVariants : undefined,
            allowUpdateDuplicate: true,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSingleError(data.error || "Failed to save product.");
        return;
      }

      setSingleError(null);
      setSaveSuccessResult(data);
      // Refresh history silently
      fetchHistory();
    } catch (err: any) {
      console.error(err);
      setSingleError(err.message || "Failed to save product to database.");
    } finally {
      setSavingSingle(false);
    }
  };

  // Gallery manipulation helpers
  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    const newImages = [...formImages];
    const [selected] = newImages.splice(index, 1);
    newImages.unshift(selected);
    setFormImages(newImages);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = formImages.filter((_, idx) => idx !== index);
    setFormImages(newImages);
  };

  const handleMoveImage = (from: number, to: number) => {
    if (to < 0 || to >= formImages.length) return;
    const newImages = [...formImages];
    const [moved] = newImages.splice(from, 1);
    newImages.splice(to, 0, moved);
    setFormImages(newImages);
  };

  const [newImageUrlInput, setNewImageUrlInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleAddImageUrl = () => {
    if (!newImageUrlInput.trim()) return;
    setFormImages((prev) => [...prev, newImageUrlInput.trim()]);
    setNewImageUrlInput("");
  };

  const handleUploadCustomImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setFormImages((prev) => [...prev, data.url]);
      } else {
        alert(data.error || "Failed to upload image");
      }
    } catch (err: any) {
      alert("Image upload failed: " + err.message);
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  // -------------------------------------------------------------
  // TAB 2: BULK PRODUCT IMPORT STATE
  // -------------------------------------------------------------
  const [bulkText, setBulkText] = useState("");
  const [bulkAutoPublish, setBulkAutoPublish] = useState(false);
  const [bulkCategoryId, setBulkCategoryId] = useState("");
  const [submittingBulk, setSubmittingBulk] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  // Active Job monitor
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<any | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Parse bulk stats in real time
  const rawUrls = bulkText
    .split(/\r?\n/)
    .map((u) => u.trim())
    .filter(Boolean);
  const uniqueUrls = Array.from(new Set(rawUrls));
  const duplicateUrlCount = rawUrls.length - uniqueUrls.length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setBulkText((prev) => (prev ? `${prev}\n${content}` : content));
      }
    };
    reader.readAsText(file);
  };

  // -------------------------------------------------------------
  // BULK & HISTORY PRODUCT DETAILS EDIT MODAL STATE & ACTIONS
  // -------------------------------------------------------------
  const [editingModalProduct, setEditingModalProduct] = useState<any | null>(null);
  const [loadingEditModal, setLoadingEditModal] = useState(false);
  const [editModalTitle, setEditModalTitle] = useState("");
  const [editModalSellingPrice, setEditModalSellingPrice] = useState<number | string>("");
  const [editModalMrp, setEditModalMrp] = useState<number | string>("");
  const [editModalStock, setEditModalStock] = useState<number | string>("50");
  const [editModalCategoryId, setEditModalCategoryId] = useState("");
  const [editModalBrand, setEditModalBrand] = useState("");
  const [editModalDescription, setEditModalDescription] = useState("");
  const [editModalHighlights, setEditModalHighlights] = useState("");
  const [editModalImages, setEditModalImages] = useState<string[]>([]);
  const [editModalSpecs, setEditModalSpecs] = useState<{ key: string; value: string }[]>([]);
  const [editModalStatus, setEditModalStatus] = useState<"DRAFT" | "APPROVED">("DRAFT");
  const [savingEditModal, setSavingEditModal] = useState(false);
  const [editModalSuccessMsg, setEditModalSuccessMsg] = useState<string | null>(null);
  const [editModalError, setEditModalError] = useState<string | null>(null);
  const [newEditModalImageUrl, setNewEditModalImageUrl] = useState("");
  const [uploadingModalImage, setUploadingModalImage] = useState(false);

  const openProductEditModal = async (productId: string, fallbackTitle?: string) => {
    if (!productId) return;
    setLoadingEditModal(true);
    setEditModalError(null);
    setEditModalSuccessMsg(null);
    try {
      const res = await fetch(`/api/v1/products/${productId}`);
      if (!res.ok) throw new Error("Failed to load product details");
      const data = await res.json();
      const p = data.product;
      setEditingModalProduct(p);
      setEditModalTitle(p.title || fallbackTitle || "");
      setEditModalSellingPrice(p.basePrice !== undefined ? p.basePrice : 299);
      setEditModalMrp(p.mrp !== undefined ? p.mrp : 499);
      setEditModalStock(p.stock !== undefined ? p.stock : 50);
      setEditModalCategoryId(p.categoryId || "");
      setEditModalBrand(p.brand?.name || p.supplierName || "DesiVogue Ethnic Apparels");
      setEditModalDescription(p.description || "");
      setEditModalHighlights(
        Array.isArray(p.highlights)
          ? p.highlights.join("\n")
          : typeof p.highlights === "string"
          ? p.highlights
          : ""
      );
      setEditModalStatus(p.status === "APPROVED" ? "APPROVED" : "DRAFT");
      setEditModalImages((p.images || []).map((img: any) => (typeof img === "string" ? img : img.url)));

      let specsObj: Record<string, any> = {};
      try {
        specsObj = typeof p.specs === "string" ? JSON.parse(p.specs) : p.specs || {};
      } catch {
        specsObj = {};
      }
      setEditModalSpecs(
        Object.entries(specsObj).map(([k, v]) => ({ key: k, value: String(v) }))
      );
    } catch (err: any) {
      console.error(err);
      setEditModalError(err.message || "Could not load product for editing");
    } finally {
      setLoadingEditModal(false);
    }
  };

  const handleModalSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    const next = [...editModalImages];
    const [picked] = next.splice(index, 1);
    next.unshift(picked);
    setEditModalImages(next);
  };

  const handleModalRemoveImage = (index: number) => {
    setEditModalImages(editModalImages.filter((_, idx) => idx !== index));
  };

  const handleModalMoveImage = (from: number, to: number) => {
    if (to < 0 || to >= editModalImages.length) return;
    const next = [...editModalImages];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setEditModalImages(next);
  };

  const handleModalAddImageUrl = () => {
    if (!newEditModalImageUrl.trim()) return;
    setEditModalImages([...editModalImages, newEditModalImageUrl.trim()]);
    setNewEditModalImageUrl("");
  };

  const handleModalUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingModalImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/v1/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setEditModalImages((prev) => [...prev, data.url]);
      } else {
        alert(data.error || "Failed to upload image");
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingModalImage(false);
      e.target.value = "";
    }
  };

  const handleSaveModalEdit = async (overrideStatus?: "DRAFT" | "APPROVED") => {
    if (!editingModalProduct) return;
    setSavingEditModal(true);
    setEditModalError(null);
    setEditModalSuccessMsg(null);

    const targetStatus = overrideStatus || editModalStatus;

    try {
      const specsObj: Record<string, string> = {};
      editModalSpecs.forEach((s) => {
        if (s.key.trim()) specsObj[s.key.trim()] = s.value.trim();
      });

      const payload = {
        title: editModalTitle.trim(),
        description: editModalDescription.trim(),
        basePrice: parseFloat(String(editModalSellingPrice)) || 299,
        mrp: parseFloat(String(editModalMrp)) || 499,
        stock: parseInt(String(editModalStock)) || 50,
        categoryId: editModalCategoryId || undefined,
        highlights: editModalHighlights.split("\n").map((h) => h.trim()).filter(Boolean),
        specs: specsObj,
        images: editModalImages,
        status: targetStatus,
      };

      const res = await fetch(`/api/v1/products/${editingModalProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update product");
      }

      setEditModalSuccessMsg(
        targetStatus === "APPROVED"
          ? "Product saved & published to storefront!"
          : "Product updated & saved as Draft!"
      );

      // Refresh active job items and history
      if (activeJobId) {
        const jobRes = await fetch(`/api/v1/admin/imports/meesho/jobs/${activeJobId}`);
        if (jobRes.ok) {
          const jobData = await jobRes.json();
          setActiveJob(jobData.job);
        }
      }
      fetchHistory();

      setTimeout(() => {
        setEditingModalProduct(null);
        setEditModalSuccessMsg(null);
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setEditModalError(err.message || "Failed to save product details");
    } finally {
      setSavingEditModal(false);
    }
  };

  const handleQuickApproveProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/v1/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });
      if (res.ok) {
        if (activeJobId) {
          const jobRes = await fetch(`/api/v1/admin/imports/meesho/jobs/${activeJobId}`);
          if (jobRes.ok) {
            const jobData = await jobRes.json();
            setActiveJob(jobData.job);
          }
        }
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartBulk = async () => {
    if (uniqueUrls.length === 0) {
      setBulkError("Please enter at least one Meesho product URL.");
      return;
    }

    setSubmittingBulk(true);
    setBulkError(null);

    try {
      const res = await fetch("/api/v1/admin/imports/meesho/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls: uniqueUrls,
          autoPublish: bulkAutoPublish,
          categoryId: bulkCategoryId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start bulk import job");
      }

      setActiveJobId(data.job.id);
      pollJob(data.job.id);
    } catch (err: any) {
      console.error(err);
      setBulkError(err.message || "Failed to create bulk import job.");
    } finally {
      setSubmittingBulk(false);
    }
  };

  const pollJob = (jobId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    const check = async () => {
      try {
        const res = await fetch(`/api/v1/admin/imports/meesho/jobs/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          setActiveJob(data.job);

          if (["COMPLETED", "FAILED", "PARTIAL", "CANCELLED"].includes(data.job.status)) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            fetchHistory();
          }
        }
      } catch (err) {
        console.error("Poll job error:", err);
      }
    };

    check();
    pollingRef.current = setInterval(check, 2500);
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleCancelJob = async () => {
    if (!activeJobId) return;
    try {
      await fetch(`/api/v1/admin/imports/meesho/jobs/${activeJobId}/cancel`, {
        method: "POST",
      });
      pollJob(activeJobId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRetryJob = async () => {
    if (!activeJobId) return;
    try {
      await fetch(`/api/v1/admin/imports/meesho/jobs/${activeJobId}/retry`, {
        method: "POST",
      });
      pollJob(activeJobId);
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------------------------------------
  // TAB 3: IMPORT HISTORY STATE
  // -------------------------------------------------------------
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyFilterStatus, setHistoryFilterStatus] = useState("ALL");
  const [historySearch, setHistorySearch] = useState("");
  const [historyStats, setHistoryStats] = useState<any>({});

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const q = encodeURIComponent(historySearch);
      const res = await fetch(
        `/api/v1/admin/imports/meesho/history?page=${historyPage}&limit=15&status=${historyFilterStatus}&q=${q}`
      );
      if (res.ok) {
        const data = await res.json();
        setHistoryItems(data.items || []);
        setHistoryTotalPages(data.pagination.totalPages || 1);
        setHistoryStats(data.stats || {});
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [historyPage, historyFilterStatus]);

  const handleReimportItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/v1/admin/imports/meesho/products/${itemId}/reimport`, {
        method: "POST",
      });
      if (res.ok) fetchHistory();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <Link href="/admin" className="hover:text-slate-200">
              Admin
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/admin/categories" className="hover:text-slate-200">
              Categories & Catalog
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-rose-400 font-bold">Meesho Importer</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Download className="w-6 h-6 text-rose-500" />
              <span>Meesho Product Importer</span>
            </h1>
            <button
              onClick={() => {
                setInputToken("");
                setTokenMsg(null);
                setShowTokenModal(true);
              }}
              className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border transition flex items-center gap-1.5 ${
                apifyTokenState.hasToken
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
              }`}
              title="Configure Apify API Token"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  apifyTokenState.hasToken ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
              />
              <span>{apifyTokenState.hasToken ? "Apify Live Ready" : "Apify Token Setup"}</span>
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Scrape, normalize, download galleries, map categories, and publish Meesho catalog listings
          </p>
        </div>

        {/* Apify Token Setup Modal */}
        {showTokenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-rose-500" />
                  <h3 className="font-bold text-white text-sm">Apify Engine Settings</h3>
                </div>
                <button
                  onClick={() => setShowTokenModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your Apify account to scrape live Meesho catalog items directly using the{" "}
                <span className="font-mono text-rose-400">ecomscrape/meesho-product-details-page-scraper</span> actor.
              </p>

              {apifyTokenState.hasToken && (
                <div className="bg-emerald-950/40 border border-emerald-800/80 p-3 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                  <span className="font-mono text-[11px]">{apifyTokenState.maskedToken}</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  {apifyTokenState.hasToken ? "Replace / Update Token" : "Enter Apify API Token"}
                </label>
                <input
                  type="password"
                  placeholder="apify_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                />
                <p className="text-[10px] text-slate-500">
                  Get your personal token from{" "}
                  <a
                    href="https://console.apify.com/account/integrations"
                    target="_blank"
                    rel="noreferrer"
                    className="text-rose-400 underline hover:text-rose-300"
                  >
                    Apify Console → Integrations
                  </a>
                </p>
              </div>

              {tokenMsg && (
                <div className="text-xs p-2.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
                  {tokenMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTokenModal(false)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingToken}
                  onClick={handleSaveApifyToken}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-rose-950/40"
                >
                  {savingToken ? "Saving..." : "Save & Activate"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("single")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "single"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Single Product</span>
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "bulk"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bulk Import</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "history"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Import History</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION A: SINGLE PRODUCT IMPORT                          */}
      {/* ========================================================= */}
      {activeTab === "single" && (
        <div className="space-y-6">
          {/* Apify Engine Connection Banner */}
          {!apifyTokenState.hasToken ? (
            <div className="bg-amber-950/30 border border-amber-800/60 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-200">
                    Apify Live Scraping Not Activated — Using Offline Semantic Mode
                  </p>
                  <p className="text-[11px] text-amber-300/80 mt-0.5">
                    To scrape live real-time listings with photos directly from Meesho using your{" "}
                    <code className="text-amber-200 font-mono">ecomscrape/meesho-product-details-page-scraper</code> actor,
                    paste your Apify API Token below:
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="password"
                  placeholder="apify_api_..."
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  className="bg-slate-900 border border-amber-800/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 font-mono w-48 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  disabled={savingToken || !inputToken.trim()}
                  onClick={handleSaveApifyToken}
                  className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl transition shadow"
                >
                  {savingToken ? "Connecting..." : "Connect Token"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold">Apify Live Scraping Engine Connected</span>
                <span className="text-[10px] text-emerald-400/80 font-mono">({apifyTokenState.maskedToken})</span>
              </div>
              <button
                onClick={() => setShowTokenModal(true)}
                className="text-[11px] text-emerald-400 hover:text-emerald-200 underline"
              >
                Change Token
              </button>
            </div>
          )}

          {/* 1-Click Instant Browser Importer Card */}
          <div className="bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-slate-900 border border-rose-500/30 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span>1-Click Live Browser Importer</span>
                    <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                      100% Authentic Data • 0 APIs Needed
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300/80 mt-0.5">
                    Drag the button to your Chrome bookmarks bar. Click it on <strong className="text-white">ANY Meesho page</strong> to instantly pull 100% accurate titles, real CDN photos, real prices, and specifications into Mojicart!
                  </p>
                </div>
              </div>

              {/* Bookmarklet Button */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`javascript:(function(){try{var n=window.__NEXT_DATA__,s=n&&n.props&&n.props.pageProps&&(n.props.pageProps.initialState||n.props.pageProps),p=(s&&s.product&&s.product.details&&s.product.details.data)||(s&&s.productDetails&&s.productDetails.product)||(s&&s.product)||null,d={};if(p&&(p.name||p.title)){var sp={};if(p.product_details){if(Array.isArray(p.product_details)){p.product_details.forEach(function(i){if(i&&(i.name||i.title)&&i.value)sp[i.name||i.title]=String(i.value);});}else if(typeof p.product_details==='object'){Object.values(p.product_details).forEach(function(sec){if(sec&&Array.isArray(sec.attributes)){sec.attributes.forEach(function(a){var k=a.display_name||a.name||a.field_name;if(k&&a.value)sp[k]=String(a.value);});}});}}var im=(p.images||p.product_images||[]).map(function(u){var str=typeof u==='string'?u:(u.url||u.image||u.src||u);return str?str.replace(/_\\d+\\.(jpg|webp|png|jpeg)/i,'_1024.jpg'):'';}).filter(Boolean);var pr=p.price||(p.variations&&p.variations[0]&&p.variations[0].price)||0;var mr=p.original_price||(p.mrp_details&&p.mrp_details.mrp)||p.mrp||Math.round((pr||128)*1.5);var vr=[];if(p.suppliers&&p.suppliers[0]&&Array.isArray(p.suppliers[0].inventory)&&p.suppliers[0].inventory.length>0){vr=p.suppliers[0].inventory.map(function(item){var v=item.variation||{};var sName=v.name||v.size||'Free Size';var vPrice=v.final_price||v.discounted_price||v.price||pr;var vMrp=v.original_price||v.mrp||(mr>vPrice?Math.round(vPrice*(mr/(pr||1))):Math.round(vPrice*1.5));return{title:sName,size:sName,price:vPrice,mrp:vMrp>vPrice?vMrp:Math.round(vPrice*1.5),stock:item.in_stock===false?0:50};});}if(vr.length===0&&Array.isArray(p.variations)){vr=p.variations.map(function(v){var sName=typeof v==='string'?v:(v.name||v.size||'Free Size');var vPrice=typeof v==='object'?(v.price||pr):pr;var vMrp=typeof v==='object'?(v.original_price||v.mrp||mr):mr;return{title:sName,size:sName,price:vPrice,mrp:vMrp>vPrice?vMrp:(mr>vPrice?mr:Math.round(vPrice*1.5)),stock:(v&&v.in_stock===false?0:50)};});}d={title:p.name||p.title,price:pr,mrp:mr,images:im,variants:vr,description:p.description||p.name,brand:sp['Brand']||p.supplier_name||'Ashirwad',supplier_name:p.supplier_name||sp['Brand']||'Ashirwad',specs:sp,category_name:(p.breadcrumb&&p.breadcrumb[1]&&(p.breadcrumb[1].title||p.breadcrumb[1].name))||'Kurtis & Kurtas',url:window.location.href}}else{var h=document.querySelector('h1'),pEls=Array.from(document.querySelectorAll('span,h4,h5,div')).filter(function(e){var t=e.innerText||'';return t.indexOf('₹')!==-1&&t.length<15;}),pr2=0;if(pEls.length){var m=(pEls[0].innerText||'').match(/₹\\s*([0-9,]+)/);if(m)pr2=parseInt(m[1].replace(/,/g,''))||0;}var mr2=Math.round(pr2*1.5);var im2=Array.from(document.querySelectorAll('img')).map(function(i){return i.src}).filter(function(u){return u&&u.indexOf('images.meesho.com')!==-1&&u.indexOf('banner')===-1}).map(function(u){return u.replace(/_\\d+\\.(jpg|webp|jpeg|png)/i,'_1024.jpg')});var vr2=Array.from(document.querySelectorAll('.size-select button, [class*="size"] button, [role="button"], div')).map(function(b){var lines=(b.innerText||'').trim().split(/\\n+/).map(function(l){return l.trim();}).filter(Boolean);if(lines.length>=2){var m2=lines[1].match(/₹\\s*([0-9,]+)/);if(m2&&/^(IND-|XXS|XS|S|M|L|XL|XXL|XXXL|Free Size|\\d+)/i.test(lines[0])){var vp=parseInt(m2[1].replace(/,/g,''))||pr2;return{title:lines[0],size:lines[0],price:vp,mrp:Math.round(vp*1.5),stock:50};}}return null;}).filter(Boolean);if(vr2.length===0){vr2=Array.from(document.querySelectorAll('.size-select button, [class*="size"] button, [role="button"]')).map(function(b){return b.innerText.trim();}).filter(function(t){return /^(IND-|XS|S|M|L|XL|XXL|XXXL|Free Size|\\d+)/i.test(t);}).map(function(sz){return{title:sz,size:sz,price:pr2,mrp:mr2,stock:50};});}d={title:h?h.innerText.trim():document.title,price:pr2,mrp:mr2,images:Array.from(new Set(im2)),variants:vr2,url:window.location.href}}window.open('${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/admin/imports/meesho?meeshoData='+encodeURIComponent(JSON.stringify(d)),'_blank')}catch(e){alert('Mojicart Import error: '+e.message)}})();`}
                  title="Drag me to your Chrome Bookmarks Bar"
                  className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-950/50 flex items-center gap-2 cursor-grab active:cursor-grabbing border border-rose-400/40 select-none transition"
                  onClick={(e) => {
                    // Prevent normal navigation if clicked in admin
                    e.preventDefault();
                    alert("Drag this button '📦 Import to Mojicart' directly onto your Chrome Bookmarks bar! Then on any Meesho product page in Chrome, simply click it to import instantly.");
                  }}
                >
                  <Package className="w-4 h-4" />
                  <span>📦 Import to Mojicart (Drag to Bookmarks)</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
                    const code = `javascript:(function(){try{var n=window.__NEXT_DATA__,s=n&&n.props&&n.props.pageProps&&(n.props.pageProps.initialState||n.props.pageProps),p=(s&&s.product&&s.product.details&&s.product.details.data)||(s&&s.productDetails&&s.productDetails.product)||(s&&s.product)||null,d={};if(p&&(p.name||p.title)){var sp={};if(p.product_details){if(Array.isArray(p.product_details)){p.product_details.forEach(function(i){if(i&&(i.name||i.title)&&i.value)sp[i.name||i.title]=String(i.value);});}else if(typeof p.product_details==='object'){Object.values(p.product_details).forEach(function(sec){if(sec&&Array.isArray(sec.attributes)){sec.attributes.forEach(function(a){var k=a.display_name||a.name||a.field_name;if(k&&a.value)sp[k]=String(a.value);});}});}}var im=(p.images||p.product_images||[]).map(function(u){var str=typeof u==='string'?u:(u.url||u.image||u.src||u);return str?str.replace(/_\\d+\\.(jpg|webp|png|jpeg)/i,'_1024.jpg'):'';}).filter(Boolean);var pr=p.price||(p.variations&&p.variations[0]&&p.variations[0].price)||0;var mr=p.original_price||(p.mrp_details&&p.mrp_details.mrp)||p.mrp||Math.round((pr||128)*1.5);var vr=[];if(p.suppliers&&p.suppliers[0]&&Array.isArray(p.suppliers[0].inventory)&&p.suppliers[0].inventory.length>0){vr=p.suppliers[0].inventory.map(function(item){var v=item.variation||{};var sName=v.name||v.size||'Free Size';var vPrice=v.final_price||v.discounted_price||v.price||pr;var vMrp=v.original_price||v.mrp||(mr>vPrice?Math.round(vPrice*(mr/(pr||1))):Math.round(vPrice*1.5));return{title:sName,size:sName,price:vPrice,mrp:vMrp>vPrice?vMrp:Math.round(vPrice*1.5),stock:item.in_stock===false?0:50};});}if(vr.length===0&&Array.isArray(p.variations)){vr=p.variations.map(function(v){var sName=typeof v==='string'?v:(v.name||v.size||'Free Size');var vPrice=typeof v==='object'?(v.price||pr):pr;var vMrp=typeof v==='object'?(v.original_price||v.mrp||mr):mr;return{title:sName,size:sName,price:vPrice,mrp:vMrp>vPrice?vMrp:(mr>vPrice?mr:Math.round(vPrice*1.5)),stock:(v&&v.in_stock===false?0:50)};});}d={title:p.name||p.title,price:pr,mrp:mr,images:im,variants:vr,description:p.description||p.name,brand:sp['Brand']||p.supplier_name||'Ashirwad',supplier_name:p.supplier_name||sp['Brand']||'Ashirwad',specs:sp,category_name:(p.breadcrumb&&p.breadcrumb[1]&&(p.breadcrumb[1].title||p.breadcrumb[1].name))||'Kurtis & Kurtas',url:window.location.href}}else{var h=document.querySelector('h1'),pEls=Array.from(document.querySelectorAll('span,h4,h5,div')).filter(function(e){var t=e.innerText||'';return t.indexOf('₹')!==-1&&t.length<15;}),pr2=0;if(pEls.length){var m=(pEls[0].innerText||'').match(/₹\\s*([0-9,]+)/);if(m)pr2=parseInt(m[1].replace(/,/g,''))||0;}var mr2=Math.round(pr2*1.5);var im2=Array.from(document.querySelectorAll('img')).map(function(i){return i.src}).filter(function(u){return u&&u.indexOf('images.meesho.com')!==-1&&u.indexOf('banner')===-1}).map(function(u){return u.replace(/_\\d+\\.(jpg|webp|jpeg|png)/i,'_1024.jpg')});var vr2=Array.from(document.querySelectorAll('.size-select button, [class*="size"] button, [role="button"], div')).map(function(b){var lines=(b.innerText||'').trim().split(/\\n+/).map(function(l){return l.trim();}).filter(Boolean);if(lines.length>=2){var m2=lines[1].match(/₹\\s*([0-9,]+)/);if(m2&&/^(IND-|XXS|XS|S|M|L|XL|XXL|XXXL|Free Size|\\d+)/i.test(lines[0])){var vp=parseInt(m2[1].replace(/,/g,''))||pr2;return{title:lines[0],size:lines[0],price:vp,mrp:Math.round(vp*1.5),stock:50};}}return null;}).filter(Boolean);if(vr2.length===0){vr2=Array.from(document.querySelectorAll('.size-select button, [class*="size"] button, [role="button"]')).map(function(b){return b.innerText.trim();}).filter(function(t){return /^(IND-|XS|S|M|L|XL|XXL|XXXL|Free Size|\\d+)/i.test(t);}).map(function(sz){return{title:sz,size:sz,price:pr2,mrp:mr2,stock:50};});}d={title:h?h.innerText.trim():document.title,price:pr2,mrp:mr2,images:Array.from(new Set(im2)),variants:vr2,url:window.location.href}}window.open('${origin}/admin/imports/meesho?meeshoData='+encodeURIComponent(JSON.stringify(d)),'_blank')}catch(e){alert('Mojicart Import error: '+e.message)}})();`;
                    navigator.clipboard.writeText(code);
                    setCopiedBookmarklet(true);
                    setTimeout(() => setCopiedBookmarklet(false), 2500);
                  }}
                  className="px-3 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
                  title="Copy bookmarklet code"
                >
                  {copiedBookmarklet ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">Copied!</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* URL / HTML Input Bar Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            {/* Input Mode Selector */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPasteHtmlMode(false)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    !pasteHtmlMode
                      ? "bg-rose-600 text-white"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  🔗 Product URL Mode
                </button>
                <button
                  type="button"
                  onClick={() => setPasteHtmlMode(true)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    pasteHtmlMode
                      ? "bg-rose-600 text-white"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  📋 Paste Page HTML / Source (100% Accurate)
                </button>
              </div>

              <span className="text-[11px] text-slate-500">
                {pasteHtmlMode
                  ? "Paste raw page source (Ctrl+U from Meesho page) for instant photo extraction"
                  : "Direct Meesho URL scraper"}
              </span>
            </div>

            {!pasteHtmlMode ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Paste Meesho product URL e.g. https://www.meesho.com/.../p/bblkyc"
                    value={singleUrl}
                    onChange={(e) => setSingleUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleFetchSingle()}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                  />
                  {singleUrl && (
                    <button
                      onClick={() => setSingleUrl("")}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleFetchSingle()}
                  disabled={fetchingSingle}
                  className="bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition shrink-0 shadow-lg shadow-rose-950/40"
                >
                  {fetchingSingle ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin text-rose-300" />
                      <span>Extracting Details...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Fetch Product Details</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Optional: Product URL (for reference)"
                    value={singleUrl}
                    onChange={(e) => setSingleUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 font-mono"
                  />
                </div>
                <textarea
                  rows={5}
                  placeholder="Paste Meesho page HTML or page source (Ctrl+U on Meesho, Ctrl+A, Ctrl+C)..."
                  value={rawHtmlText}
                  onChange={(e) => setRawHtmlText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  type="button"
                  disabled={fetchingSingle || !rawHtmlText.trim()}
                  onClick={() => handleFetchSingle()}
                  className="bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition"
                >
                  {fetchingSingle ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Parsing HTML...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>Extract 100% Real Product from HTML</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Quick Demo Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-500">Quick Test URLs:</span>
              <button
                type="button"
                onClick={() => {
                  const url =
                    "https://www.meesho.com/wildplay-chocolate-30ml-perfume-spray-vanilla-fragrance/p/1op63p";
                  setSingleUrl(url);
                  handleFetchSingle(url);
                }}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg transition"
              >
                🍫 Wildplay Chocolate Perfume (1op63p)
              </button>
              <button
                type="button"
                onClick={() => {
                  const url =
                    "https://www.meesho.com/traditional-cotton-kurti-pant-set/p/2smq2y";
                  setSingleUrl(url);
                  handleFetchSingle(url);
                }}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg transition"
              >
                👗 Cotton Kurti Set (2smq2y)
              </button>
              <button
                type="button"
                onClick={() => {
                  const url =
                    "https://www.meesho.com/ashirwad-kurta-set-for-womenprinted-kurta-set-for-womenstylish-kurta-sets-for-womenfloral-kurta-setcotton-kurta-set-for-women-bit/p/90tis4";
                  setSingleUrl(url);
                  handleFetchSingle(url);
                }}
                className="bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 hover:text-white px-2.5 py-1 rounded-lg transition font-semibold"
              >
                🌸 Ashirwad Kurta Set (90tis4)
              </button>
            </div>

            {/* Error Message */}
            {singleError && (
              <div className="bg-rose-950/40 border border-rose-800 text-rose-300 p-3.5 rounded-xl text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Extraction Error</p>
                  <p className="text-[11px] text-rose-200/90 mt-0.5">{singleError}</p>
                </div>
                <button
                  onClick={() => handleFetchSingle()}
                  className="bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-[11px] font-bold px-2 py-1 rounded transition"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Success Saved Notification */}
            {saveSuccessResult && (
              <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 p-4 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold text-white">
                      {saveSuccessResult.isUpdate
                        ? "Product Updated Successfully!"
                        : "Product Successfully Imported into Mojicart!"}
                    </p>
                    <p className="text-[11px] text-emerald-200 mt-0.5">
                      Status:{" "}
                      <span className="font-bold uppercase tracking-wider">
                        {saveSuccessResult.product.status}
                      </span>{" "}
                      | SKU: {saveSuccessResult.product.sku}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/product/${saveSuccessResult.product.slug}`}
                    target="_blank"
                    className="bg-emerald-800/60 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition"
                  >
                    <span>View Storefront</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/admin/products"
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-lg text-xs transition"
                  >
                    Product Catalog
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Extracted Product Preview & Editable Form */}
          {extractedProduct && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Gallery & Source Details */}
              <div className="space-y-6">
                {/* Image Gallery Manager */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-rose-500" />
                      <span>Product Image Gallery ({formImages.length})</span>
                    </h3>
                    <span className="text-[10px] text-slate-500">Image #1 is Primary</span>
                  </div>

                  {/* Primary Image Preview */}
                  {formImages.length > 0 ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-800 aspect-square bg-slate-900 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formImages[0]}
                        alt="Primary"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
                        Primary Cover
                      </span>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-slate-500 text-xs">
                      No images found
                    </div>
                  )}

                  {/* Thumbnails list with reorder / remove controls */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-slate-400">
                      Reorder, set primary, or remove images:
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {formImages.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className={`relative rounded-lg overflow-hidden border group ${
                            idx === 0 ? "border-rose-500" : "border-slate-800"
                          } bg-slate-900 aspect-square`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgUrl}
                            alt={`Thumb ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Overlay actions */}
                          <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold text-white bg-slate-800/80 px-1 rounded">
                                #{idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="text-rose-400 hover:text-rose-300 p-0.5"
                                title="Remove Image"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between gap-1 pt-1">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(idx)}
                                  className="text-[9px] bg-rose-600 hover:bg-rose-500 text-white font-bold px-1 py-0.5 rounded w-full truncate"
                                  title="Make Primary"
                                >
                                  Make Cover
                                </button>
                              )}
                              <div className="flex gap-1 ml-auto">
                                {idx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(idx, idx - 1)}
                                    className="text-slate-300 hover:text-white"
                                  >
                                    <MoveLeft className="w-3 h-3" />
                                  </button>
                                )}
                                {idx < formImages.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(idx, idx + 1)}
                                    className="text-slate-300 hover:text-white"
                                  >
                                    <MoveRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Image by URL or Upload local file */}
                    <div className="pt-3 border-t border-slate-800/80 space-y-2">
                      <p className="text-[11px] font-bold text-slate-400">
                        Add more images to this product:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="Paste image URL (https://...)"
                          value={newImageUrlInput}
                          onChange={(e) => setNewImageUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddImageUrl();
                            }
                          }}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          disabled={!newImageUrlInput.trim()}
                          className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition"
                        >
                          + Add URL
                        </button>
                      </div>

                      <label className="flex items-center justify-center gap-2 border border-dashed border-slate-800 hover:border-slate-700 rounded-lg p-2 text-xs text-slate-400 hover:text-white cursor-pointer transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingImage ? "Uploading image..." : "Upload Image from Computer"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadCustomImage}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Scraped Source Metadata Card */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 text-xs">
                  <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-amber-500" />
                    <span>Scraped Source Metadata</span>
                  </h3>
                  <div className="space-y-1.5 text-slate-400">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span>Source Product ID</span>
                      <span className="font-mono text-white font-bold">
                        {extractedProduct.sourceProductId}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span>Meesho Rating</span>
                      <span className="font-bold text-amber-400">
                        ★ {extractedProduct.ratings.score.toFixed(1)} (
                        {extractedProduct.ratings.ratingCount.toLocaleString()} ratings)
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span>Source Selling Price</span>
                      <span className="font-bold text-white">
                        ₹{extractedProduct.pricing.sourcePrice.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span>Source MRP</span>
                      <span className="font-bold text-slate-400 line-through">
                        ₹{extractedProduct.pricing.sourceMrp.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Meesho Assured</span>
                      <span className="font-bold text-emerald-400">
                        {extractedProduct.isAssured ? "Yes (Verified)" : "Standard"}
                      </span>
                    </div>
                  </div>

                  <a
                    href={extractedProduct.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 pt-1"
                  >
                    <span>View original Meesho page</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Right Column: Editable Product Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Duplicate Alert if found */}
                {duplicateInfo?.isDuplicate && (
                  <div className="bg-amber-950/40 border border-amber-800/80 rounded-2xl p-4 text-xs text-amber-200 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-white text-sm">
                          Duplicate Product Detected in Mojicart!
                        </p>
                        <p className="text-[11px] text-amber-200/90 mt-0.5">
                          This product is already in your catalog as{" "}
                          <span className="font-bold text-white">
                            &quot;{duplicateInfo.existingProduct.title}&quot;
                          </span>{" "}
                          (SKU: {duplicateInfo.existingProduct.sku}).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-300">
                        <input
                          type="checkbox"
                          checked={allowUpdateDuplicate}
                          onChange={(e) => setAllowUpdateDuplicate(e.target.checked)}
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                        <span>Update existing product source attributes (Safe update)</span>
                      </label>

                      <Link
                        href={`/admin/products`}
                        target="_blank"
                        className="text-[11px] text-amber-400 hover:text-white underline ml-auto"
                      >
                        Inspect Existing Product
                      </Link>
                    </div>
                  </div>
                )}

                {/* Main Edit Form */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="font-bold text-white text-sm">
                      Product Information & Catalog Mapping
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      Editable before saving
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:ring-1 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  {/* Category Mapping Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-300">
                          Mojicart Category *
                        </label>
                        {suggestedCategory && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded">
                            {Math.round(suggestedCategory.confidence * 100)}% match
                          </span>
                        )}
                      </div>
                      <select
                        value={formCategoryId}
                        onChange={(e) => setFormCategoryId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-semibold focus:ring-1 focus:ring-rose-500 focus:outline-none"
                      >
                        <option value="">Select Mojicart Category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.parentId ? `↳ ${c.name}` : c.name}
                          </option>
                        ))}
                      </select>
                      {suggestedCategory && (
                        <p className="text-[10px] text-slate-500 mt-1">
                          Reason: {suggestedCategory.reason}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">
                        Brand / Manufacturer
                      </label>
                      <input
                        type="text"
                        value={formBrand}
                        onChange={(e) => setFormBrand(e.target.value)}
                        placeholder="Brand name"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Pricing Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <div>
                      <label className="block font-bold text-slate-400 mb-1">
                        Source Price
                      </label>
                      <div className="text-sm font-black text-slate-300 py-1.5">
                        ₹{extractedProduct.pricing.sourcePrice.toFixed(0)}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        Original Meesho Price
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-amber-400 text-xs">
                          Mojicart Selling Price (₹) *
                        </label>
                        {formVariants.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleSyncPriceToVariants()}
                            className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline"
                            title="Sync selling price to all variations"
                          >
                            Apply to all sizes
                          </button>
                        )}
                      </div>
                      <input
                        type="number"
                        step="1"
                        value={formSellingPrice}
                        onChange={(e) => handleMainSellingPriceChange(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-bold text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-500">
                        Final customer price
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-300 text-xs">
                          Mojicart MRP (₹) *
                        </label>
                        {formVariants.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleSyncMrpToVariants()}
                            className="text-[10px] text-rose-400 hover:text-rose-300 font-bold underline"
                            title="Sync MRP to all variations"
                          >
                            Apply to all sizes
                          </button>
                        )}
                      </div>
                      <input
                        type="number"
                        step="1"
                        value={formMrp}
                        onChange={(e) => handleMainMrpChange(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-bold text-sm focus:ring-1 focus:ring-rose-500 focus:outline-none"
                      />
                      {Number(formMrp) > Number(formSellingPrice) && (
                        <span className="text-[10px] text-emerald-400 font-bold">
                          {Math.round(
                            ((Number(formMrp) - Number(formSellingPrice)) /
                              Number(formMrp)) *
                              100
                          )}
                          % discount shown
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Percentage Markup & Margin Toolbar */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white">
                          Percentage Price Adjustment (Main Product & All Variations)
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Applies profit markup proportionally based on source price
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 focus-within:border-emerald-500">
                        <input
                          type="number"
                          step="1"
                          value={priceMarkupPercent}
                          onChange={(e) => setPriceMarkupPercent(e.target.value)}
                          placeholder="20"
                          className="w-16 bg-transparent text-white font-bold text-sm focus:outline-none"
                        />
                        <span className="text-slate-400 text-xs font-bold">%</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApplyPercentagePriceAdjustment()}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow"
                      >
                        <Percent className="w-3.5 h-3.5" />
                        Apply % to All
                      </button>

                      <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

                      {/* Quick Presets */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[10, 15, 20, 25, 30, 50].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              setPriceMarkupPercent(String(preset));
                              handleApplyPercentagePriceAdjustment(preset);
                            }}
                            className={`px-2 py-1 rounded text-xs font-bold transition border ${
                              priceMarkupPercent === String(preset)
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                            }`}
                          >
                            +{preset}%
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={() => {
                            setPriceMarkupPercent("0");
                            handleResetToSourcePrices();
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-xs font-bold transition border border-slate-700"
                        >
                          Reset to Original
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Product Variations & Size Pricing Section */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold text-white">
                          Product Variations & Sizes ({formVariants.length})
                        </span>
                        {formVariants.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Custom size pricing enabled
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Variation / Size
                      </button>
                    </div>

                    {formVariants.length === 0 ? (
                      <div className="text-center py-4 bg-slate-950/50 border border-dashed border-slate-800 rounded-lg">
                        <p className="text-xs text-slate-400">
                          Single standard size (No variations). All sizes will use the main product price.
                        </p>
                        <button
                          type="button"
                          onClick={handleAddVariant}
                          className="mt-2 text-xs text-indigo-400 hover:underline font-bold inline-flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Add size variations (e.g. S, M, L, XL)
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto max-h-72 overflow-y-auto pr-1 border border-slate-800 rounded-lg">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-slate-800">
                            <tr>
                              <th className="py-2 px-3">Size / Option</th>
                              <th className="py-2 px-3">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                  <span>Selling Price (₹)</span>
                                  <button
                                    type="button"
                                    onClick={() => handleSyncPriceToVariants()}
                                    className="text-[9px] text-amber-400 hover:text-amber-300 font-bold underline normal-case tracking-normal cursor-pointer"
                                    title="Sync main selling price to all sizes"
                                  >
                                    Apply ₹{formSellingPrice} to all
                                  </button>
                                </div>
                              </th>
                              <th className="py-2 px-3">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                  <span>MRP (₹)</span>
                                  <button
                                    type="button"
                                    onClick={() => handleSyncMrpToVariants()}
                                    className="text-[9px] text-rose-400 hover:text-rose-300 font-bold underline normal-case tracking-normal cursor-pointer"
                                    title="Sync main MRP to all sizes"
                                  >
                                    Apply ₹{formMrp} to all
                                  </button>
                                </div>
                              </th>
                              <th className="py-2 px-3">Discount</th>
                              <th className="py-2 px-3">Stock</th>
                              <th className="py-2 px-2 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                            {formVariants.map((variant, vIdx) => {
                              const discount =
                                Number(variant.mrp) > Number(variant.price)
                                  ? Math.round(
                                      ((Number(variant.mrp) - Number(variant.price)) /
                                        Number(variant.mrp)) *
                                        100
                                    )
                                  : 0;

                              return (
                                <tr key={vIdx} className="hover:bg-slate-800/40 transition">
                                  <td className="py-2 px-3 font-semibold text-white">
                                    <input
                                      type="text"
                                      value={variant.title || variant.size || ""}
                                      onChange={(e) =>
                                        handleVariantChange(vIdx, "title", e.target.value)
                                      }
                                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white w-24 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                      placeholder="e.g. XL"
                                    />
                                  </td>
                                  <td className="py-2 px-3">
                                    <div className="flex items-center gap-1">
                                      <span className="text-slate-500 font-bold">₹</span>
                                      <input
                                        type="number"
                                        step="1"
                                        value={variant.price}
                                        onChange={(e) =>
                                          handleVariantChange(vIdx, "price", e.target.value)
                                        }
                                        className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-bold text-amber-400 w-20 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                      />
                                    </div>
                                  </td>
                                  <td className="py-2 px-3">
                                    <div className="flex items-center gap-1">
                                      <span className="text-slate-500 font-bold">₹</span>
                                      <input
                                        type="number"
                                        step="1"
                                        value={variant.mrp}
                                        onChange={(e) =>
                                          handleVariantChange(vIdx, "mrp", e.target.value)
                                        }
                                        className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 w-20 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                                      />
                                    </div>
                                  </td>
                                  <td className="py-2 px-3">
                                    {discount > 0 ? (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                                        {discount}% OFF
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-slate-500">-</span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3">
                                    <input
                                      type="number"
                                      value={variant.stock}
                                      onChange={(e) =>
                                        handleVariantChange(vIdx, "stock", e.target.value)
                                      }
                                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white w-16 focus:ring-1 focus:ring-slate-500 focus:outline-none"
                                    />
                                  </td>
                                  <td className="py-2 px-2 text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveVariant(vIdx)}
                                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                                      title="Remove Variant"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Description & Highlights */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Product Description
                    </label>
                    <textarea
                      rows={4}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Key Highlights (One bullet per line)
                    </label>
                    <textarea
                      rows={3}
                      value={formHighlights}
                      onChange={(e) => setFormHighlights(e.target.value)}
                      placeholder="Bullet 1&#10;Bullet 2"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:ring-1 focus:ring-rose-500 focus:outline-none font-mono text-[11px]"
                    />
                  </div>

                  {/* Specifications Key-Value List */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-300">
                        Specifications & Attributes ({formSpecs.length})
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormSpecs([...formSpecs, { key: "", value: "" }])
                        }
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-bold"
                      >
                        + Add Attribute
                      </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {formSpecs.map((spec, sIdx) => (
                        <div key={sIdx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Attribute Name e.g. Fabric"
                            value={spec.key}
                            onChange={(e) => {
                              const newSpecs = [...formSpecs];
                              newSpecs[sIdx].key = e.target.value;
                              setFormSpecs(newSpecs);
                            }}
                            className="w-1/3 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs font-semibold focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Value e.g. 100% Cotton"
                            value={spec.value}
                            onChange={(e) => {
                              const newSpecs = [...formSpecs];
                              newSpecs[sIdx].value = e.target.value;
                              setFormSpecs(newSpecs);
                            }}
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFormSpecs(formSpecs.filter((_, idx) => idx !== sIdx))
                            }
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Variants Preview */}
                  {extractedProduct.variants?.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <p className="font-bold text-slate-300">
                        Extracted Product Variants ({extractedProduct.variants.length})
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {extractedProduct.variants.map((v: any, vIdx: number) => (
                          <div
                            key={vIdx}
                            className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px]"
                          >
                            <p className="font-bold text-white truncate">{v.title}</p>
                            <p className="text-slate-400 mt-0.5">
                              Price: ₹{v.price} | MRP: ₹{v.mrp}
                            </p>
                            <span className="text-[10px] text-emerald-400">
                              Stock: {v.stock} units
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons: Import as Draft or Publish */}
                  <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      disabled={savingSingle}
                      onClick={() => handleSaveSingle("DRAFT")}
                      className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-5 py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-2"
                    >
                      {savingSingle ? (
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileText className="w-3.5 h-3.5" />
                      )}
                      <span>Import as Draft</span>
                    </button>

                    <button
                      type="button"
                      disabled={savingSingle}
                      onClick={() => handleSaveSingle("APPROVED")}
                      className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50"
                    >
                      {savingSingle ? (
                        <RotateCcw className="w-3.5 h-3.5 animate-spin text-rose-200" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>Import and Publish to Storefront</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION B: BULK PRODUCT IMPORT                            */}
      {/* ========================================================= */}
      {activeTab === "bulk" && (
        <div className="space-y-6">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-rose-500" />
                <span>Bulk Meesho Product Importer</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste multiple product URLs or upload a text file. Each product is scraped, images stored, and saved independently.
              </p>
            </div>

            {/* Bulk Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  Meesho Product URLs (One URL per line):
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload CSV / TXT</span>
                    <input
                      type="file"
                      accept=".txt,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {bulkText && (
                    <button
                      onClick={() => setBulkText("")}
                      className="text-xs text-slate-500 hover:text-slate-300"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              <textarea
                rows={6}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="https://www.meesho.com/wildplay-chocolate-30ml-perfume-spray-vanilla-fragrance/p/1op63p&#10;https://www.meesho.com/traditional-cotton-kurti-pant-set/p/2smq2y"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
              />
            </div>

            {/* Real-time URL Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  Total Lines
                </span>
                <span className="font-bold text-white text-sm">{rawUrls.length}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  Unique URLs
                </span>
                <span className="font-bold text-emerald-400 text-sm">
                  {uniqueUrls.length}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  Duplicates in Text
                </span>
                <span className="font-bold text-amber-400 text-sm">
                  {duplicateUrlCount}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  Batch Limit
                </span>
                <span className="font-bold text-slate-300 text-sm">50 Max</span>
              </div>
            </div>

            {/* Options Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Category Assignment
                </label>
                <select
                  value={bulkCategoryId}
                  onChange={(e) => setBulkCategoryId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none"
                >
                  <option value="">Auto-Suggest per Product (Recommended)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      Force: {c.parentId ? `↳ ${c.name}` : c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4 sm:pt-6">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-bold">
                  <input
                    type="checkbox"
                    checked={bulkAutoPublish}
                    onChange={(e) => setBulkAutoPublish(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Automatically Publish Imported Products</span>
                </label>
                <span className="text-[10px] text-slate-500 block">
                  (Default: Saved as Drafts)
                </span>
              </div>
            </div>

            {bulkError && (
              <div className="bg-rose-950/40 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{bulkError}</span>
              </div>
            )}

            {/* Start Bulk Import Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleStartBulk}
                disabled={submittingBulk || uniqueUrls.length === 0}
                className="bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-rose-950/40"
              >
                {submittingBulk ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Initiating Batch...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Start Bulk Import ({uniqueUrls.length} Products)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Active Batch Progress Monitor */}
          {activeJob && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">
                      Batch Import Monitor ({activeJob.id.slice(0, 8)})
                    </h3>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        activeJob.status === "COMPLETED"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : activeJob.status === "PROCESSING"
                          ? "bg-amber-500/20 text-amber-300 animate-pulse"
                          : activeJob.status === "CANCELLED"
                          ? "bg-slate-800 text-slate-400"
                          : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {activeJob.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Started at {new Date(activeJob.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {activeJob.status === "PROCESSING" && (
                    <button
                      onClick={handleCancelJob}
                      className="bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition"
                    >
                      <StopCircle className="w-3.5 h-3.5" />
                      <span>Cancel Batch</span>
                    </button>
                  )}
                  {["FAILED", "PARTIAL"].includes(activeJob.status) && (
                    <button
                      onClick={handleRetryJob}
                      className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry Failed</span>
                    </button>
                  )}
                  <a
                    href={`/api/v1/admin/imports/meesho/history?format=csv`}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </a>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>Batch Completion Progress</span>
                  <span className="text-white">
                    {activeJob.stats?.total > 0
                      ? Math.round(
                          (activeJob.stats.processed / activeJob.stats.total) * 100
                        )
                      : 0}
                    % ({activeJob.stats?.processed || 0} / {activeJob.stats?.total || 0})
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-amber-500 h-full transition-all duration-500"
                    style={{
                      width: `${
                        activeJob.stats?.total > 0
                          ? Math.round(
                              (activeJob.stats.processed / activeJob.stats.total) * 100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Total
                  </span>
                  <span className="text-base font-black text-white">
                    {activeJob.stats?.total || 0}
                  </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Extracted
                  </span>
                  <span className="text-base font-black text-emerald-400">
                    {activeJob.stats?.success || 0}
                  </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Published
                  </span>
                  <span className="text-base font-black text-rose-400">
                    {activeJob.stats?.published || 0}
                  </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Drafts
                  </span>
                  <span className="text-base font-black text-slate-300">
                    {activeJob.stats?.drafts || 0}
                  </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Skipped
                  </span>
                  <span className="text-base font-black text-amber-400">
                    {activeJob.stats?.skipped || 0}
                  </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Failed
                  </span>
                  <span className="text-base font-black text-rose-500">
                    {activeJob.stats?.failed || 0}
                  </span>
                </div>
              </div>

              {/* Items List in Active Job */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Source URL / ID</th>
                      <th className="p-3">Title</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Images</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-medium">
                    {activeJob.items?.map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-900/50">
                        <td className="p-3 max-w-xs truncate font-mono text-[11px] text-slate-300">
                          {item.sourceProductId || item.sourceUrl}
                        </td>
                        <td className="p-3 max-w-xs truncate text-white font-bold">
                          {item.title || "Processing..."}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              item.status === "PUBLISHED"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : item.status === "IMPORTED_DRAFT"
                                ? "bg-slate-800 text-slate-300"
                                : item.status === "DUPLICATE_SKIPPED"
                                ? "bg-amber-500/20 text-amber-300"
                                : item.status === "FAILED"
                                ? "bg-rose-500/20 text-rose-300"
                                : "bg-blue-500/20 text-blue-300"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 font-semibold">
                          {item.imagesDownloaded} / {item.imagesFound}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.productId ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openProductEditModal(item.productId, item.title)}
                                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 font-bold px-2.5 py-1 rounded-lg text-[11px] transition flex items-center gap-1"
                                  title="Edit Product Details & Images"
                                >
                                  <Pencil className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>
                                {item.status !== "PUBLISHED" && (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickApproveProduct(item.productId)}
                                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 font-bold px-2 py-1 rounded-lg text-[11px] transition flex items-center gap-1"
                                    title="Quick Publish / Approve"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Approve</span>
                                  </button>
                                )}
                                <Link
                                  href={`/admin/products`}
                                  className="text-slate-400 hover:text-white font-bold text-[11px] px-1.5 py-1"
                                  title="View Catalog"
                                >
                                  Catalog
                                </Link>
                              </>
                            ) : (
                              <span className="text-slate-500 text-[11px]">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION C: IMPORT HISTORY & AUDIT                         */}
      {/* ========================================================= */}
      {activeTab === "history" && (
        <div className="space-y-6">
          {/* Filter Bar & Export */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search title, URL, or ID..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchHistory()}
                  className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <select
                value={historyFilterStatus}
                onChange={(e) => {
                  setHistoryFilterStatus(e.target.value);
                  setHistoryPage(1);
                }}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="IMPORTED_DRAFT">Draft</option>
                <option value="DUPLICATE_SKIPPED">Duplicate Skipped</option>
                <option value="FAILED">Failed</option>
              </select>

              <button
                onClick={() => fetchHistory()}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold px-3 py-1.5 rounded-xl text-xs transition"
              >
                Filter
              </button>
            </div>

            <a
              href="/api/v1/admin/imports/meesho/history?format=csv"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition self-start sm:self-auto shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Full History (CSV)</span>
            </a>
          </div>

          {/* History Table */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-4">Imported Product</th>
                    <th className="p-4">Source ID & URL</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Gallery</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-medium">
                  {historyLoading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        Loading import history...
                      </td>
                    </tr>
                  ) : historyItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-500">
                        No import history found. Start your first import!
                      </td>
                    </tr>
                  ) : (
                    historyItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/50 transition">
                        <td className="p-4">
                          <span className="font-bold text-white block max-w-xs line-clamp-1">
                            {item.title || "Untitled Product"}
                          </span>
                          {item.errorDetails && (
                            <span className="text-[10px] text-rose-400 block mt-0.5 line-clamp-1">
                              {item.errorDetails}
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <span className="font-mono text-amber-400 block font-bold text-[11px]">
                            {item.sourceProductId || "N/A"}
                          </span>
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-slate-500 hover:text-slate-300 truncate max-w-[180px] block"
                          >
                            {item.sourceUrl}
                          </a>
                        </td>

                        <td className="p-4 font-bold text-white">
                          ₹{item.sourcePrice?.toFixed(0) || "—"}
                        </td>

                        <td className="p-4 text-slate-300">
                          {item.imagesDownloaded} / {item.imagesFound} img
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              item.status === "PUBLISHED"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : item.status === "IMPORTED_DRAFT"
                                ? "bg-slate-800 text-slate-300"
                                : item.status === "DUPLICATE_SKIPPED"
                                ? "bg-amber-500/20 text-amber-300"
                                : item.status === "FAILED"
                                ? "bg-rose-500/20 text-rose-300"
                                : "bg-blue-500/20 text-blue-300"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="p-4 text-slate-400 text-[11px]">
                          {new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.productId ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openProductEditModal(item.productId, item.title)}
                                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 font-bold px-2.5 py-1 rounded-lg text-[11px] transition flex items-center gap-1"
                                  title="Edit Product Details & Images"
                                >
                                  <Pencil className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>
                                {item.status !== "PUBLISHED" && (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickApproveProduct(item.productId)}
                                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 font-bold px-2 py-1 rounded-lg text-[11px] transition flex items-center gap-1"
                                    title="Quick Publish / Approve"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Approve</span>
                                  </button>
                                )}
                                <Link
                                  href="/admin/products"
                                  className="text-slate-400 hover:text-white font-bold text-[11px] px-1.5 py-1"
                                  title="View Catalog"
                                >
                                  Catalog
                                </Link>
                              </>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => handleReimportItem(item.id)}
                              className="text-slate-400 hover:text-rose-400 font-bold p-1 text-[11px] transition"
                              title="Re-import / Refresh"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {historyTotalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-800 text-xs">
                <span className="text-slate-400">
                  Page {historyPage} of {historyTotalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={historyPage <= 1}
                    onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                    className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-300 font-bold px-3 py-1.5 rounded-lg"
                  >
                    Previous
                  </button>
                  <button
                    disabled={historyPage >= historyTotalPages}
                    onClick={() => setHistoryPage((p) => p + 1)}
                    className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-300 font-bold px-3 py-1.5 rounded-lg"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PRODUCT DETAILS & IMAGES EDIT MODAL (BULK & HISTORY)      */}
      {/* ========================================================= */}
      {(editingModalProduct || loadingEditModal) && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    Edit Product Details & Images
                    {editingModalProduct?.id && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-normal">
                        ID: {editingModalProduct.id.slice(0, 8)}...
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Customize titles, real pricing, categories, specifications, and gallery photos before or after publishing.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingModalProduct(null);
                  setLoadingEditModal(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {loadingEditModal ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 font-semibold">Loading product information...</p>
                </div>
              ) : (
                <>
                  {/* Alert messages */}
                  {editModalError && (
                    <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3.5 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{editModalError}</span>
                    </div>
                  )}
                  {editModalSuccessMsg && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-xl text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{editModalSuccessMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Core Fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          Product Title <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={editModalTitle}
                          onChange={(e) => setEditModalTitle(e.target.value)}
                          placeholder="e.g. Traditional Gold Plated Jhumka Earrings"
                          className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-300 block mb-1">
                            Target Category <span className="text-rose-400">*</span>
                          </label>
                          <select
                            value={editModalCategoryId}
                            onChange={(e) => setEditModalCategoryId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                          >
                            <option value="">Keep / Auto-Detect</option>
                            {categories.map((c: any) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-300 block mb-1">Brand / Supplier</label>
                          <input
                            type="text"
                            value={editModalBrand}
                            onChange={(e) => setEditModalBrand(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-300 block mb-1">
                            Selling Price (₹) <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={editModalSellingPrice}
                            onChange={(e) => setEditModalSellingPrice(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-300 block mb-1">MRP Price (₹)</label>
                          <input
                            type="number"
                            min="0"
                            value={editModalMrp}
                            onChange={(e) => setEditModalMrp(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-300 block mb-1">Stock (Units)</label>
                          <input
                            type="number"
                            min="0"
                            value={editModalStock}
                            onChange={(e) => setEditModalStock(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Discount helper badge */}
                      {Number(editModalMrp) > Number(editModalSellingPrice) && Number(editModalMrp) > 0 && (
                        <div className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center justify-between font-bold">
                          <span>Calculated Discount:</span>
                          <span>
                            {Math.round(
                              ((Number(editModalMrp) - Number(editModalSellingPrice)) / Number(editModalMrp)) * 100
                            )}
                            % OFF
                          </span>
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          Product Highlights (One per line)
                        </label>
                        <textarea
                          rows={3}
                          value={editModalHighlights}
                          onChange={(e) => setEditModalHighlights(e.target.value)}
                          placeholder="Premium Quality Brass Finish&#10;Skin friendly & Lightweight&#10;Traditional Indian Festive wear"
                          className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">Description</label>
                        <textarea
                          rows={4}
                          value={editModalDescription}
                          onChange={(e) => setEditModalDescription(e.target.value)}
                          placeholder="Comprehensive description of product materials, styling advice, and maintenance..."
                          className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none leading-relaxed"
                        />
                      </div>

                      {/* Specifications Editor */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-slate-300">Specifications / Attributes</label>
                          <button
                            type="button"
                            onClick={() => setEditModalSpecs([...editModalSpecs, { key: "", value: "" }])}
                            className="text-[10px] text-rose-400 hover:text-rose-300 font-bold bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded transition"
                          >
                            + Add Field
                          </button>
                        </div>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {editModalSpecs.map((spec, sIdx) => (
                            <div key={sIdx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                placeholder="Attribute (e.g. Color)"
                                value={spec.key}
                                onChange={(e) => {
                                  const next = [...editModalSpecs];
                                  next[sIdx].key = e.target.value;
                                  setEditModalSpecs(next);
                                }}
                                className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                              />
                              <input
                                type="text"
                                placeholder="Value (e.g. Golden)"
                                value={spec.value}
                                onChange={(e) => {
                                  const next = [...editModalSpecs];
                                  next[sIdx].value = e.target.value;
                                  setEditModalSpecs(next);
                                }}
                                className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setEditModalSpecs(editModalSpecs.filter((_, idx) => idx !== sIdx))}
                                className="p-1 text-slate-500 hover:text-rose-400"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Image Gallery Manager */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                            <span>Product Image Gallery ({editModalImages.length})</span>
                          </label>
                          <span className="text-[10px] text-slate-500">First image is storefront cover</span>
                        </div>

                        {/* Image Thumbnails Grid */}
                        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3 min-h-[220px]">
                          {editModalImages.length === 0 ? (
                            <div className="py-12 text-center text-slate-500 text-xs">
                              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                              No images in gallery yet. Add image URLs or upload below.
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {editModalImages.map((imgUrl, idx) => (
                                <div
                                  key={idx}
                                  className={`relative group rounded-xl overflow-hidden border ${
                                    idx === 0
                                      ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-500/5"
                                      : "border-slate-800 bg-slate-950"
                                  }`}
                                >
                                  <div className="aspect-square w-full overflow-hidden flex items-center justify-center bg-black">
                                    <img
                                      src={imgUrl}
                                      alt={`Product image ${idx + 1}`}
                                      className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                                      onError={(e: any) => {
                                        e.target.src = "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500";
                                      }}
                                    />
                                  </div>

                                  {/* Badge for cover */}
                                  {idx === 0 ? (
                                    <div className="absolute top-1 left-1 bg-rose-500 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow">
                                      ★ Primary Cover
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleModalSetPrimaryImage(idx)}
                                      className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 bg-black/80 hover:bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded transition shadow"
                                    >
                                      Make Cover
                                    </button>
                                  )}

                                  {/* Action buttons on hover */}
                                  <div className="absolute bottom-1 right-1 flex items-center gap-1 bg-black/80 p-1 rounded-lg backdrop-blur-sm opacity-90 group-hover:opacity-100 transition">
                                    {idx > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => handleModalMoveImage(idx, idx - 1)}
                                        className="p-1 hover:text-white text-slate-400"
                                        title="Move Left"
                                      >
                                        <MoveLeft className="w-3 h-3" />
                                      </button>
                                    )}
                                    {idx < editModalImages.length - 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleModalMoveImage(idx, idx + 1)}
                                        className="p-1 hover:text-white text-slate-400"
                                        title="Move Right"
                                      >
                                        <MoveRight className="w-3 h-3" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleModalRemoveImage(idx)}
                                      className="p-1 hover:text-rose-400 text-slate-400"
                                      title="Remove Image"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Add Image by URL */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">Add Image URL</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="https://images.meesho.com/... or https://..."
                            value={newEditModalImageUrl}
                            onChange={(e) => setNewEditModalImageUrl(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleModalAddImageUrl()}
                            className="flex-1 bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleModalAddImageUrl}
                            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Upload from Local Computer */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">
                          Or Upload Image File from PC
                        </label>
                        <label className="flex items-center justify-center gap-2 w-full border border-dashed border-slate-800 hover:border-rose-500/50 bg-slate-900/50 hover:bg-slate-900 p-3 rounded-xl cursor-pointer text-xs font-semibold text-slate-300 transition">
                          <Upload className="w-4 h-4 text-rose-400" />
                          <span>{uploadingModalImage ? "Uploading image..." : "Choose Image (JPG, PNG, WEBP)"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingModalImage}
                            onChange={handleModalUploadImage}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Moderation Status Preview */}
                      <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl space-y-2">
                        <label className="text-xs font-bold text-slate-300 block">Catalog Publication Status</label>
                        <div className="flex gap-3">
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                            <input
                              type="radio"
                              name="modalStatus"
                              checked={editModalStatus === "DRAFT"}
                              onChange={() => setEditModalStatus("DRAFT")}
                              className="accent-rose-500"
                            />
                            <span>Draft (In Moderation)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-emerald-400 font-bold">
                            <input
                              type="radio"
                              name="modalStatus"
                              checked={editModalStatus === "APPROVED"}
                              onChange={() => setEditModalStatus("APPROVED")}
                              className="accent-emerald-500"
                            />
                            <span>Approved (Live on Storefront)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => {
                  setEditingModalProduct(null);
                  setLoadingEditModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={savingEditModal || loadingEditModal}
                  onClick={() => handleSaveModalEdit("DRAFT")}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save as Draft</span>
                </button>
                <button
                  type="button"
                  disabled={savingEditModal || loadingEditModal}
                  onClick={() => handleSaveModalEdit("APPROVED")}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:opacity-50 shadow-lg shadow-rose-500/20 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{savingEditModal ? "Saving changes..." : "Save & Publish"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
