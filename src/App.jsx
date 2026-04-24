import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ShoppingCart,
  User,
  Phone,
  Bell,
  Clock3,
  Plus,
  Minus,
  ChefHat,
  LayoutDashboard,
  ClipboardList,
  Settings,
  QrCode,
  Store,
  Package,
  Sparkles,
  Image as ImageIcon,
  Palette,
  Upload,
  Lock,
  LogOut,
  Receipt,
  Printer,
  ShieldCheck,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  MessageCircle,
  Volume2,
} from "lucide-react";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDUJ-qIfHL-yZ_4cPXH_X0KMHAaCnrFZnk",
  authDomain: "krs-order.firebaseapp.com",
  projectId: "krs-order",
  storageBucket: "krs-order.firebasestorage.app",
  messagingSenderId: "193203781393",
  appId: "1:193203781393:web:686570cb267c7be4a496b0",
  measurementId: "G-J4XMCQ1B8W",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const defaultMenu = [
  {
    name: "سبانيش لاتيه",
    category: "القهوة",
    price: 18,
    available: true,
    prepTime: 4,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
    ],
    description: "قهوة مثلجة بحليب غني ولمسة كراميل ناعمة.",
  },
  {
    name: "آيس لاتيه",
    category: "القهوة",
    price: 16,
    available: true,
    prepTime: 3,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
    images: ["https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80"],
    description: "إسبريسو بارد مع حليب طازج وطعم متوازن.",
  },
  {
    name: "برغر لحم",
    category: "الوجبات",
    price: 28,
    available: true,
    prepTime: 9,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80",
    ],
    description: "برغر لحم طازج مع جبن وصوص خاص وخبز محمص.",
  },
  {
    name: "برغر دجاج",
    category: "الوجبات",
    price: 25,
    available: true,
    prepTime: 8,
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80",
    images: ["https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80"],
    description: "برغر دجاج مقرمش مع خس وصوص خفيف.",
  },
];

const defaultBrand = {
  brandName: "KRS Coffee Truck",
  logoUrl: "",
  primaryColor: "#0f0f10",
  accentColor: "#c8a96b",
  heroTitle: "اطلب مباشرة من المنيو",
  heroSubtitle: "امسح الباركود، اختر طلبك، ثم أرسل الطلب ليصل مباشرة إلى نظام الكوفي أو الفود ترك.",
  defaultTheme: "light",
};

const defaultRolePasswords = { admin: "1234" };

const statusMap = {
  new: { label: "جديد", bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
  preparing: { label: "قيد التحضير", bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" },
  ready: { label: "جاهز", bg: "#d1fae5", color: "#065f46", border: "#6ee7b7" },
  delivered: { label: "تم التسليم", bg: "#e5e7eb", color: "#374151", border: "#d1d5db" },
};

function money(value) {
  return `${Number(value || 0).toFixed(2)} د.إ`;
}

function orderTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateKey(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getCreatedAtDate(order) {
  if (order?.createdAt?.toDate) return order.createdAt.toDate();
  if (order?.createdAt?.seconds) return new Date(order.createdAt.seconds * 1000);
  return null;
}

function safeIncludes(v, q) {
  return String(v || "").toLowerCase().includes(String(q || "").toLowerCase());
}

function cleanPhoneForWhatsApp(phone) {
  let p = String(phone || "").replace(/[^0-9]/g, "");
  if (p.startsWith("0")) p = `971${p.slice(1)}`;
  if (!p.startsWith("971") && p.length === 9) p = `971${p}`;
  return p;
}

function getItemImages(item) {
  const list = Array.isArray(item?.images) ? item.images.filter(Boolean) : [];
  if (item?.image && !list.includes(item.image)) list.unshift(item.image);
  return list.length ? list : ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80"];
}

function normalizeImages(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") return value.split("\n").map((x) => x.trim()).filter(Boolean);
  return [];
}

function playOrderBeep() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.38);
  } catch (error) {
    console.log("Sound blocked until user interaction", error);
  }
}

const translations = {
  ar: {
    cart: "السلة",
    menu: "المنيو",
    searchMenu: "ابحث في المنيو",
    add: "إضافة",
    prepTime: "وقت التحضير",
    minutes: "دقائق",
    emptyCart: "السلة فارغة. اختر أصنافك من المنيو.",
    notifyReady: "إشعار عند الجاهزية",
    total: "الإجمالي",
    continueCheckout: "متابعة إلى تأكيد الطلب",
    confirmOrderData: "تأكيد بيانات الطلب",
    customerName: "اسم العميل",
    phone: "رقم الهاتف",
    generalNotes: "ملاحظات عامة على الطلب",
    back: "رجوع",
    confirmSend: "تأكيد وإرسال الطلب",
    sending: "جاري إرسال الطلب...",
    paymentMethod: "طريقة الدفع",
    applePay: "Apple Pay",
    card: "بطاقة",
    cash: "كاش",
    payOnPickup: "عند الاستلام",
    itemNote: "ملاحظات هذا الصنف",
    theme: "الثيم",
    light: "نهاري",
    dark: "ليلي",
    language: "اللغة",
    arabic: "العربية",
    english: "English",
    readyTime: "مدة تجهيز تقريبية",
    orderHint: "بعد إرسال الطلب سيصل مباشرة إلى نظام الكوفي، وعند تجهيز الطلب يمكن التواصل معك.",
    descriptionFallback: "صنف مميز من قائمة الكوفي أو التراك.",
    customerPageSubtitle: "اختر طلبك من المنيو وأرسله مباشرة.",
  },
  en: {
    cart: "Cart",
    menu: "Menu",
    searchMenu: "Search menu",
    add: "Add",
    prepTime: "Prep time",
    minutes: "mins",
    emptyCart: "Your cart is empty. Choose items from the menu.",
    notifyReady: "Notify when ready",
    total: "Total",
    continueCheckout: "Continue to checkout",
    confirmOrderData: "Confirm order details",
    customerName: "Customer name",
    phone: "Phone number",
    generalNotes: "General order notes",
    back: "Back",
    confirmSend: "Confirm and send",
    sending: "Sending order...",
    paymentMethod: "Payment method",
    applePay: "Apple Pay",
    card: "Card",
    cash: "Cash",
    payOnPickup: "Pay on pickup",
    itemNote: "Item notes",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    language: "Language",
    arabic: "Arabic",
    english: "English",
    readyTime: "Estimated prep time",
    orderHint: "After sending, the order goes directly to the coffee truck system.",
    descriptionFallback: "A featured item from the coffee truck menu.",
    customerPageSubtitle: "Choose your order from the menu and send it directly.",
  },
};

function useViewport() {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1440);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return { width, isMobile: width <= 768, isTablet: width > 768 && width <= 1024 };
}

