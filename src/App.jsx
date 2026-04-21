import React, { useEffect, useMemo, useState } from "react";
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
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDUJ-qIfHL-yZ_4cPXH_X0KMHAaCnrFZnk",
  authDomain: "krs-order.firebaseapp.com",
  projectId: "krs-order",
  storageBucket: "krs-order.firebasestorage.app",
  messagingSenderId: "193203781393",
  appId: "1:193203781393:web:686570cb267c7be4a496b0",
  measurementId: "G-J4XMCQ1B8W"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

const defaultMenu = [
  {
    name: "سبانيش لاتيه",
    category: "القهوة",
    price: 18,
    available: true,
    prepTime: 4,
    image:
      "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80",
    description: "قهوة مثلجة بحليب غني ولمسة كراميل ناعمة.",
  },
  {
    name: "آيس لاتيه",
    category: "القهوة",
    price: 16,
    available: true,
    prepTime: 3,
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
    description: "إسبريسو بارد مع حليب طازج وطعم متوازن.",
  },
  {
    name: "برغر لحم",
    category: "الوجبات",
    price: 28,
    available: true,
    prepTime: 9,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
    description: "برغر لحم طازج مع جبن وصوص خاص وخبز محمص.",
  },
  {
    name: "برغر دجاج",
    category: "الوجبات",
    price: 25,
    available: true,
    prepTime: 8,
    image:
      "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80",
    description: "برغر دجاج مقرمش مع خس وصوص خفيف.",
  },
  {
    name: "بطاطس",
    category: "الإضافات",
    price: 12,
    available: true,
    prepTime: 4,
    image:
      "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=900&q=80",
    description: "بطاطس ذهبية مقرمشة تقدم ساخنة.",
  },
  {
    name: "كرك",
    category: "المشروبات",
    price: 8,
    available: false,
    prepTime: 3,
    image:
      "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=900&q=80",
    description: "شاي كرك بنكهة غنية وتوابل مميزة.",
  },
  {
    name: "ماء",
    category: "المشروبات",
    price: 3,
    available: true,
    prepTime: 1,
    image:
      "https://images.unsplash.com/photo-1564419439244-61f879dd0c0d?auto=format&fit=crop&w=900&q=80",
    description: "مياه باردة ومنعشة.",
  },
  {
    name: "شاورما بوكس",
    category: "الوجبات",
    price: 24,
    available: true,
    prepTime: 7,
    image:
      "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=900&q=80",
    description: "شاورما دجاج مع بطاطس وصوص ثوم.",
  },
];

const defaultBrand = {
  brandName: "KRS Coffee Truck",
  logoUrl: "",
  primaryColor: "#111111",
  accentColor: "#c8a96b",
  heroTitle: "اطلب مباشرة من المنيو",
  heroSubtitle:
    "امسح الباركود، اختر طلبك، ثم أرسل الطلب ليصل مباشرة إلى نظام الكوفي أو الفود ترك.",
};

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

