import { useState, useEffect } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  X,
  Upload,
  Check,
  AlertCircle,
  Loader2,
  AlertTriangle,
  Calendar,
  Info,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const getToken = () => localStorage.getItem("tn_token");

const CATEGORIES = [
  "Beach",
  "Mountain",
  "Cultural",
  "Adventure",
  "Wildlife",
  "Luxury",
];

const EMPTY_FORM = {
  title: "",
  location: "",
  duration: "",
  price: "",
  slots: "",
  category: "Beach",
  description: "",
  rating: "4.5",
  tourStartDate: "",
  tourEndDate: "",
};

const categoryEmoji = (cat) =>
  ({
    Beach: "🏖️",
    Mountain: "🏔️",
    Cultural: "🏛️",
    Adventure: "🧗",
    Wildlife: "🦁",
    Luxury: "💎",
  })[cat] || "✈️";
const categoryBg = (cat) =>
  ({
    Beach: "from-sky-300 to-sky-500",
    Mountain: "from-violet-400 to-indigo-500",
    Cultural: "from-amber-400 to-orange-500",
    Adventure: "from-green-400 to-emerald-600",
    Wildlife: "from-orange-400 to-red-500",
    Luxury: "from-yellow-300 to-amber-500",
  })[cat] || "from-sky-300 to-sky-500";
const getImageSrc = (pkg) => pkg?.imageUrl || pkg?.image || null;

// ── Tour date warning calculator ──
const getTourWarning = (tourStartDate) => {
  if (!tourStartDate) return null;
  const today = new Date();
  const tourDate = new Date(tourStartDate);
  const daysLeft = Math.ceil((tourDate - today) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0)
    return {
      level: "error",
      color: "border-red-300 bg-red-50",
      icon: "🚫",
      text: "Tour date is in the past! Please select a future date.",
    };
  if (daysLeft < 7)
    return {
      level: "error",
      color: "border-red-300 bg-red-50",
      icon: "🔴",
      text: `Only ${daysLeft} days left — Bookings will be DISABLED. Users cannot book this package.`,
    };
  if (daysLeft < 14)
    return {
      level: "warning",
      color: "border-amber-300 bg-amber-50",
      icon: "🟡",
      text: `${daysLeft} days left — Users will have less than 7 days to cancel for a refund. Not recommended.`,
    };
  if (daysLeft < 30)
    return {
      level: "caution",
      color: "border-yellow-300 bg-yellow-50",
      icon: "⚠️",
      text: `${daysLeft} days left — Partial refund window. Recommend publishing 30+ days before tour.`,
    };
  return {
    level: "good",
    color: "border-green-300 bg-green-50",
    icon: "🟢",
    text: `${daysLeft} days — Great! Users get full 7-day cancellation window with 100% refund.`,
  };
};

// Booking deadline = tourStartDate - 7 days
const getBookingDeadline = (tourStartDate) => {
  if (!tourStartDate) return null;
  const d = new Date(tourStartDate);
  d.setDate(d.getDate() - 7);
  return d.toISOString().split("T")[0];
};