const styles = {
  app: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, rgba(200,169,107,0.10), transparent 18%), linear-gradient(to bottom, #f8f6f1, #ffffff, #f3f4f6)",
    color: "#0f172a",
    direction: "rtl",
    fontFamily: "Arial, sans-serif",
  },
  container: { maxWidth: 1360, margin: "0 auto", padding: 16 },
  card: {
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderRadius: 28,
    padding: 20,
    boxShadow: "0 10px 35px rgba(15, 23, 42, 0.07)",
    border: "1px solid rgba(226,232,240,0.9)",
  },
  button: {
    background: "#111111",
    color: "white",
    border: "none",
    borderRadius: 16,
    padding: "12px 18px",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
  },
  buttonSecondary: {
    background: "white",
    color: "#111111",
    border: "1px solid #d1d5db",
    borderRadius: 16,
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid #d1d5db",
    fontSize: 14,
    boxSizing: "border-box",
    background: "#fff",
  },
  textarea: {
    width: "100%",
    minHeight: 100,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid #d1d5db",
    fontSize: 14,
    boxSizing: "border-box",
    resize: "vertical",
    background: "#fff",
  },
  menuCard: {
    border: "1px solid #ececec",
    borderRadius: 26,
    overflow: "hidden",
    background: "white",
    boxShadow: "0 14px 30px rgba(0,0,0,0.05)",
  },
  menuImage: { width: "100%", height: 180, objectFit: "cover", display: "block", cursor: "zoom-in" },
  categoryChip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 14px",
    borderRadius: 999,
    background: "#f5f5f4",
    border: "1px solid #e7e5e4",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
};

function SectionTitle({ icon, title, sub }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ background: "#111111", color: "white", borderRadius: 18, padding: 12 }}>{icon}</div>
      <div>
        <h2 style={{ margin: 0, fontSize: 28 }}>{title}</h2>
        {sub ? <p style={{ margin: "6px 0 0", color: "#64748b" }}>{sub}</p> : null}
      </div>
    </div>
  );
}