const styles = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom, #f5f5f4, #ffffff, #f5f5f4)",
    color: "#0f172a",
    direction: "rtl",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: 16,
  },
  card: {
    background: "white",
    borderRadius: 28,
    padding: 20,
    boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
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
  },
  customerMenuGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 18,
  },
  menuCard: {
    border: "1px solid #ececec",
    borderRadius: 26,
    overflow: "hidden",
    background: "white",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  },
  menuImage: {
    width: "100%",
    height: 180,
    objectFit: "cover",
    display: "block",
  },
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
  categoryChipActive: {
    background: "#111111",
    color: "white",
    border: "1px solid #111111",
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

function MetricCard({ label, value }) {
  return (
    <div style={{ ...styles.card, borderRadius: 24, padding: 18 }}>
      <div style={{ color: "#64748b", fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>{value}</div>
    </div>
  );
}

const getModeFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("mode") || "customer";
};

export default function App() {
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
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemImage, setNewItemImage] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const setupData = async () => {
      try {
        const currentMenu = await getDocs(collection(db, "menu"));
        if (currentMenu.empty) {
          for (const item of defaultMenu) {
            await addDoc(collection(db, "menu"), {
              ...item,
              createdAt: serverTimestamp(),
            });
          }
        }

        await setDoc(doc(db, "settings", "brand"), defaultBrand, { merge: true });
      } catch (error) {
        console.error(error);
      }
    };

    setupData();

    const menuQuery = query(collection(db, "menu"));
    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubMenu = onSnapshot(
      menuQuery,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMenu(items);
        setIsLoading(false);
      },
      (error) => {
        setErrorMessage("تعذر تحميل المنيو من Firebase");
        setIsLoading(false);
        console.error(error);
      }
    );

    const unsubOrders = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setOrders(items);
      },
      (error) => {
        setErrorMessage("تعذر تحميل الطلبات من Firebase");
        console.error(error);
      }
    );

    const unsubBrand = onSnapshot(
      doc(db, "settings", "brand"),
      (snapshot) => {
        if (snapshot.exists()) {
          setBrand({ ...defaultBrand, ...snapshot.data() });
        }
      },
      (error) => {
        console.error(error);
      }
    );

    return () => {
      unsubMenu();
      unsubOrders();
      unsubBrand();
    };
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(menu.map((item) => item.category).filter(Boolean)));
    return ["الكل", ...cats];
  }, [menu]);

  const availableMenu = useMemo(() => {
    return menu.filter((item) => {
      const matchesSearch = item.name?.includes(search) || item.category?.includes(search);
      const matchesCategory = selectedCategory === "الكل" || item.category === selectedCategory;
      return item.available && matchesSearch && matchesCategory;
    });
  }, [menu, search, selectedCategory]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
  }, [cart]);

  const totalOrders = orders.length;
  const newOrders = orders.filter((o) => o.status === "new").length;
  const preparingOrders = orders.filter((o) => o.status === "preparing").length;
  const readyOrders = orders.filter((o) => o.status === "ready").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const totalSales = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === item.id);
      if (exists) {
        return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: Number(item.price),
          qty: 1,
          image: item.image || "",
          itemNote: "",
        },
      ];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0));
  };

  const updateCartItemNote = (id, value) => {
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, itemNote: value } : item)));
  };

  const placeOrder = async () => {
    if (!customerName.trim() || !phone.trim() || cart.length === 0) return;

    try {
      setIsSaving(true);
      setErrorMessage("");

      const orderCount = await getDocs(collection(db, "orders"));
      const nextOrderNumber = 100 + orderCount.size + 1;

      await addDoc(collection(db, "orders"), {
        orderCode: `KRS-${nextOrderNumber}`,
        customerName,
        phone,
        notes,
        items: cart,
        total: cartTotal,
        truckName: brand.brandName,
        notifyCustomer,
        status: "new",
        createdAt: serverTimestamp(),
        createdAtLabel: orderTime(),
      });

      setCart([]);
      setNotes("");
      setCustomerName("");
      setPhone("");
      setNotifyCustomer(true);
    } catch (error) {
      setErrorMessage("فشل إرسال الطلب إلى النظام الحقيقي");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const setOrderStatus = async (orderId, status) => {
    try {
      setErrorMessage("");
      await updateDoc(doc(db, "orders", orderId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      setErrorMessage("فشل تحديث حالة الطلب");
      console.error(error);
    }
  };

  const toggleAvailability = async (itemId, currentValue) => {
    try {
      setErrorMessage("");
      await updateDoc(doc(db, "menu", itemId), {
        available: !currentValue,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      setErrorMessage("فشل تحديث حالة الصنف");
      console.error(error);
    }
  };

  const updateMenuItemField = async (itemId, field, value) => {
    try {
      setErrorMessage("");
      await updateDoc(doc(db, "menu", itemId), {
        [field]: value,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      setErrorMessage("فشل تعديل بيانات الصنف");
      console.error(error);
    }
  };

  const addMenuItem = async () => {
    if (!newItemName.trim() || !newItemCategory.trim() || !newItemPrice.trim()) return;

    try {
      setErrorMessage("");
      await addDoc(collection(db, "menu"), {
        name: newItemName,
        category: newItemCategory,
        price: Number(newItemPrice),
        available: true,
        prepTime: 5,
        image: newItemImage,
        description: newItemDescription,
        createdAt: serverTimestamp(),
      });
      setNewItemName("");
      setNewItemCategory("");
      setNewItemPrice("");
      setNewItemImage("");
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

  const visibleOrders = useMemo(() => {
    if (mode === "kitchen") return orders.filter((o) => o.status === "new" || o.status === "preparing");
    if (mode === "pickup") return orders.filter((o) => o.status === "ready");
    return orders;
  }, [orders, mode]);

  const primaryColor = brand.primaryColor || "#111111";
  const accentColor = brand.accentColor || "#c8a96b";

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        {mode !== "customer" && (
          <div
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, #1f1f1f 55%, ${accentColor} 100%)`,
              color: "white",
              borderRadius: 28,
              padding: 24,
              boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: "1 1 420px" }}>
                <div style={{ display: "inline-flex", gap: 8, alignItems: "center", background: "rgba(255,255,255,0.1)", padding: "10px 14px", borderRadius: 999, fontSize: 14 }}>
                  <Sparkles size={16} />
                  نظام حقيقي مباشر مربوط بـ Firebase
                </div>
                <h1 style={{ fontSize: 46, margin: "16px 0 10px" }}>{brand.brandName}</h1>
                <p style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.8, maxWidth: 760 }}>
                  العميل يمسح QR، يدخل الاسم ورقم الهاتف، يطلب من المنيو، ثم يصل الطلب مباشرة إلى النظام الداخلي داخل الكوفي أو الفود ترك.
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, flex: "1 1 420px" }}>
                <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 24, padding: 18 }}><div style={{ color: "rgba(255,255,255,0.7)" }}>إجمالي الطلبات</div><div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>{totalOrders}</div></div>
                <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 24, padding: 18 }}><div style={{ color: "rgba(255,255,255,0.7)" }}>جديد</div><div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>{newOrders}</div></div>
                <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 24, padding: 18 }}><div style={{ color: "rgba(255,255,255,0.7)" }}>جاهز</div><div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>{readyOrders}</div></div>
                <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 24, padding: 18 }}><div style={{ color: "rgba(255,255,255,0.7)" }}>مبيعات مسلمة</div><div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>{money(totalSales)}</div></div>
              </div>
            </div>
          </div>
        )}

        {errorMessage ? (
          <div style={{ ...styles.card, borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b", marginBottom: 24 }}>
            {errorMessage}
          </div>
        ) : null}

        {isLoading ? <div style={{ ...styles.card, marginBottom: 24 }}>جاري تحميل البيانات من Firebase...</div> : null}

        {mode !== "customer" && (
          <div style={{ ...styles.card, marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                ["customer", "العميل", <QrCode size={16} />],
                ["cashier", "الاستقبال", <LayoutDashboard size={16} />],
                ["kitchen", "المطبخ", <ChefHat size={16} />],
                ["pickup", "الاستلام", <Bell size={16} />],
                ["admin", "الإدارة", <Settings size={16} />],
              ].map(([value, label, icon]) => (
                <button
                  key={String(value)}
                  onClick={() => setMode(value)}
                  style={{
                    ...styles.buttonSecondary,
                    background: mode === value ? primaryColor : "white",
                    color: mode === value ? "white" : "#111111",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === "customer" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ ...styles.card, padding: 0, overflow: "hidden" }}>
                <div
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, #262626 70%, ${accentColor} 100%)`,
                    color: "white",
                    padding: 24,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      {brand.logoUrl ? (
                        <img
                          src={brand.logoUrl}
                          alt={brand.brandName}
                          style={{ width: 74, height: 74, objectFit: "cover", borderRadius: 22, border: "2px solid rgba(255,255,255,0.25)" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 74,
                            height: 74,
                            borderRadius: 22,
                            background: "rgba(255,255,255,0.12)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid rgba(255,255,255,0.2)",
                          }}
                        >
                          <Store size={30} />
                        </div>
                      )}
                      <div>
                        <div style={{ display: "inline-flex", gap: 8, alignItems: "center", background: "rgba(255,255,255,0.1)", padding: "8px 12px", borderRadius: 999, fontSize: 13 }}>
                          <Store size={15} />
                          {brand.brandName}
                        </div>
                        <h2 style={{ margin: "14px 0 8px", fontSize: 34 }}>{brand.heroTitle}</h2>
                        <p style={{ margin: 0, color: "rgba(255,255,255,0.78)", lineHeight: 1.8, maxWidth: 720 }}>
                          {brand.heroSubtitle}
                        </p>
                      </div>
                    </div>
                    <div style={{ minWidth: 220, background: "rgba(255,255,255,0.08)", borderRadius: 22, padding: 18 }}>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.72)" }}>مدة تجهيز تقريبية</div>
                      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>5 - 12 دقيقة</div>
                    </div>
                  </div>
                </div>

                <div style={{ padding: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>اسم العميل</label>
                      <input style={styles.input} value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="اكتب اسمك" />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>رقم الهاتف</label>
                      <input style={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XXXXXXXX" />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>ملاحظات عامة على الطلب</label>
                      <textarea style={styles.textarea} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="مثال: أتواجد أمام السيارة البيضاء / بدون أدوات / وقت الاستلام..." />
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 18 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 28, marginBottom: 6 }}>
                      <ClipboardList size={20} /> المنيو
                    </div>
                    <div style={{ color: "#64748b" }}>واجهة عميل احترافية تعرض الأصناف مع صورها ووصف مختصر.</div>
                  </div>
                  <div style={{ minWidth: 260 }}>
                    <input style={styles.input} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث في المنيو" />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      style={{
                        ...styles.categoryChip,
                        ...(selectedCategory === category
                          ? { ...styles.categoryChipActive, background: primaryColor, border: `1px solid ${primaryColor}` }
                          : {}),
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div style={styles.customerMenuGrid}>
                  {availableMenu.map((item) => (
                    <div key={item.id} style={styles.menuCard}>
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80"}
                        alt={item.name}
                        style={styles.menuImage}
                      />
                      <div style={{ padding: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                          <div>
                            <div style={{ fontSize: 20, fontWeight: 800 }}>{item.name}</div>
                            <div style={{ color: "#64748b", marginTop: 6 }}>{item.category}</div>
                          </div>
                          <div style={{ fontWeight: 800, fontSize: 16, color: primaryColor }}>{money(item.price)}</div>
                        </div>
                        <div style={{ color: "#6b7280", marginTop: 10, lineHeight: 1.7, minHeight: 48 }}>
                          {item.description || "صنف مميز من قائمة الكوفي أو التراك."}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                          <div style={{ color: "#94a3b8", fontSize: 13 }}>وقت تحضير: {item.prepTime} دقائق</div>
                          <button style={{ ...styles.button, background: primaryColor }} onClick={() => addToCart(item)}>إضافة</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div style={{ ...styles.card, position: "sticky", top: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 28, marginBottom: 16 }}>
                  <ShoppingCart size={20} /> السلة
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {cart.length === 0 ? (
                    <div style={{ border: "1px solid #e5e7eb", borderRadius: 18, padding: 16, color: "#64748b", background: "#fafaf9" }}>السلة فارغة. اختر أصنافك من المنيو.</div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} style={{ border: "1px solid #e5e7eb", borderRadius: 18, padding: 16 }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          {item.image ? (
                            <img src={item.image} alt={item.name} style={{ width: 62, height: 62, borderRadius: 14, objectFit: "cover" }} />
                          ) : null}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                              <div>
                                <div style={{ fontWeight: 700 }}>{item.name}</div>
                                <div style={{ color: "#64748b", marginTop: 4 }}>{money(item.price * item.qty)}</div>
                              </div>
                              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <button style={styles.buttonSecondary} onClick={() => updateQty(item.id, -1)}><Minus size={16} /></button>
                                <div style={{ minWidth: 18, textAlign: "center" }}>{item.qty}</div>
                                <button style={styles.buttonSecondary} onClick={() => updateQty(item.id, 1)}><Plus size={16} /></button>
                              </div>
                            </div>
                            <div style={{ marginTop: 10 }}>
                              <label style={{ display: "block", marginBottom: 6, color: "#64748b", fontSize: 13 }}>ملاحظات هذا الصنف</label>
                              <textarea
                                style={{ ...styles.textarea, minHeight: 76 }}
                                value={item.itemNote || ""}
                                onChange={(e) => updateCartItemNote(item.id, e.target.value)}
                                placeholder="مثال: بدون مخلل / زيادة ثلج / حار خفيف"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div style={{ border: "1px solid #e5e7eb", background: "#fafaf9", borderRadius: 18, padding: 16, display: "flex", justifyContent: "space-between" }}>
                    <span>إشعار عند الجاهزية</span>
                    <input type="checkbox" checked={notifyCustomer} onChange={(e) => setNotifyCustomer(e.target.checked)} />
                  </div>
                  <div style={{ background: primaryColor, color: "white", borderRadius: 18, padding: 16, display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 18 }}>
                    <span>الإجمالي</span>
                    <span>{money(cartTotal)}</span>
                  </div>
                  <button style={{ ...styles.button, background: primaryColor, opacity: isSaving ? 0.7 : 1, width: "100%" }} onClick={placeOrder} disabled={!customerName || !phone || cart.length === 0 || isSaving}>
                    {isSaving ? "جاري إرسال الطلب..." : "تأكيد وإرسال الطلب"}
                  </button>
                  <div style={{ color: "#64748b", lineHeight: 1.8, fontSize: 14 }}>
                    بعد إرسال الطلب سيصل مباشرة إلى الكاشير والمطبخ داخل النظام، وعند تجهيز الطلب يمكن التواصل مع العميل.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {(mode === "cashier" || mode === "kitchen" || mode === "pickup") && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
              <MetricCard label="طلبات جديدة" value={newOrders} />
              <MetricCard label="قيد التحضير" value={preparingOrders} />
              <MetricCard label="جاهز" value={readyOrders} />
              <MetricCard label="تم التسليم" value={deliveredOrders} />
            </div>

            <div style={styles.card}>
              <SectionTitle
                icon={mode === "cashier" ? <LayoutDashboard size={20} /> : mode === "kitchen" ? <ChefHat size={20} /> : <Bell size={20} />}
                title={mode === "cashier" ? "لوحة الاستقبال داخل الكوفي" : mode === "kitchen" ? "شاشة المطبخ والتحضير" : "شاشة الاستلام والنداء"}
                sub={mode === "cashier" ? "هذه الشاشة تستقبل الطلبات من جوالات العملاء مباشرة" : mode === "kitchen" ? "تعرض الطلبات المطلوب تحضيرها فقط" : "تعرض الطلبات الجاهزة للتسليم"}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
                {visibleOrders.map((order) => (
                  <div key={order.id} style={{ border: "1px solid #e5e7eb", borderRadius: 24, padding: 18, boxShadow: "0 4px 14px rgba(0,0,0,0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 24, fontWeight: 800 }}>{order.orderCode || order.id}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569", marginTop: 8 }}><User size={16} /> {order.customerName}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569", marginTop: 6 }}><Phone size={16} /> {order.phone}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", marginTop: 6, fontSize: 14 }}><Clock3 size={16} /> {order.createdAtLabel || "الآن"}</div>
                      </div>
                      <div style={{ background: statusMap[order.status].bg, color: statusMap[order.status].color, border: `1px solid ${statusMap[order.status].border}`, padding: "8px 12px", borderRadius: 999, fontWeight: 700 }}>
                        {statusMap[order.status].label}
                      </div>
                    </div>

                    <div style={{ border: "1px solid #e5e7eb", background: "#fafaf9", borderRadius: 18, padding: 16, marginTop: 16 }}>
                      {(order.items || []).map((item, idx) => (
                        <div key={`${order.id}-${idx}`} style={{ borderBottom: idx !== (order.items || []).length - 1 ? "1px solid #e5e7eb" : "none", paddingBottom: 8, marginBottom: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span>{item.name} × {item.qty}</span>
                            <span style={{ fontWeight: 700 }}>{money(Number(item.price) * item.qty)}</span>
                          </div>
                          {item.itemNote ? <div style={{ color: "#64748b", fontSize: 13 }}>ملاحظة الصنف: {item.itemNote}</div> : null}
                        </div>
                      ))}
                    </div>

                    {order.notes ? <div style={{ border: "1px solid #e5e7eb", borderRadius: 18, padding: 14, marginTop: 12 }}>ملاحظات عامة: {order.notes}</div> : null}

                    <div style={{ background: primaryColor, color: "white", borderRadius: 18, padding: 16, display: "flex", justifyContent: "space-between", fontWeight: 800, marginTop: 12 }}>
                      <span>الإجمالي</span>
                      <span>{money(order.total)}</span>
                    </div>

                    {mode !== "pickup" ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 12 }}>
                        <button style={styles.buttonSecondary} onClick={() => setOrderStatus(order.id, "new")}>جديد</button>
                        <button style={styles.buttonSecondary} onClick={() => setOrderStatus(order.id, "preparing")}>تحضير</button>
                        <button style={styles.buttonSecondary} onClick={() => setOrderStatus(order.id, "ready")}>جاهز</button>
                        <button style={styles.buttonSecondary} onClick={() => setOrderStatus(order.id, "delivered")}>تسليم</button>
                      </div>
                    ) : (
                      <div style={{ marginTop: 12 }}>
                        <button style={{ ...styles.button, background: primaryColor, width: "100%" }} onClick={() => setOrderStatus(order.id, "delivered")}>تم التسليم</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {mode === "admin" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24 }}>
              <div style={styles.card}>
                <SectionTitle icon={<Palette size={20} />} title="هوية البراند في صفحة العميل" sub="من هنا تعدل الشعار واسم البراند والألوان التي تظهر للزبون" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>اسم البراند</label>
                    <input style={styles.input} value={brand.brandName} onChange={(e) => setBrand((prev) => ({ ...prev, brandName: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>رابط الشعار</label>
                    <input style={styles.input} value={brand.logoUrl} onChange={(e) => setBrand((prev) => ({ ...prev, logoUrl: e.target.value }))} placeholder="https://...logo.png" />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>اللون الأساسي</label>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <input type="color" value={brand.primaryColor} onChange={(e) => setBrand((prev) => ({ ...prev, primaryColor: e.target.value }))} style={{ width: 54, height: 44, border: "none", background: "transparent" }} />
                      <input style={styles.input} value={brand.primaryColor} onChange={(e) => setBrand((prev) => ({ ...prev, primaryColor: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>اللون الثانوي</label>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <input type="color" value={brand.accentColor} onChange={(e) => setBrand((prev) => ({ ...prev, accentColor: e.target.value }))} style={{ width: 54, height: 44, border: "none", background: "transparent" }} />
                      <input style={styles.input} value={brand.accentColor} onChange={(e) => setBrand((prev) => ({ ...prev, accentColor: e.target.value }))} />
                    </div>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>عنوان الصفحة للعميل</label>
                    <input style={styles.input} value={brand.heroTitle} onChange={(e) => setBrand((prev) => ({ ...prev, heroTitle: e.target.value }))} />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>الوصف التعريفي</label>
                    <textarea style={styles.textarea} value={brand.heroSubtitle} onChange={(e) => setBrand((prev) => ({ ...prev, heroSubtitle: e.target.value }))} />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <button style={{ ...styles.button, background: primaryColor }} onClick={saveBrandSettings}>حفظ هوية البراند</button>
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <SectionTitle icon={<Store size={20} />} title="معاينة سريعة" sub="هكذا تقريبًا ستظهر صفحة العميل" />
                <div style={{ marginTop: 20, borderRadius: 24, overflow: "hidden", border: "1px solid #e5e7eb" }}>
                  <div style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #262626 70%, ${accentColor} 100%)`, color: "white", padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {brand.logoUrl ? <img src={brand.logoUrl} alt={brand.brandName} style={{ width: 56, height: 56, borderRadius: 16, objectFit: "cover" }} /> : <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><Store size={24} /></div>}
                      <div>
                        <div style={{ fontWeight: 800 }}>{brand.brandName}</div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", marginTop: 4 }}>{brand.heroTitle}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: 16, color: "#475569", lineHeight: 1.7 }}>{brand.heroSubtitle}</div>
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <SectionTitle icon={<Package size={20} />} title="إدارة المنيو والصور" sub="تقدر الآن تعديل صورة كل صنف ورابطها ووصفها من داخل الموقع" />
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                {menu.map((item) => (
                  <div key={item.id} style={{ border: "1px solid #e5e7eb", borderRadius: 24, padding: 16, display: "grid", gridTemplateColumns: "180px 1fr", gap: 16, alignItems: "start" }}>
                    <div>
                      <img src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80"} alt={item.name} style={{ width: "100%", height: 140, borderRadius: 18, objectFit: "cover", marginBottom: 10 }} />
                      <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ background: item.available ? "#d1fae5" : "#ffe4e6", color: item.available ? "#065f46" : "#9f1239", padding: "8px 12px", borderRadius: 999, fontWeight: 700, fontSize: 13 }}>
                          {item.available ? "متاح" : "غير متاح"}
                        </div>
                        <button style={styles.buttonSecondary} onClick={() => toggleAvailability(item.id, item.available)}>{item.available ? "إيقاف" : "تفعيل"}</button>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ display: "block", marginBottom: 6, color: "#64748b", fontSize: 13 }}>اسم الصنف</label>
                        <input style={styles.input} value={item.name || ""} onChange={(e) => updateMenuItemField(item.id, "name", e.target.value)} />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: 6, color: "#64748b", fontSize: 13 }}>التصنيف</label>
                        <input style={styles.input} value={item.category || ""} onChange={(e) => updateMenuItemField(item.id, "category", e.target.value)} />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: 6, color: "#64748b", fontSize: 13 }}>السعر</label>
                        <input style={styles.input} value={item.price || ""} onChange={(e) => updateMenuItemField(item.id, "price", Number(e.target.value || 0))} />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: 6, color: "#64748b", fontSize: 13 }}>وقت التحضير</label>
                        <input style={styles.input} value={item.prepTime || ""} onChange={(e) => updateMenuItemField(item.id, "prepTime", Number(e.target.value || 0))} />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ display: "block", marginBottom: 6, color: "#64748b", fontSize: 13 }}>رابط الصورة</label>
                        <input style={styles.input} value={item.image || ""} onChange={(e) => updateMenuItemField(item.id, "image", e.target.value)} placeholder="https://...jpg أو png" />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ display: "block", marginBottom: 6, color: "#64748b", fontSize: 13 }}>وصف الصنف</label>
                        <textarea style={{ ...styles.textarea, minHeight: 84 }} value={item.description || ""} onChange={(e) => updateMenuItemField(item.id, "description", e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div style={styles.card}>
                <SectionTitle icon={<Upload size={20} />} title="إضافة صنف جديد" sub="مع صورة ووصف ليظهر مباشرة في المنيو" />
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
                  <input style={styles.input} value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="اسم الصنف" />
                  <input style={styles.input} value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} placeholder="التصنيف" />
                  <input style={styles.input} value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} placeholder="السعر" />
                  <input style={styles.input} value={newItemImage} onChange={(e) => setNewItemImage(e.target.value)} placeholder="رابط الصورة" />
                  <textarea style={styles.textarea} value={newItemDescription} onChange={(e) => setNewItemDescription(e.target.value)} placeholder="وصف الصنف" />
                  <button style={{ ...styles.button, background: primaryColor }} onClick={addMenuItem}>إضافة إلى المنيو</button>
                </div>
              </div>

              <div style={styles.card}>
                <SectionTitle icon={<ImageIcon size={20} />} title="ملاحظات مهمة" sub="إدارة الصور حاليًا تعتمد على روابط الصور" />
                <div style={{ marginTop: 18, color: "#475569", lineHeight: 2 }}>
                  • تستطيع إضافة أو تغيير صورة أي صنف من داخل الإدارة عبر وضع رابط الصورة. <br />
                  • تستطيع تغيير الشعار والألوان واسم البراند من داخل نفس الصفحة. <br />
                  • كل صنف في طلب العميل له الآن ملاحظاته الخاصة التي تظهر للإدارة والمطبخ. <br />
                  • المرحلة التالية إذا أردتها: رفع الصور مباشرة من جهازك إلى Firebase Storage بدل استخدام روابط فقط.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