const AdminPackages = () => {
  const [pkgs, setPkgs] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPkg, setEditPkg] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    fetchPackages();
  }, []);

  const normalizePackage = (p) => ({
    ...p,
    slots: p.availableSlots ?? p.slots ?? 0,
    availableSlots: p.availableSlots ?? p.slots ?? 0,
    tourStartDate: p.tourStartDate || "",
    tourEndDate: p.tourEndDate || "",
    bookingDeadline: p.bookingDeadline || "",
  });

  const fetchPackages = async () => {
    setPageLoading(true);
    try {
      const res = await fetch(`${API}/packages`);
      const data = await res.json();
      setPkgs((Array.isArray(data) ? data : []).map(normalizePackage));
    } catch {
      setApiError("Failed to load packages.");
    } finally {
      setPageLoading(false);
    }
  };

  const openAdd = () => {
    setEditPkg(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview("");
    setErrors({});
    setApiError("");
    setShowModal(true);
  };

  const openEdit = (pkg) => {
    setEditPkg(pkg);
    setForm({
      title: pkg.title || "",
      location: pkg.location || "",
      duration: pkg.duration || "",
      price: String(pkg.price || ""),
      slots: String(pkg.availableSlots ?? pkg.slots ?? ""),
      category: pkg.category || "Beach",
      description: pkg.description || "",
      tourStartDate: pkg.tourStartDate || "",
      tourEndDate: pkg.tourEndDate || "",
      rating: String(pkg.rating || "4.5"),
      tourStartDate: pkg.tourStartDate || "",
      tourEndDate: pkg.tourEndDate || "",
    });
    setImagePreview(getImageSrc(pkg) || "");
    setImageFile(null);
    setErrors({});
    setApiError("");
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    if (errors.image) setErrors((er) => ({ ...er, image: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.duration.trim()) e.duration = "Duration is required";
    if (!form.tourStartDate) e.tourStartDate = "Tour start date is required";
    if (!form.tourEndDate) e.tourEndDate = "Tour end date is required";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
      e.price = "Valid price required";
    if (!form.slots || isNaN(form.slots) || Number(form.slots) <= 0)
      e.slots = "Valid slots required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!editPkg && !imageFile) e.image = "Please upload an image";
    return e;
  };

  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(`${API}/admin/upload-image`, {
      method: "POST",
      headers: authHeader(),
      body: fd,
    });

    if (!res.ok) throw new Error("Image upload failed");

    const data = await res.json();

    // Cloudinary already returns full URL
    return data.imageUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    // Block if tour is less than 7 days away
    const warning = getTourWarning(form.tourStartDate);
    if (warning?.level === "error") {
      setApiError(
        "Cannot save: Tour date is too close or in the past. Minimum 7 days required.",
      );
      return;
    }

    setSubmitting(true);
    setApiError("");
    try {
      let imageUrl = imagePreview;
      if (imageFile) imageUrl = await uploadImage(imageFile);

      const payload = {
        title: form.title,
        location: form.location,
        duration: form.duration,
        price: Number(form.price),
        availableSlots: Number(form.slots),
        category: form.category,
        description: form.description,
        rating: Number(form.rating),
        imageUrl,
        tourStartDate: form.tourStartDate,
        tourEndDate: form.tourEndDate,
        bookingDeadline: getBookingDeadline(form.tourStartDate),
      };

      if (editPkg) {
        const res = await fetch(`${API}/admin/packages/${editPkg.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Update failed");
        const updated = await res.json();
        setPkgs((prev) => prev.map((p) => (p.id === editPkg.id ? updated : p)));
        flash("Package updated! ✅");
      } else {
        const res = await fetch(`${API}/admin/packages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Create failed");
        const created = await res.json();
        setPkgs((prev) => [created, ...prev]);
        flash("Package added! ✅");
      }
      setShowModal(false);
    } catch (err) {
      setApiError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/admin/packages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setPkgs((prev) => prev.filter((p) => p.id !== id));
      setDeleteId(null);
      flash("Package deleted.");
    } catch {
      setApiError("Delete failed.");
      setDeleteId(null);
    }
  };

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };
  const onChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: "" }));
  };

  const tourWarning = getTourWarning(form.tourStartDate);
  const bookingDeadline = getBookingDeadline(form.tourStartDate);

  // Auto-calculate duration from tour dates
  const getAutoDuration = (start, end) => {
    if (!start || !end) return "";
    const days =
      Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
    const nights = days - 1;
    return `${days} Days / ${nights} Nights`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-800">
            Manage Packages
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {pkgs.length} packages total
          </p>
        </div>
        <button
          onClick={openAdd}
          className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5"
        >
          <Plus size={16} /> Add New Package
        </button>
      </div>

      {/* Policy Info Banner */}
      <div className="mb-5 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 flex items-start gap-3 text-sm">
        <Info size={16} className="text-sky-500 flex-shrink-0 mt-0.5" />
        <div className="text-sky-700">
          <span className="font-semibold">Publishing Guidelines: </span>
          Publish packages <span className="font-bold">30+ days</span> before
          tour for best bookings. Minimum{" "}
          <span className="font-bold">7 days</span> required (booking deadline
          auto-set). Cancellation policy:{" "}
          <span className="font-bold">
            Full refund if cancelled 7+ days before tour.
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
          <Check size={15} /> {successMsg}
        </div>
      )}
      {apiError && !showModal && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          ⚠️ {apiError}
        </div>
      )}

      {/* Table */}
      {pageLoading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 size={20} className="animate-spin" /> Loading...
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Package",
                    "Location",
                    "Tour Dates",
                    "Price",
                    "Deadline",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-slate-400 text-xs uppercase font-semibold tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pkgs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-16 text-slate-400"
                    >
                      <div className="text-3xl mb-2">📦</div> No packages yet.
                      Add your first!
                    </td>
                  </tr>
                ) : (
                  pkgs.map((p) => {
                    const imgSrc = getImageSrc(p);
                    const warning = p.tourStartDate
                      ? getTourWarning(p.tourStartDate)
                      : null;
                    const deadline =
                      p.bookingDeadline || getBookingDeadline(p.tourStartDate);
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 relative">
                              {imgSrc ? (
                                <img
                                  src={imgSrc}
                                  alt={p.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-full h-full bg-gradient-to-br ${categoryBg(p.category)} items-center justify-center text-lg ${imgSrc ? "hidden" : "flex"}`}
                              >
                                {categoryEmoji(p.category)}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-slate-800 text-sm line-clamp-1">
                                {p.title}
                              </span>
                              {warning && (
                                <span
                                  className={`text-xs ${warning.level === "good" ? "text-green-500" : warning.level === "error" ? "text-red-500" : "text-amber-500"}`}
                                >
                                  {warning.icon}{" "}
                                  {warning.level === "error"
                                    ? "Booking disabled"
                                    : warning.level === "good"
                                      ? "Active"
                                      : "Limited window"}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {p.location}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {p.tourStartDate ? (
                            <div>
                              <div className="font-medium">
                                {p.tourStartDate}
                              </div>
                              {p.tourEndDate && (
                                <div className="text-slate-400">
                                  → {p.tourEndDate}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-sky-600">
                          ₹{Number(p.price).toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {deadline ? (
                            <span className="text-amber-600 font-medium">
                              {deadline}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full
                          ${warning?.level === "error" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}
                          >
                            {warning?.level === "error" ? "Disabled" : "Active"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEdit(p)}
                              className="p-1.5 rounded-lg hover:bg-sky-50 text-slate-400 hover:text-sky-500 transition-colors"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteId(p.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══ ADD / EDIT MODAL ══ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !submitting && setShowModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="font-display text-lg font-bold text-slate-800">
                {editPkg ? "✏️ Edit Package" : "➕ Add New Package"}
              </h3>
              <button
                onClick={() => !submitting && setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {apiError && (
              <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                ⚠️ {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              {/* Image */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                  Package Image {!editPkg && "*"}
                </label>
                <div className="flex gap-4 items-start">
                  <div className="w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload size={20} className="text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-600 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
                      <Upload size={15} />{" "}
                      {imagePreview ? "Change Image" : "Upload Image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="text-xs text-slate-400 mt-1.5">
                      JPG, PNG, WebP — max 10MB
                    </p>
                    {errors.image && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={11} />
                        {errors.image}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── TOUR DATES — Most important ── */}
              <div className="border-2 border-sky-100 rounded-xl p-4 bg-sky-50/30">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-3 uppercase tracking-wide">
                  <Calendar size={14} className="text-sky-500" /> Tour Dates *
                </label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Tour Start Date *
                    </label>
                    <input
                      type="date"
                      value={form.tourStartDate}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        setForm((f) => ({
                          ...f,
                          tourStartDate: newStart,
                          duration:
                            getAutoDuration(newStart, f.tourEndDate) ||
                            f.duration,
                        }));
                        if (errors.tourStartDate)
                          setErrors((er) => ({ ...er, tourStartDate: "" }));
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      className="form-input text-sm"
                    />
                    {errors.tourStartDate && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.tourStartDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Tour End Date *
                    </label>
                    <input
                      type="date"
                      value={form.tourEndDate}
                      onChange={(e) => {
                        const newEnd = e.target.value;
                        setForm((f) => ({
                          ...f,
                          tourEndDate: newEnd,
                          duration:
                            getAutoDuration(f.tourStartDate, newEnd) ||
                            f.duration,
                        }));
                        if (errors.tourEndDate)
                          setErrors((er) => ({ ...er, tourEndDate: "" }));
                      }}
                      min={
                        form.tourStartDate ||
                        new Date().toISOString().split("T")[0]
                      }
                      className="form-input text-sm"
                    />
                    {errors.tourEndDate && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.tourEndDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Booking deadline auto-preview */}
                {bookingDeadline && (
                  <div className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 mb-3">
                    📅 <span className="font-semibold">Booking Deadline:</span>{" "}
                    {bookingDeadline}
                    <span className="text-slate-400 ml-1">
                      (auto = start date − 7 days)
                    </span>
                  </div>
                )}

                {/* Tour warning */}
                {tourWarning && (
                  <div
                    className={`border rounded-xl px-3 py-2.5 text-xs font-medium ${tourWarning.color}`}
                  >
                    {tourWarning.icon} {tourWarning.text}
                  </div>
                )}

                {/* Cancellation policy reminder */}
                {form.tourStartDate && tourWarning?.level !== "error" && (
                  <div className="mt-2 text-xs text-slate-500 bg-white border border-slate-100 rounded-lg px-3 py-2">
                    <span className="font-semibold text-slate-700">
                      Cancellation Policy shown to users:
                    </span>
                    <span className="ml-1">
                      ✅ Full refund if cancelled 7+ days before tour · ❌ No
                      refund within 7 days
                    </span>
                  </div>
                )}
              </div>

              {/* Title + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Package Title *
                  </label>
                  <input
                    value={form.title}
                    onChange={onChange("title")}
                    placeholder="e.g. Goa Beach Getaway"
                    className="form-input text-sm"
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={onChange("category")}
                    className="form-input text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location + Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Location *
                  </label>
                  <input
                    value={form.location}
                    onChange={onChange("location")}
                    placeholder="e.g. Goa, India"
                    className="form-input text-sm"
                  />
                  {errors.location && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.location}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Duration *
                  </label>
                  <input
                    value={form.duration}
                    onChange={onChange("duration")}
                    placeholder="e.g. 5 Days / 4 Nights"
                    className="form-input text-sm"
                  />
                  {errors.duration && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.duration}
                    </p>
                  )}
                </div>
              </div>

              {/* Price + Slots + Rating */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={onChange("price")}
                    placeholder="18999"
                    className="form-input text-sm"
                    min="0"
                  />
                  {errors.price && (
                    <p className="text-xs text-red-500 mt-1">{errors.price}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Available Slots *
                  </label>
                  <input
                    type="number"
                    value={form.slots}
                    onChange={onChange("slots")}
                    placeholder="20"
                    className="form-input text-sm"
                    min="1"
                  />
                  {errors.slots && (
                    <p className="text-xs text-red-500 mt-1">{errors.slots}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Rating
                  </label>
                  <select
                    value={form.rating}
                    onChange={onChange("rating")}
                    className="form-input text-sm"
                  >
                    {[
                      "5.0",
                      "4.9",
                      "4.8",
                      "4.7",
                      "4.6",
                      "4.5",
                      "4.4",
                      "4.3",
                      "4.2",
                      "4.1",
                      "4.0",
                    ].map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={onChange("description")}
                  rows={3}
                  placeholder="Describe the package experience..."
                  className="form-input text-sm resize-none"
                />
                {errors.description && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => !submitting && setShowModal(false)}
                  disabled={submitting}
                  className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || tourWarning?.level === "error"}
                  className="flex-1 btn-primary py-2.5 text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      {editPkg ? "Updating..." : "Adding..."}
                    </>
                  ) : editPkg ? (
                    <>
                      <Pencil size={14} /> Update Package
                    </>
                  ) : (
                    <>
                      <Plus size={14} /> Add Package
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-800 mb-2">
              Delete Package?
            </h3>
            <p className="text-slate-500 text-sm mb-5">
              This will permanently remove the package from the database.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPackages;