function MetricCard({ label, value, accent = "#111111" }) {
  return (
    <div style={{ ...styles.card, borderRadius: 24, padding: 18, background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.98))", borderTop: `4px solid ${accent}` }}>
      <div style={{ color: "#64748b", fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>{value}</div>
    </div>
  );
}

function getModeFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("mode") || "customer";
}

function printableReportHTML({ brandName, reportDate, sales, orderCount, deliveredCount, items }) {
  const rows = items.map((item, idx) => `<tr><td>${idx + 1}</td><td>${item.name}</td><td>${item.qty}</td><td>${money(item.sales)}</td></tr>`).join("");
  return `<html dir="rtl" lang="ar"><head><meta charset="UTF-8" /><title>تقرير المبيعات اليومية</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#111;background:#fff}.head{border:1px solid #ddd;border-radius:18px;padding:20px;margin-bottom:20px}h1,h2,p{margin:0 0 10px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0}.box{border:1px solid #ddd;border-radius:14px;padding:16px;background:#fafafa}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #ddd;padding:12px;text-align:right}th{background:#f5f5f5}</style></head><body><div class="head"><h1>${brandName}</h1><p>تقرير المبيعات اليومية</p><p>التاريخ: ${reportDate}</p></div><div class="grid"><div class="box"><strong>إجمالي المبيعات</strong><br/>${money(sales)}</div><div class="box"><strong>عدد الطلبات اليوم</strong><br/>${orderCount}</div><div class="box"><strong>الطلبات المسلّمة</strong><br/>${deliveredCount}</div></div><h2>الأصناف الأكثر مبيعاً</h2><table><thead><tr><th>#</th><th>الصنف</th><th>الكمية</th><th>المبيعات</th></tr></thead><tbody>${rows || '<tr><td colspan="4">لا توجد بيانات اليوم</td></tr>'}</tbody></table></body></html>`;
}

export default function App() {
  const { isMobile, isTablet } = useViewport();
  const [mode, setMode] = useState(getModeFromURL());
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [brand, setBrand] = useState(defaultBrand);
  const [rolePasswords, setRolePasswords] = useState(defaultRolePasswords);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemImage, setNewItemImage] = useState("");
  const [newItemImagesText, setNewItemImagesText] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [gatePassword, setGatePassword] = useState("");
  const [gateError, setGateError] = useState("");
  const [searchOrder, setSearchOrder] = useState("");
  const [reportDate, setReportDate] = useState(formatDateKey(new Date()));
  const [language, setLanguage] = useState("ar");
  const [theme, setTheme] = useState(defaultBrand.defaultTheme || "light");
  const [paymentMethod, setPaymentMethod] = useState("apple_pay");
  const [gallery, setGallery] = useState(null);
  const [successOrder, setSuccessOrder] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const previousOrderCount = useRef(null);
  const t = translations[language] || translations.ar;

  const [roleSession, setRoleSession] = useState(() => sessionStorage.getItem("krs-admin-unlocked") === "true");

  useEffect(() => {
    sessionStorage.setItem("krs-admin-unlocked", roleSession ? "true" : "false");
  }, [roleSession]);

  useEffect(() => {
    const setupData = async () => {
      try {
        const currentMenu = await getDocs(collection(db, "menu"));
        if (currentMenu.empty) for (const item of defaultMenu) await addDoc(collection(db, "menu"), { ...item, createdAt: serverTimestamp() });
        await setDoc(doc(db, "settings", "brand"), defaultBrand, { merge: true });
        await setDoc(doc(db, "settings", "roles"), defaultRolePasswords, { merge: true });
      } catch (error) {
        console.error(error);
      }
    };
    setupData();

    const unsubMenu = onSnapshot(query(collection(db, "menu")), (snapshot) => {
      setMenu(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setIsLoading(false);
    }, (error) => {
      setErrorMessage("تعذر تحميل المنيو من Firebase");
      setIsLoading(false);
      console.error(error);
    });

    const unsubOrders = onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc")), (snapshot) => {
      setOrders(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (error) => {
      setErrorMessage("تعذر تحميل الطلبات من Firebase");
      console.error(error);
    });

    const unsubBrand = onSnapshot(doc(db, "settings", "brand"), (snapshot) => {
      if (snapshot.exists()) setBrand({ ...defaultBrand, ...snapshot.data() });
    });

    const unsubRoles = onSnapshot(doc(db, "settings", "roles"), (snapshot) => {
      if (snapshot.exists()) setRolePasswords({ ...defaultRolePasswords, ...snapshot.data() });
    });

    return () => {
      unsubMenu();
      unsubOrders();
      unsubBrand();
      unsubRoles();
    };
  }, []);

  useEffect(() => {
    if (previousOrderCount.current === null) {
      previousOrderCount.current = orders.length;
      return;
    }
    if ((mode === "cashier" || mode === "kitchen") && soundEnabled && orders.length > previousOrderCount.current) {
      playOrderBeep();
    }
    previousOrderCount.current = orders.length;
  }, [orders.length, mode, soundEnabled]);

  const categories = useMemo(() => ["الكل", ...Array.from(new Set(menu.map((item) => item.category).filter(Boolean)))], [menu]);
  const availableMenu = useMemo(() => menu.filter((item) => {
    const matchesSearch = safeIncludes(item.name, search) || safeIncludes(item.category, search);
    const matchesCategory = selectedCategory === "الكل" || item.category === selectedCategory;
    return item.available && matchesSearch && matchesCategory;
  }), [menu, search, selectedCategory]);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0), [cart]);
  const totalOrders = orders.length;
  const newOrders = orders.filter((o) => o.status === "new").length;
  const preparingOrders = orders.filter((o) => o.status === "preparing").length;
  const readyOrders = orders.filter((o) => o.status === "ready").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const totalSales = orders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + Number(o.total || 0), 0);
  const todayOrders = useMemo(() => orders.filter((order) => formatDateKey(getCreatedAtDate(order)) === reportDate), [orders, reportDate]);
  const todayDeliveredOrders = useMemo(() => todayOrders.filter((order) => order.status === "delivered"), [todayOrders]);
  const todaySales = useMemo(() => todayDeliveredOrders.reduce((sum, order) => sum + Number(order.total || 0), 0), [todayDeliveredOrders]);
  const topItemsToday = useMemo(() => {
    const map = new Map();
    todayDeliveredOrders.forEach((order) => (order.items || []).forEach((item) => {
      const current = map.get(item.name) || { name: item.name, qty: 0, sales: 0 };
      current.qty += Number(item.qty || 0);
      current.sales += Number(item.qty || 0) * Number(item.price || 0);
      map.set(item.name, current);
    }));
    return Array.from(map.values()).sort((a, b) => b.qty - a.qty);
  }, [todayDeliveredOrders]);

  const filteredOrders = useMemo(() => {
    if (!searchOrder.trim()) return orders;
    return orders.filter((order) => safeIncludes(order.orderCode, searchOrder) || safeIncludes(order.customerName, searchOrder) || safeIncludes(order.phone, searchOrder));
  }, [orders, searchOrder]);

  const primaryColor = brand.primaryColor || "#111111";
  const accentColor = brand.accentColor || "#c8a96b";
  const isDark = theme === "dark";
  const pageBg = isDark ? "radial-gradient(circle at top, rgba(200,169,107,0.12), transparent 18%), linear-gradient(to bottom, #0b0b0c, #121316, #0b0b0c)" : "radial-gradient(circle at top, rgba(200,169,107,0.10), transparent 18%), linear-gradient(to bottom, #f8f6f1, #ffffff, #f3f4f6)";
  const panelBg = isDark ? "rgba(18,18,20,0.92)" : "rgba(255,255,255,0.92)";
  const textColor = isDark ? "#f8fafc" : "#0f172a";
  const mutedColor = isDark ? "#cbd5e1" : "#64748b";
  const customerGridColumns = isMobile ? "1fr" : "minmax(0, 1.8fr) minmax(320px, 0.95fr)";
  const customerMenuGridColumns = isMobile ? "1fr" : isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(auto-fit, minmax(250px, 1fr))";
  const metricGridColumns = isMobile ? "1fr 1fr" : "repeat(4, 1fr)";
  const orderGridColumns = isMobile ? "1fr" : "1fr 1fr";
  const renderAdminGate = mode === "admin" && !roleSession;

  const addToCart = (item) => setCart((prev) => {
    const exists = prev.find((p) => p.id === item.id);
    if (exists) return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
    return [...prev, { id: item.id, name: item.name, price: Number(item.price), qty: 1, image: getItemImages(item)[0] || "", images: getItemImages(item), itemNote: "" }];
  });

  const updateQty = (id, delta) => setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0));
  const updateCartItemNote = (id, value) => setCart((prev) => prev.map((item) => (item.id === id ? { ...item, itemNote: value } : item)));

  const uploadImageAndSetUrl = async (file, onDone) => {
    if (!file) return;
    try {
      setIsUploadingImage(true);
      setErrorMessage("");
      const fileName = `${Date.now()}-${file.name}`;
      const storageRef = ref(storage, `menu-images/${fileName}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      onDone(downloadURL);
    } catch (error) {
      setErrorMessage("فشل رفع الصورة إلى Firebase Storage");
      console.error(error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const uploadImageToExistingItem = async (item, file) => {
    await uploadImageAndSetUrl(file, async (url) => {
      const oldImages = getItemImages(item);
      const newImages = [...oldImages, url].filter(Boolean);
      await updateDoc(doc(db, "menu", item.id), { image: oldImages[0] || url, images: newImages, updatedAt: serverTimestamp() });
    });
  };

  const placeOrder = async () => {
    if (!customerName.trim() || !phone.trim() || cart.length === 0) return;
    try {
      setIsSaving(true);
      setErrorMessage("");
      const orderCount = await getDocs(collection(db, "orders"));
      const nextOrderNumber = 100 + orderCount.size + 1;
      const orderCode = `KRS-${nextOrderNumber}`;
      await addDoc(collection(db, "orders"), {
        orderCode,
        customerName,
        phone,
        notes,
        items: cart,
        total: cartTotal,
        paymentMethod,
        truckName: brand.brandName,
        notifyCustomer,
        status: "new",
        createdAt: serverTimestamp(),
        createdAtLabel: orderTime(),
      });
      setSuccessOrder({ orderCode, customerName, total: cartTotal });
      setCart([]);
      setNotes("");
      setCustomerName("");
      setPhone("");
      setNotifyCustomer(true);
      setPaymentMethod("apple_pay");
      setIsCheckoutOpen(false);
    } catch (error) {
      setErrorMessage("فشل إرسال الطلب إلى النظام الحقيقي");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const sendReadyWhatsApp = (order) => {
    const phoneNumber = cleanPhoneForWhatsApp(order.phone);
    if (!phoneNumber) {
      alert("رقم الهاتف غير صحيح");
      return;
    }
    const msg = `مرحباً ${order.customerName || "عميلنا"} 👋\nطلبك رقم ${order.orderCode || ""} جاهز للاستلام ☕🍔\nشكراً لطلبك من ${brand.brandName}`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const setOrderStatus = async (orderId, status) => {
    try {
      setErrorMessage("");
      await updateDoc(doc(db, "orders", orderId), { status, updatedAt: serverTimestamp() });
    } catch (error) {
      setErrorMessage("فشل تحديث حالة الطلب");
      console.error(error);
    }
  };

  const markReadyAndWhatsApp = async (order) => {
    await setOrderStatus(order.id, "ready");
    sendReadyWhatsApp(order);
  };

  const toggleAvailability = async (itemId, currentValue) => {
    try {
      setErrorMessage("");
      await updateDoc(doc(db, "menu", itemId), { available: !currentValue, updatedAt: serverTimestamp() });
    } catch (error) {
      setErrorMessage("فشل تحديث حالة الصنف");
      console.error(error);
    }
  };

  const updateMenuItemField = async (itemId, field, value) => {
    try {
      setErrorMessage("");
      await updateDoc(doc(db, "menu", itemId), { [field]: value, updatedAt: serverTimestamp() });
    } catch (error) {
      setErrorMessage("فشل تعديل بيانات الصنف");
      console.error(error);
    }
  };

  const deleteMenuItem = async (itemId) => {
    if (!window.confirm("هل تريد حذف هذا الصنف؟")) return;
    try {
      await deleteDoc(doc(db, "menu", itemId));
    } catch (error) {
      setErrorMessage("فشل حذف الصنف");
      console.error(error);
    }
  };

  const addMenuItem = async () => {
    if (!newItemName.trim() || !newItemCategory.trim() || !newItemPrice.trim()) return;
    try {
      setErrorMessage("");
      const images = normalizeImages(newItemImagesText);
      if (newItemImage && !images.includes(newItemImage)) images.unshift(newItemImage);
      await addDoc(collection(db, "menu"), {
        name: newItemName,
        category: newItemCategory,
        price: Number(newItemPrice),
        available: true,
        prepTime: 5,
        image: images[0] || newItemImage,
        images,
        description: newItemDescription,
        createdAt: serverTimestamp(),
      });
      setNewItemName("");
      setNewItemCategory("");
      setNewItemPrice("");
      setNewItemImage("");
      setNewItemImagesText("");
      setNewItemDescription("");
    } catch (error) {
      setErrorMessage("فشل إضافة الصنف الجديد");
      console.error(error);
    }
  };

  const saveBrandSettings = async () => {
    try {
      setErrorMessage("");
      await setDoc(doc(db, "settings", "brand"), brand, { merge: true });
    } catch (error) {
      setErrorMessage("فشل حفظ إعدادات البراند");
      console.error(error);
    }
  };

  const saveRolePasswords = async () => {
    try {
      setErrorMessage("");
      await setDoc(doc(db, "settings", "roles"), rolePasswords, { merge: true });
    } catch (error) {
      setErrorMessage("فشل حفظ كلمات المرور");
      console.error(error);
    }
  };

  const logoutAdmin = () => {
    setRoleSession(false);
    setMode("customer");
  };

  const tryOpenMode = (nextMode) => {
    setMode(nextMode);
    setGateError("");
    setGatePassword("");
  };

  const submitGate = () => {
    const actual = rolePasswords?.admin || "";
    if (gatePassword === actual) {
      setRoleSession(true);
      setGateError("");
      setGatePassword("");
    } else {
      setGateError("كلمة المرور غير صحيحة");
    }
  };

  const visibleOrders = useMemo(() => {
    const base = filteredOrders;
    if (mode === "kitchen") return base.filter((o) => o.status === "new" || o.status === "preparing");
    if (mode === "pickup") return base.filter((o) => o.status === "ready");
    return base;
  }, [filteredOrders, mode]);

  const printDailyReport = () => {
    const html = printableReportHTML({ brandName: brand.brandName, reportDate, sales: todaySales, orderCount: todayOrders.length, deliveredCount: todayDeliveredOrders.length, items: topItemsToday });
    const win = window.open("", "_blank", "width=1200,height=900");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  const openGallery = (item, startIndex = 0) => setGallery({ title: item.name, images: getItemImages(item), index: startIndex });
  const closeGallery = () => setGallery(null);
  const nextGallery = () => setGallery((g) => g ? { ...g, index: (g.index + 1) % g.images.length } : g);
  const prevGallery = () => setGallery((g) => g ? { ...g, index: (g.index - 1 + g.images.length) % g.images.length } : g);

  const InternalHeader = () => (
    <>
      <div style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #141414 58%, ${accentColor} 100%)`, color: "white", borderRadius: 30, padding: isMobile ? 18 : 24, boxShadow: "0 16px 40px rgba(0,0,0,0.16)", marginBottom: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ flex: "1 1 420px" }}>
            <div style={{ display: "inline-flex", gap: 8, alignItems: "center", background: "rgba(255,255,255,0.1)", padding: "10px 14px", borderRadius: 999, fontSize: 14 }}><Sparkles size={16} /> نظام مباشر مربوط بـ Firebase</div>
            <h1 style={{ fontSize: isMobile ? 28 : 46, margin: "16px 0 10px" }}>{brand.brandName}</h1>
            <p style={{ color: "rgba(255,255,255,0.84)", lineHeight: 1.9, maxWidth: 780, margin: 0 }}>لوحة النظام الداخلي للطلبات والمبيعات والتقارير.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, minmax(140px, 1fr))", gap: 12, flex: "1 1 420px", width: "100%" }}>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 24, padding: 18 }}><div style={{ color: "rgba(255,255,255,0.72)" }}>إجمالي الطلبات</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{totalOrders}</div></div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 24, padding: 18 }}><div style={{ color: "rgba(255,255,255,0.72)" }}>طلبات جديدة</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{newOrders}</div></div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 24, padding: 18 }}><div style={{ color: "rgba(255,255,255,0.72)" }}>جاهز</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{readyOrders}</div></div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 24, padding: 18 }}><div style={{ color: "rgba(255,255,255,0.72)" }}>مبيعات مسلمة</div><div style={{ fontSize: isMobile ? 20 : 28, fontWeight: 800, marginTop: 8 }}>{money(totalSales)}</div></div>
          </div>
        </div>
      </div>
      <div style={{ ...styles.card, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[["customer", "العميل", <QrCode size={16} />], ["cashier", "الاستقبال", <LayoutDashboard size={16} />], ["kitchen", "المطبخ", <ChefHat size={16} />], ["pickup", "الاستلام", <Bell size={16} />], ["admin", "الإدارة", <Settings size={16} />]].map(([value, label, icon]) => (
            <button key={String(value)} onClick={() => tryOpenMode(String(value))} style={{ ...styles.buttonSecondary, background: mode === value ? primaryColor : "white", color: mode === value ? "white" : "#111111", display: "flex", alignItems: "center", gap: 8 }}>
              {icon}{label}{value === "admin" ? roleSession ? <ShieldCheck size={15} /> : <Lock size={15} /> : null}
            </button>
          ))}
          {(mode === "cashier" || mode === "kitchen") ? <button style={{ ...styles.buttonSecondary, display: "flex", alignItems: "center", gap: 8 }} onClick={() => { setSoundEnabled(true); playOrderBeep(); }}><Volume2 size={16} /> تفعيل صوت الطلبات</button> : null}
        </div>
      </div>
    </>
  );

  const CustomerView = () => (
    <div style={{ display: "grid", gridTemplateColumns: customerGridColumns, gap: 24, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ ...styles.card, background: panelBg, color: textColor, padding: 0, overflow: "hidden" }}>
          <div style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #262626 72%, ${accentColor} 100%)`, color: "white", padding: isMobile ? 18 : 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
                {brand.logoUrl ? <img src={brand.logoUrl} alt={brand.brandName} style={{ width: isMobile ? 60 : 74, height: isMobile ? 60 : 74, objectFit: "cover", borderRadius: 22, border: "2px solid rgba(255,255,255,0.25)" }} /> : <div style={{ width: isMobile ? 60 : 74, height: isMobile ? 60 : 74, borderRadius: 22, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,0.2)", flexShrink: 0 }}><Store size={30} /></div>}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "inline-flex", gap: 8, alignItems: "center", background: "rgba(255,255,255,0.1)", padding: "8px 12px", borderRadius: 999, fontSize: 13, maxWidth: "100%" }}><Store size={15} /><span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{brand.brandName}</span></div>
                  <h2 style={{ margin: "14px 0 8px", fontSize: isMobile ? 24 : 34 }}>{brand.heroTitle}</h2>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.78)", lineHeight: 1.8, maxWidth: 720, fontSize: isMobile ? 14 : 16 }}>{brand.heroSubtitle}</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, width: isMobile ? "100%" : 280 }}>
                <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 22, padding: 18 }}><div style={{ fontSize: 13, color: "rgba(255,255,255,0.72)" }}>{t.readyTime}</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>5 - 12 {language === "ar" ? "دقيقة" : "min"}</div></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{ ...styles.buttonSecondary, background: "rgba(255,255,255,0.92)" }}>{t.theme}: {isDark ? t.dark : t.light}</button>
                  <button onClick={() => setLanguage(language === "ar" ? "en" : "ar")} style={{ ...styles.buttonSecondary, background: "rgba(255,255,255,0.92)" }}>{t.language}: {language === "ar" ? t.arabic : t.english}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ ...styles.card, background: panelBg, color: textColor }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: isMobile ? "stretch" : "center", flexWrap: "wrap", marginBottom: 18 }}>
            <div><div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: isMobile ? 22 : 28, marginBottom: 6 }}><ClipboardList size={20} /> {t.menu}</div><div style={{ color: mutedColor }}>{t.customerPageSubtitle}</div></div>
            <div style={{ minWidth: isMobile ? "100%" : 260 }}><div style={{ position: "relative" }}><Search size={16} style={{ position: "absolute", top: 14, right: language === "ar" ? 12 : "auto", left: language === "en" ? 12 : "auto", color: "#94a3b8" }} /><input style={{ ...styles.input, paddingRight: language === "ar" ? 36 : 14, paddingLeft: language === "en" ? 36 : 14, background: isDark ? "#111827" : "#fff", color: textColor }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchMenu} /></div></div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>{categories.map((category) => <button key={category} onClick={() => setSelectedCategory(category)} style={{ ...styles.categoryChip, background: selectedCategory === category ? primaryColor : isDark ? "#111827" : "#f5f5f4", color: selectedCategory === category ? "white" : textColor, border: selectedCategory === category ? `1px solid ${primaryColor}` : "1px solid #e7e5e4", whiteSpace: "nowrap" }}>{category}</button>)}</div>
          <div style={{ display: "grid", gridTemplateColumns: customerMenuGridColumns, gap: 18 }}>
            {availableMenu.map((item) => {
              const images = getItemImages(item);
              return <div key={item.id} style={{ ...styles.menuCard, background: isDark ? "#111827" : "#fff", color: textColor }}>
                <div style={{ position: "relative" }}><img src={images[0]} alt={item.name} style={{ ...styles.menuImage, height: isMobile ? 200 : 180 }} onClick={() => openGallery(item, 0)} />{images.length > 1 ? <div style={{ position: "absolute", bottom: 10, left: 10, background: "rgba(0,0,0,0.62)", color: "white", borderRadius: 999, padding: "6px 10px", fontSize: 12 }}>{images.length} صور</div> : null}</div>
                {images.length > 1 ? <div style={{ display: "flex", gap: 6, padding: "10px 12px 0", overflowX: "auto" }}>{images.slice(0, 5).map((img, idx) => <img key={img + idx} src={img} alt="" onClick={() => openGallery(item, idx)} style={{ width: 46, height: 46, borderRadius: 10, objectFit: "cover", cursor: "pointer", border: idx === 0 ? `2px solid ${accentColor}` : "1px solid #e5e7eb" }} />)}</div> : null}
                <div style={{ padding: 16 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}><div><div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 800 }}>{item.name}</div><div style={{ color: mutedColor, marginTop: 6 }}>{item.category}</div></div><div style={{ fontWeight: 800, fontSize: 16, color: primaryColor, whiteSpace: "nowrap" }}>{money(item.price)}</div></div><div style={{ color: mutedColor, marginTop: 10, lineHeight: 1.7, minHeight: 48, fontSize: 14 }}>{item.description || t.descriptionFallback}</div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, gap: 10 }}><div style={{ color: mutedColor, fontSize: 13 }}>{t.prepTime}: {item.prepTime} {t.minutes}</div><button style={{ ...styles.button, background: primaryColor, minWidth: 94 }} onClick={() => addToCart(item)}>{t.add}</button></div></div>
              </div>;
            })}
          </div>
        </div>
      </div>
      <div>
        <div style={{ ...styles.card, background: panelBg, color: textColor, position: isMobile ? "relative" : "sticky", top: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontWeight: 800, fontSize: isMobile ? 22 : 28, marginBottom: 16 }}><span style={{ display: "flex", alignItems: "center", gap: 8 }}><ShoppingCart size={20} /> {t.cart}</span><span style={{ fontSize: 14, color: mutedColor }}>{cart.length} {language === "ar" ? "صنف" : "item"}</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {cart.length === 0 ? <div style={{ border: "1px solid #e5e7eb", borderRadius: 18, padding: 16, color: mutedColor, background: isDark ? "#0f172a" : "#fafaf9" }}>{t.emptyCart}</div> : cart.map((item) => <div key={item.id} style={{ border: "1px solid #e5e7eb", borderRadius: 18, padding: 16 }}><div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>{item.image ? <img src={item.image} alt={item.name} style={{ width: 62, height: 62, borderRadius: 14, objectFit: "cover", flexShrink: 0 }} /> : null}<div style={{ flex: 1, minWidth: 0 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}><div style={{ minWidth: 0 }}><div style={{ fontWeight: 700 }}>{item.name}</div><div style={{ color: mutedColor, marginTop: 4 }}>{money(item.price * item.qty)}</div></div><div style={{ display: "flex", gap: 8, alignItems: "center" }}><button style={styles.buttonSecondary} onClick={() => updateQty(item.id, -1)}><Minus size={16} /></button><div style={{ minWidth: 18, textAlign: "center" }}>{item.qty}</div><button style={styles.buttonSecondary} onClick={() => updateQty(item.id, 1)}><Plus size={16} /></button></div></div><div style={{ marginTop: 10 }}><label style={{ display: "block", marginBottom: 6, color: mutedColor, fontSize: 13 }}>{t.itemNote}</label><textarea style={{ ...styles.textarea, minHeight: 76, background: isDark ? "#111827" : "#fff", color: textColor }} value={item.itemNote || ""} onChange={(e) => updateCartItemNote(item.id, e.target.value)} placeholder={language === "ar" ? "مثال: بدون مخلل / زيادة ثلج / حار خفيف" : "Example: no pickles / extra ice / less spicy"} /></div></div></div></div>)}
            <div style={{ border: "1px solid #e5e7eb", background: isDark ? "#0f172a" : "#fafaf9", borderRadius: 18, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}><span>{t.notifyReady}</span><input type="checkbox" checked={notifyCustomer} onChange={(e) => setNotifyCustomer(e.target.checked)} /></div>
            <div style={{ background: primaryColor, color: "white", borderRadius: 18, padding: 16, display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 18 }}><span>{t.total}</span><span>{money(cartTotal)}</span></div>
            {!isCheckoutOpen ? <button style={{ ...styles.button, background: primaryColor, width: "100%", padding: isMobile ? "14px 18px" : "12px 18px" }} onClick={() => setIsCheckoutOpen(true)} disabled={cart.length === 0}>{t.continueCheckout}</button> : <div style={{ border: `1px solid ${accentColor}`, borderRadius: 18, padding: 16, background: isDark ? "#111827" : "#fffdf8" }}><div style={{ fontWeight: 800, marginBottom: 12, fontSize: 18 }}>{t.confirmOrderData}</div><div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}><div><label style={{ display: "block", marginBottom: 8, color: mutedColor }}>{t.customerName}</label><input style={{ ...styles.input, background: isDark ? "#0f172a" : "#fff", color: textColor }} value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={language === "ar" ? "اكتب اسمك" : "Enter your name"} /></div><div><label style={{ display: "block", marginBottom: 8, color: mutedColor }}>{t.phone}</label><input style={{ ...styles.input, background: isDark ? "#0f172a" : "#fff", color: textColor }} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XXXXXXXX" /></div><div><label style={{ display: "block", marginBottom: 8, color: mutedColor }}>{t.paymentMethod}</label><div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 10 }}>{[["apple_pay", t.applePay], ["card", t.card], ["cash", t.cash], ["pickup", t.payOnPickup]].map(([value, label]) => <button key={value} type="button" onClick={() => setPaymentMethod(value)} style={{ ...styles.buttonSecondary, background: paymentMethod === value ? primaryColor : isDark ? "#0f172a" : "#fff", color: paymentMethod === value ? "#fff" : textColor, border: paymentMethod === value ? `1px solid ${primaryColor}` : "1px solid #d1d5db", padding: "12px 10px" }}>{label}</button>)}</div></div><div><label style={{ display: "block", marginBottom: 8, color: mutedColor }}>{t.generalNotes}</label><textarea style={{ ...styles.textarea, minHeight: 90, background: isDark ? "#0f172a" : "#fff", color: textColor }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={language === "ar" ? "مثال: أتواجد أمام السيارة البيضاء / بدون أدوات / وقت الاستلام..." : "Example: I am near the white car / no utensils / pickup time..."} /></div></div><div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 10, marginTop: 14 }}><button style={{ ...styles.buttonSecondary, flex: 1 }} onClick={() => setIsCheckoutOpen(false)}>{t.back}</button><button style={{ ...styles.button, background: primaryColor, flex: 1, opacity: isSaving ? 0.7 : 1 }} onClick={placeOrder} disabled={!customerName || !phone || cart.length === 0 || isSaving}>{isSaving ? t.sending : t.confirmSend}</button></div></div>}
            <div style={{ color: mutedColor, lineHeight: 1.8, fontSize: 14 }}>{t.orderHint}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const OrdersView = () => (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: metricGridColumns, gap: 16, marginBottom: 24 }}><MetricCard label="طلبات جديدة" value={newOrders} accent={accentColor} /><MetricCard label="قيد التحضير" value={preparingOrders} accent={primaryColor} /><MetricCard label="جاهز" value={readyOrders} accent="#059669" /><MetricCard label="تم التسليم" value={deliveredOrders} accent="#6b7280" /></div>
      <div style={styles.card}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}><SectionTitle icon={mode === "cashier" ? <LayoutDashboard size={20} /> : mode === "kitchen" ? <ChefHat size={20} /> : <Bell size={20} />} title={mode === "cashier" ? "لوحة الاستقبال داخل الكوفي" : mode === "kitchen" ? "شاشة المطبخ والتحضير" : "شاشة الاستلام والنداء"} sub={mode === "cashier" ? "هذه الشاشة تستقبل الطلبات من جوالات العملاء مباشرة" : mode === "kitchen" ? "تعرض الطلبات المطلوب تحضيرها فقط" : "تعرض الطلبات الجاهزة للتسليم"} /><div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><input style={{ ...styles.input, width: isMobile ? "100%" : 260 }} value={searchOrder} onChange={(e) => setSearchOrder(e.target.value)} placeholder="بحث برقم الطلب أو الاسم أو الهاتف" /></div></div>
        <div style={{ display: "grid", gridTemplateColumns: orderGridColumns, gap: 16, marginTop: 20 }}>{visibleOrders.map((order) => <div key={order.id} style={{ border: "1px solid #e5e7eb", borderRadius: 24, padding: 18, boxShadow: "0 4px 14px rgba(0,0,0,0.04)" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}><div><div style={{ fontSize: 24, fontWeight: 800 }}>{order.orderCode || order.id}</div><div style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569", marginTop: 8 }}><User size={16} /> {order.customerName}</div><div style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569", marginTop: 6 }}><Phone size={16} /> {order.phone}</div><div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", marginTop: 6, fontSize: 14 }}><Clock3 size={16} /> {order.createdAtLabel || "الآن"}</div></div><div style={{ background: statusMap[order.status]?.bg, color: statusMap[order.status]?.color, border: `1px solid ${statusMap[order.status]?.border}`, padding: "8px 12px", borderRadius: 999, fontWeight: 700 }}>{statusMap[order.status]?.label}</div></div><div style={{ border: "1px solid #e5e7eb", background: "#fafaf9", borderRadius: 18, padding: 16, marginTop: 16 }}>{(order.items || []).map((item, idx) => <div key={`${order.id}-${idx}`} style={{ borderBottom: idx !== (order.items || []).length - 1 ? "1px solid #e5e7eb" : "none", paddingBottom: 8, marginBottom: 8 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, gap: 12 }}><span>{item.name} × {item.qty}</span><span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{money(Number(item.price) * item.qty)}</span></div>{item.itemNote ? <div style={{ color: "#64748b", fontSize: 13 }}>ملاحظة الصنف: {item.itemNote}</div> : null}</div>)}</div>{order.notes ? <div style={{ border: "1px solid #e5e7eb", borderRadius: 18, padding: 14, marginTop: 12 }}>ملاحظات عامة: {order.notes}</div> : null}<div style={{ background: primaryColor, color: "white", borderRadius: 18, padding: 16, display: "flex", justifyContent: "space-between", fontWeight: 800, marginTop: 12 }}><span>الإجمالي</span><span>{money(order.total)}</span></div><div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 8, marginTop: 12 }}><button style={styles.buttonSecondary} onClick={() => setOrderStatus(order.id, "new")}>جديد</button><button style={styles.buttonSecondary} onClick={() => setOrderStatus(order.id, "preparing")}>تحضير</button><button style={styles.buttonSecondary} onClick={() => setOrderStatus(order.id, "ready")}>جاهز</button><button style={styles.buttonSecondary} onClick={() => setOrderStatus(order.id, "delivered")}>تسليم</button></div><button style={{ ...styles.button, background: "#25D366", width: "100%", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={() => markReadyAndWhatsApp(order)}><MessageCircle size={16} /> جاهز + إرسال واتساب</button>{order.status === "ready" ? <button style={{ ...styles.buttonSecondary, width: "100%", marginTop: 8 }} onClick={() => sendReadyWhatsApp(order)}>إرسال واتساب فقط</button> : null}</div>)}</div>
      </div>
    </div>
  );

  const AdminView = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 0.8fr", gap: 24 }}>
        <div style={styles.card}><SectionTitle icon={<Palette size={20} />} title="هوية البراند في صفحة العميل" sub="من هنا تعدل الشعار واسم البراند والألوان التي تظهر للزبون" /><div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginTop: 20 }}><div><label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>اسم البراند</label><input style={styles.input} value={brand.brandName} onChange={(e) => setBrand((prev) => ({ ...prev, brandName: e.target.value }))} /></div><div><label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>رابط الشعار</label><input style={styles.input} value={brand.logoUrl} onChange={(e) => setBrand((prev) => ({ ...prev, logoUrl: e.target.value }))} placeholder="https://...logo.png" /></div><div><label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>اللون الأساسي</label><div style={{ display: "flex", gap: 10, alignItems: "center" }}><input type="color" value={brand.primaryColor} onChange={(e) => setBrand((prev) => ({ ...prev, primaryColor: e.target.value }))} style={{ width: 54, height: 44, border: "none", background: "transparent" }} /><input style={styles.input} value={brand.primaryColor} onChange={(e) => setBrand((prev) => ({ ...prev, primaryColor: e.target.value }))} /></div></div><div><label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>اللون الثانوي</label><div style={{ display: "flex", gap: 10, alignItems: "center" }}><input type="color" value={brand.accentColor} onChange={(e) => setBrand((prev) => ({ ...prev, accentColor: e.target.value }))} style={{ width: 54, height: 44, border: "none", background: "transparent" }} /><input style={styles.input} value={brand.accentColor} onChange={(e) => setBrand((prev) => ({ ...prev, accentColor: e.target.value }))} /></div></div><div style={{ gridColumn: "1 / -1" }}><label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>عنوان الصفحة للعميل</label><input style={styles.input} value={brand.heroTitle} onChange={(e) => setBrand((prev) => ({ ...prev, heroTitle: e.target.value }))} /></div><div style={{ gridColumn: "1 / -1" }}><label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>الوصف التعريفي</label><textarea style={styles.textarea} value={brand.heroSubtitle} onChange={(e) => setBrand((prev) => ({ ...prev, heroSubtitle: e.target.value }))} /></div><div style={{ gridColumn: "1 / -1" }}><button style={{ ...styles.button, background: primaryColor }} onClick={saveBrandSettings}>حفظ هوية البراند</button></div></div></div>
        <div style={styles.card}><SectionTitle icon={<Store size={20} />} title="معاينة سريعة" sub="هكذا تقريبًا ستظهر صفحة العميل" /><div style={{ marginTop: 20, borderRadius: 24, overflow: "hidden", border: "1px solid #e5e7eb" }}><div style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #262626 70%, ${accentColor} 100%)`, color: "white", padding: 18 }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}>{brand.logoUrl ? <img src={brand.logoUrl} alt={brand.brandName} style={{ width: 56, height: 56, borderRadius: 16, objectFit: "cover" }} /> : <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><Store size={24} /></div>}<div><div style={{ fontWeight: 800 }}>{brand.brandName}</div><div style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", marginTop: 4 }}>{brand.heroTitle}</div></div></div></div><div style={{ padding: 16, color: "#475569", lineHeight: 1.7 }}>{brand.heroSubtitle}</div></div></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24 }}>
        <div style={styles.card}><SectionTitle icon={<Lock size={20} />} title="كلمة مرور الإدارة" sub="الباسورد فقط على الإدارة" /><div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginTop: 18 }}><div><label style={{ display: "block", marginBottom: 6, color: "#64748b" }}>كلمة مرور الإدارة</label><input style={styles.input} type="password" value={rolePasswords.admin || ""} onChange={(e) => setRolePasswords((prev) => ({ ...prev, admin: e.target.value }))} /></div><div><button style={{ ...styles.button, background: primaryColor }} onClick={saveRolePasswords}>حفظ كلمة مرور الإدارة</button></div></div></div>
        <div style={styles.card}><SectionTitle icon={<Receipt size={20} />} title="تقرير المبيعات اليومية" sub="داخل الإدارة مع إمكانية اختيار التاريخ والطباعة" /><div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto", gap: 12, marginTop: 18, alignItems: "end" }}><div><label style={{ display: "block", marginBottom: 6, color: "#64748b" }}>تاريخ التقرير</label><input type="date" style={styles.input} value={reportDate} onChange={(e) => setReportDate(e.target.value)} /></div><button style={{ ...styles.button, background: primaryColor, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }} onClick={printDailyReport}><Printer size={16} /> طباعة التقرير</button></div><div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12, marginTop: 16 }}><MetricCard label="مبيعات اليوم" value={money(todaySales)} accent={accentColor} /><MetricCard label="عدد الطلبات" value={todayOrders.length} accent={primaryColor} /><MetricCard label="طلبات مسلّمة" value={todayDeliveredOrders.length} accent="#059669" /></div></div>
      </div>
      <div style={styles.card}><SectionTitle icon={<Package size={20} />} title="إدارة المنيو والصور" sub="يمكن إضافة أكثر من صورة للمنتج الواحد" /><div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>{menu.map((item) => { const images = getItemImages(item); return <div key={item.id} style={{ border: "1px solid #e5e7eb", borderRadius: 24, padding: 16, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "180px 1fr", gap: 16, alignItems: "start" }}><div><img src={images[0]} alt={item.name} style={{ width: "100%", height: 140, borderRadius: 18, objectFit: "cover", marginBottom: 10 }} /><div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>{images.slice(0, 6).map((img, idx) => <img key={img + idx} src={img} alt="" style={{ width: 38, height: 38, borderRadius: 8, objectFit: "cover", border: "1px solid #e5e7eb" }} />)}</div><div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}><div style={{ background: item.available ? "#d1fae5" : "#ffe4e6", color: item.available ? "#065f46" : "#9f1239", padding: "8px 12px", borderRadius: 999, fontWeight: 700, fontSize: 13 }}>{item.available ? "متاح" : "غير متاح"}</div><button style={styles.buttonSecondary} onClick={() => toggleAvailability(item.id, item.available)}>{item.available ? "إيقاف" : "تفعيل"}</button></div></div><div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}><div><label style={{ display: "block", marginBottom: 6, color: "#64748b", fontSize: 13 }}>اسم الصنف</label><input style={styles.input} value={item.name || ""} onChange={(e) => updateMenuItemField(item.id, "name", e.target.value)} /></div><div><label style={{ display: "block", marginBottom: 6, color: "#64748b", fontSize: 13 }}>التصنيف</label><input style={styles.input} value={item.category || ""} onChange={(e) => updateMenuItemField(item.id, "category", e.target.value)} /></div><div><label style={{ display: "block", marginBottom: 6, color: "#64748b", fontSize: 13 }}>السعر</label><input style={styles.input} value={item.price || ""} onChange={(e) => updateMenuItemField(item.id, "price", Number(e.target.value || 0))} /></div><div><label style={{ display: "block", marginBottom: 6, color: "#64748b", fontSize: 13 }}>وقت التحضير</label><input style={styles.input} value={item.prepTime || ""} onChange={(e) => updateMenuItemField(item.id, "prepTime", Number(e.target.value || 0))} /></div><div style={{ gridColumn: "1 / -1" }}><label style={{ display: "block", marginBottom: 6, color: "#64748b", fontSize: 13 }}>روابط الصور - كل رابط في سطر</label><textarea style={{ ...styles.textarea, minHeight: 90 }} value={images.join("\n")} onChange={(e) => { const arr = normalizeImages(e.target.value); updateDoc(doc(db, "menu", item.id), { images: arr, image: arr[0] || "", updatedAt: serverTimestamp() }); }} /><div style={{ display: "flex", gap: 10, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}><label style={{ ...styles.buttonSecondary, display: "inline-flex", alignItems: "center", gap: 8 }}><Upload size={16} /> رفع صورة وإضافتها للمنتج<input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => uploadImageToExistingItem(item, e.target.files?.[0])} /></label>{isUploadingImage ? <span style={{ color: "#64748b", fontSize: 13 }}>جاري الرفع...</span> : null}<button style={{ ...styles.buttonSecondary, color: "#b91c1c", display: "flex", gap: 8, alignItems: "center" }} onClick={() => deleteMenuItem(item.id)}><Trash2 size={16} /> حذف الصنف</button></div></div><div style={{ gridColumn: "1 / -1" }}><label style={{ display: "block", marginBottom: 6, color: "#64748b", fontSize: 13 }}>وصف الصنف</label><textarea style={{ ...styles.textarea, minHeight: 84 }} value={item.description || ""} onChange={(e) => updateMenuItemField(item.id, "description", e.target.value)} /></div></div></div>})}</div></div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24 }}><div style={styles.card}><SectionTitle icon={<Upload size={20} />} title="إضافة صنف جديد" sub="مع أكثر من صورة ووصف ليظهر مباشرة في المنيو" /><div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}><input style={styles.input} value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="اسم الصنف" /><input style={styles.input} value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} placeholder="التصنيف" /><input style={styles.input} value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} placeholder="السعر" /><input style={styles.input} value={newItemImage} onChange={(e) => setNewItemImage(e.target.value)} placeholder="رابط الصورة الرئيسية" /><textarea style={{ ...styles.textarea, minHeight: 90 }} value={newItemImagesText} onChange={(e) => setNewItemImagesText(e.target.value)} placeholder="روابط صور إضافية - كل رابط في سطر" /><div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}><label style={{ ...styles.buttonSecondary, display: "inline-flex", alignItems: "center", gap: 8 }}><Upload size={16} /> تحميل صورة مباشرة<input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => uploadImageAndSetUrl(e.target.files?.[0], (url) => { setNewItemImage(url); setNewItemImagesText((prev) => prev ? `${prev}\n${url}` : url); })} /></label>{isUploadingImage ? <span style={{ color: "#64748b", fontSize: 13 }}>جاري رفع الصورة...</span> : null}</div><textarea style={styles.textarea} value={newItemDescription} onChange={(e) => setNewItemDescription(e.target.value)} placeholder="وصف الصنف" /><button style={{ ...styles.button, background: primaryColor }} onClick={addMenuItem}>إضافة إلى المنيو</button></div></div><div style={styles.card}><SectionTitle icon={<ImageIcon size={20} />} title="ملاحظات النسخة" sub="التحديث الجديد" /><div style={{ marginTop: 18, color: "#475569", lineHeight: 2 }}>• إشعار صوتي عند وصول طلب جديد للكاشير والمطبخ.<br />• زر جاهز + إرسال واتساب.<br />• Popup للعميل بعد إرسال الطلب مع رقم الطلب.<br />• إمكانية تكبير صور المنتج والتنقل بينها.<br />• إضافة أكثر من صورة لكل منتج.<br />• حذف صنف من الإدارة.<br /></div><div style={{ marginTop: 18 }}><button style={{ ...styles.buttonSecondary, display: "flex", alignItems: "center", gap: 8 }} onClick={logoutAdmin}><LogOut size={16} /> تسجيل خروج الإدارة</button></div></div></div>
    </div>
  );

  return (
    <div style={{ ...styles.app, background: pageBg, color: textColor, direction: language === "ar" ? "rtl" : "ltr" }}>
      <div style={styles.container}>
        {mode !== "customer" ? <InternalHeader /> : null}
        {errorMessage ? <div style={{ ...styles.card, borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b", marginBottom: 24 }}>{errorMessage}</div> : null}
        {isLoading ? <div style={{ ...styles.card, marginBottom: 24 }}>جاري تحميل البيانات من Firebase...</div> : null}
        {renderAdminGate ? <div style={{ ...styles.card, maxWidth: 560, margin: "0 auto 24px" }}><SectionTitle icon={<Lock size={20} />} title="دخول الإدارة" sub="هذه الصفحة فقط محمية بكلمة مرور" /><div style={{ marginTop: 18 }}><label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>كلمة المرور</label><input style={styles.input} type="password" value={gatePassword} onChange={(e) => setGatePassword(e.target.value)} placeholder="ادخل كلمة المرور" onKeyDown={(e) => { if (e.key === "Enter") submitGate(); }} />{gateError ? <div style={{ marginTop: 10, color: "#b91c1c", fontWeight: 700 }}>{gateError}</div> : null}<div style={{ display: "flex", gap: 10, marginTop: 14 }}><button style={{ ...styles.button, background: primaryColor, flex: 1 }} onClick={submitGate}>دخول</button><button style={{ ...styles.buttonSecondary, flex: 1 }} onClick={() => { setMode("customer"); setGatePassword(""); setGateError(""); }}>رجوع للعميل</button></div></div></div> : null}
        {!renderAdminGate && mode === "customer" ? <CustomerView /> : null}
        {!renderAdminGate && (mode === "cashier" || mode === "kitchen" || mode === "pickup") ? <OrdersView /> : null}
        {!renderAdminGate && mode === "admin" ? <AdminView /> : null}
      </div>
      {gallery ? <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.86)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }} onClick={closeGallery}><div style={{ position: "relative", width: "min(980px, 100%)", maxHeight: "92vh" }} onClick={(e) => e.stopPropagation()}><button onClick={closeGallery} style={{ position: "absolute", top: -8, right: -8, zIndex: 2, ...styles.buttonSecondary, borderRadius: 999, padding: 10 }}><X size={20} /></button><div style={{ color: "white", marginBottom: 12, fontWeight: 800, fontSize: 18, textAlign: "center" }}>{gallery.title}</div><div style={{ position: "relative", background: "#111", borderRadius: 24, overflow: "hidden" }}><img src={gallery.images[gallery.index]} alt={gallery.title} style={{ width: "100%", maxHeight: "78vh", objectFit: "contain", display: "block" }} />{gallery.images.length > 1 ? <><button onClick={prevGallery} style={{ position: "absolute", top: "50%", right: 12, transform: "translateY(-50%)", ...styles.buttonSecondary, borderRadius: 999, padding: 10 }}><ChevronRight size={22} /></button><button onClick={nextGallery} style={{ position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)", ...styles.buttonSecondary, borderRadius: 999, padding: 10 }}><ChevronLeft size={22} /></button><div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.6)", color: "white", padding: "6px 12px", borderRadius: 999, fontSize: 13 }}>{gallery.index + 1} / {gallery.images.length}</div></> : null}</div></div></div> : null}
      {successOrder ? <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}><div style={{ ...styles.card, width: "min(460px, 100%)", textAlign: "center" }}><div style={{ width: 70, height: 70, borderRadius: 999, background: "#d1fae5", color: "#065f46", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 32 }}>✓</div><h2 style={{ margin: 0 }}>تم استلام طلبك</h2><p style={{ color: "#64748b", lineHeight: 1.8 }}>رقم الطلب الخاص بك:</p><div style={{ fontSize: 32, fontWeight: 900, color: primaryColor, marginBottom: 12 }}>{successOrder.orderCode}</div><div style={{ color: "#64748b", marginBottom: 18 }}>الإجمالي: {money(successOrder.total)}</div><button style={{ ...styles.button, background: primaryColor, width: "100%" }} onClick={() => setSuccessOrder(null)}>تم</button></div></div> : null}
    </div>
  );
}
