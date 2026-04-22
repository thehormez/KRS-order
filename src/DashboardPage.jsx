import React, { useEffect, useMemo, useState } from "react";
import {
  User,
  Phone,
  Bell,
  Clock3,
  ChefHat,
  LayoutDashboard,
  ClipboardList,
  Settings,
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
  Search,
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
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
const storage = getStorage(app);

const defaultBrand = {
  brandName: "KRS Coffee Truck",
  logoUrl: "",
  primaryColor: "#0f0f10",
  accentColor: "#c8a96b",
  heroTitle: "اطلب مباشرة من المنيو",
  heroSubtitle: "امسح الباركود، اختر طلبك، ثم أرسل الطلب ليصل مباشرة إلى نظام الكوفي أو الفود ترك.",
};

const defaultRolePasswords = {
  admin: "1234",
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

function useViewport() {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1440);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return {
    width,
    isMobile: width <= 768,
  };
}

const styles = {
  app: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(200,169,107,0.10), transparent 18%), linear-gradient(to bottom, #f8f6f1, #ffffff, #f3f4f6)",
    color: "#0f172a",
    direction: "rtl",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: 1360,
    margin: "0 auto",
    padding: 16,
  },
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
    <div
      style={{
        ...styles.card,
        borderRadius: 24,
        padding: 18,
        background: `linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.98))`,
        borderTop: `4px solid ${accent}`,
      }}
    >
      <div style={{ color: "#64748b", fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { isMobile } = useViewport();
  const [mode, setMode] = useState("cashier");
  const [pendingMode, setPendingMode] = useState(null);
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [brand, setBrand] = useState(defaultBrand);
  const [rolePasswords, setRolePasswords] = useState(defaultRolePasswords);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemImage, setNewItemImage] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [gatePassword, setGatePassword] = useState("");
  const [gateError, setGateError] = useState("");
  const [searchOrder, setSearchOrder] = useState("");
  const [reportDate, setReportDate] = useState(formatDateKey(new Date()));

  const [roleSession, setRoleSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("krs-dashboard-role-session") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("krs-dashboard-role-session", JSON.stringify(roleSession));
  }, [roleSession]);

  useEffect(() => {
    const menuQuery = query(collection(db, "menu"));
    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubMenu = onSnapshot(menuQuery, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMenu(items);
    });

    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(items);
    });

    const unsubBrand = onSnapshot(doc(db, "settings", "brand"), (snapshot) => {
      if (snapshot.exists()) setBrand({ ...defaultBrand, ...snapshot.data() });
    });

    const unsubRoles = onSnapshot(doc(db, "settings", "roles"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setRolePasswords({ admin: data.admin || defaultRolePasswords.admin });
      }
    });

    return () => {
      unsubMenu();
      unsubOrders();
      unsubBrand();
      unsubRoles();
    };
  }, []);

  useEffect(() => {
    if (mode !== "admin") return;
    const unlocked = roleSession?.admin === true;
    if (!unlocked) setPendingMode("admin");
  }, [mode, roleSession]);

  const totalOrders = orders.length;
  const newOrders = orders.filter((o) => o.status === "new").length;
  const preparingOrders = orders.filter((o) => o.status === "preparing").length;
  const readyOrders = orders.filter((o) => o.status === "ready").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const totalSales = orders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + Number(o.total || 0), 0);

  const todayOrders = useMemo(() => {
    return orders.filter((order) => formatDateKey(getCreatedAtDate(order)) === reportDate);
  }, [orders, reportDate]);

  const todayDeliveredOrders = useMemo(() => {
    return todayOrders.filter((order) => order.status === "delivered");
  }, [todayOrders]);

  const todaySales = useMemo(() => {
    return todayDeliveredOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  }, [todayDeliveredOrders]);

  const topItemsToday = useMemo(() => {
    const map = new Map();
    todayDeliveredOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const current = map.get(item.name) || { name: item.name, qty: 0, sales: 0 };
        current.qty += Number(item.qty || 0);
        current.sales += Number(item.qty || 0) * Number(item.price || 0);
        map.set(item.name, current);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.qty - a.qty);
  }, [todayDeliveredOrders]);

  const filteredOrders = useMemo(() => {
    if (!searchOrder.trim()) return orders;
    return orders.filter(
      (order) =>
        safeIncludes(order.orderCode, searchOrder) ||
        safeIncludes(order.customerName, searchOrder) ||
        safeIncludes(order.phone, searchOrder)
    );
  }, [orders, searchOrder]);

  const visibleOrders = useMemo(() => {
    const base = filteredOrders;
    if (mode === "kitchen") return base.filter((o) => o.status === "new" || o.status === "preparing");
    if (mode === "pickup") return base.filter((o) => o.status === "ready");
    return base;
  }, [filteredOrders, mode]);

  const primaryColor = brand.primaryColor || "#111111";
  const accentColor = brand.accentColor || "#c8a96b";

  const setOrderStatus = async (orderId, status) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      setErrorMessage("فشل تحديث حالة الطلب");
    }
  };

  const uploadImageAndSetUrl = async (file, onDone) => {
    if (!file) return;
    try {
      setIsUploadingImage(true);
      const fileName = `${Date.now()}-${file.name}`;
      const storageRef = ref(storage, `menu-images/${fileName}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      onDone(downloadURL);
    } catch (error) {
      setErrorMessage("فشل رفع الصورة إلى Firebase Storage");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const updateMenuItemField = async (itemId, field, value) => {
    try {
      await updateDoc(doc(db, "menu", itemId), {
        [field]: value,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      setErrorMessage("فشل تعديل بيانات الصنف");
    }
  };

  const toggleAvailability = async (itemId, currentValue) => {
    try {
      await updateDoc(doc(db, "menu", itemId), {
        available: !currentValue,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      setErrorMessage("فشل تحديث حالة الصنف");
    }
  };

  const addMenuItem = async () => {
    if (!newItemName.trim() || !newItemCategory.trim() || !newItemPrice.trim()) return;
    try {
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
    }
  };

  const saveBrandSettings = async () => {
    try {
      await setDoc(doc(db, "settings", "brand"), brand, { merge: true });
    } catch (error) {
      setErrorMessage("فشل حفظ إعدادات البراند");
    }
  };

  const saveRolePasswords = async () => {
    try {
      await setDoc(doc(db, "settings", "roles"), { admin: rolePasswords.admin }, { merge: true });
    } catch (error) {
      setErrorMessage("فشل حفظ كلمة مرور الإدارة");
    }
  };

  const submitGate = () => {
    if (gatePassword === (rolePasswords.admin || "")) {
      setRoleSession((prev) => ({ ...prev, admin: true }));
      setPendingMode(null);
      setGatePassword("");
      setGateError("");
    } else {
      setGateError("كلمة المرور غير صحيحة");
    }
  };

  const printDailyReport = () => {
    const rows = topItemsToday
      .map(
        (item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${item.name}</td>
          <td>${item.qty}</td>
          <td>${money(item.sales)}</td>
        </tr>`
      )
      .join("");

    const html = `
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8" />
          <title>تقرير المبيعات اليومية</title>
          <style>
            body{font-family:Arial,sans-serif;padding:32px;color:#111;background:#fff}
            .head{border:1px solid #ddd;border-radius:18px;padding:20px;margin-bottom:20px}
            .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0}
            .box{border:1px solid #ddd;border-radius:14px;padding:16px;background:#fafafa}
            table{width:100%;border-collapse:collapse;margin-top:16px}
            th,td{border:1px solid #ddd;padding:12px;text-align:right}
            th{background:#f5f5f5}
          </style>
        </head>
        <body>
          <div class="head">
            <h1>${brand.brandName}</h1>
            <p>تقرير المبيعات اليومية</p>
            <p>التاريخ: ${reportDate}</p>
          </div>
          <div class="grid">
            <div class="box"><strong>إجمالي المبيعات</strong><br/>${money(todaySales)}</div>
            <div class="box"><strong>عدد الطلبات</strong><br/>${todayOrders.length}</div>
            <div class="box"><strong>طلبات مسلمة</strong><br/>${todayDeliveredOrders.length}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>الصنف</th>
                <th>الكمية</th>
                <th>المبيعات</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="4">لا توجد بيانات</td></tr>'}
            </tbody>
          </table>
        </body>
      </html>`;

    const win = window.open("", "_blank", "width=1200,height=900");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  const renderRoleGate = pendingMode === "admin" && mode === "admin" && roleSession?.admin !== true;

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <div
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, #141414 58%, ${accentColor} 100%)`,
            color: "white",
            borderRadius: 30,
            padding: isMobile ? 18 : 24,
            boxShadow: "0 16px 40px rgba(0,0,0,0.16)",
            marginBottom: 24,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ flex: "1 1 420px" }}>
              <div style={{ display: "inline-flex", gap: 8, alignItems: "center", background: "rgba(255,255,255,0.1)", padding: "10px 14px", borderRadius: 999, fontSize: 14 }}>
                <Sparkles size={16} />
                لوحة تشغيل داخلية
              </div>
              <h1 style={{ fontSize: isMobile ? 28 : 46, margin: "16px 0 10px" }}>{brand.brandName}</h1>
              <p style={{ color: "rgba(255,255,255,0.84)", lineHeight: 1.9, maxWidth: 780, margin: 0 }}>
                لوحة منفصلة للاستقبال والمطبخ والاستلام والإدارة.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, minmax(140px, 1fr))", gap: 12, flex: "1 1 420px", width: "100%" }}>
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 24, padding: 18 }}>
                <div style={{ color: "rgba(255,255,255,0.72)" }}>إجمالي الطلبات</div>
                <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{totalOrders}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 24, padding: 18 }}>
                <div style={{ color: "rgba(255,255,255,0.72)" }}>طلبات جديدة</div>
                <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{newOrders}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 24, padding: 18 }}>
                <div style={{ color: "rgba(255,255,255,0.72)" }}>جاهز</div>
                <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{readyOrders}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 24, padding: 18 }}>
                <div style={{ color: "rgba(255,255,255,0.72)" }}>مبيعات مسلمة</div>
                <div style={{ fontSize: isMobile ? 20 : 28, fontWeight: 800, marginTop: 8 }}>{money(totalSales)}</div>
              </div>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div style={{ ...styles.card, borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b", marginBottom: 24 }}>{errorMessage}</div>
        ) : null}

        <div style={{ ...styles.card, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              ["cashier", "الاستقبال", <LayoutDashboard size={16} />],
              ["kitchen", "المطبخ", <ChefHat size={16} />],
              ["pickup", "الاستلام", <Bell size={16} />],
              ["admin", "الإدارة", <Settings size={16} />],
            ].map(([value, label, icon]) => (
              <button
                key={value}
                onClick={() => {
                  setMode(value);
                  if (value === "admin" && roleSession?.admin !== true) {
                    setPendingMode("admin");
                    setGatePassword("");
                    setGateError("");
                  }
                }}
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
                {value === "admin" ? <Lock size={15} /> : null}
              </button>
            ))}
          </div>
        </div>

        {renderRoleGate ? (
          <div style={{ ...styles.card, maxWidth: 560, margin: "0 auto 24px" }}>
            <SectionTitle icon={<Lock size={20} />} title="دخول الإدارة" sub="هذه الصفحة محمية بكلمة مرور" />
            <div style={{ marginTop: 18 }}>
              <label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>كلمة المرور</label>
              <input
                style={styles.input}
                type="password"
                value={gatePassword}
                onChange={(e) => setGatePassword(e.target.value)}
                placeholder="ادخل كلمة المرور"
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitGate();
                }}
              />
              {gateError ? <div style={{ marginTop: 10, color: "#b91c1c", fontWeight: 700 }}>{gateError}</div> : null}
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button style={{ ...styles.button, background: primaryColor, flex: 1 }} onClick={submitGate}>دخول</button>
                <button style={{ ...styles.buttonSecondary, flex: 1 }} onClick={() => { setMode("cashier"); setPendingMode(null); }}>رجوع</button>
              </div>
            </div>
          </div>
        ) : null}

        {!renderRoleGate && (mode === "cashier" || mode === "kitchen" || mode === "pickup") && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
              <MetricCard label="طلبات جديدة" value={newOrders} accent={accentColor} />
              <MetricCard label="قيد التحضير" value={preparingOrders} accent={primaryColor} />
              <MetricCard label="جاهز" value={readyOrders} accent="#059669" />
              <MetricCard label="تم التسليم" value={deliveredOrders} accent="#6b7280" />
            </div>

            <div style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <SectionTitle
                  icon={mode === "cashier" ? <LayoutDashboard size={20} /> : mode === "kitchen" ? <ChefHat size={20} /> : <Bell size={20} />}
                  title={mode === "cashier" ? "لوحة الاستقبال" : mode === "kitchen" ? "شاشة المطبخ" : "شاشة الاستلام"}
                  sub={mode === "cashier" ? "جميع الطلبات الواردة من صفحة العميل" : mode === "kitchen" ? "تعرض الطلبات المطلوبة للتحضير فقط" : "تعرض الطلبات الجاهزة للتسليم"}
                />
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <input style={{ ...styles.input, width: isMobile ? "100%" : 260 }} value={searchOrder} onChange={(e) => setSearchOrder(e.target.value)} placeholder="بحث برقم الطلب أو الاسم أو الهاتف" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginTop: 20 }}>
                {visibleOrders.map((order) => (
                  <div key={order.id} style={{ border: "1px solid #e5e7eb", borderRadius: 24, padding: 18, boxShadow: "0 4px 14px rgba(0,0,0,0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontSize: 24, fontWeight: 800 }}>{order.orderCode || order.id}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569", marginTop: 8 }}><User size={16} /> {order.customerName}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569", marginTop: 6 }}><Phone size={16} /> {order.phone}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", marginTop: 6, fontSize: 14 }}><Clock3 size={16} /> {order.createdAtLabel || "الآن"}</div>
                        {order.paymentMethod ? <div style={{ color: "#64748b", marginTop: 8, fontSize: 13 }}>الدفع: {order.paymentMethod}</div> : null}
                      </div>
                      <div style={{ background: statusMap[order.status]?.bg, color: statusMap[order.status]?.color, border: `1px solid ${statusMap[order.status]?.border}`, padding: "8px 12px", borderRadius: 999, fontWeight: 700 }}>
                        {statusMap[order.status]?.label}
                      </div>
                    </div>

                    <div style={{ border: "1px solid #e5e7eb", background: "#fafaf9", borderRadius: 18, padding: 16, marginTop: 16 }}>
                      {(order.items || []).map((item, idx) => (
                        <div key={`${order.id}-${idx}`} style={{ borderBottom: idx !== (order.items || []).length - 1 ? "1px solid #e5e7eb" : "none", paddingBottom: 8, marginBottom: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, gap: 12 }}>
                            <span>{item.name} × {item.qty}</span>
                            <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{money(Number(item.price) * item.qty)}</span>
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
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 8, marginTop: 12 }}>
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

        {!renderRoleGate && mode === "admin" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 0.8fr", gap: 24 }}>
              <div style={styles.card}>
                <SectionTitle icon={<Palette size={20} />} title="هوية البراند" sub="من هنا تعدل الشعار واسم البراند والألوان" />
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginTop: 20 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>اسم البراند</label>
                    <input style={styles.input} value={brand.brandName} onChange={(e) => setBrand((prev) => ({ ...prev, brandName: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>رابط الشعار</label>
                    <input style={styles.input} value={brand.logoUrl} onChange={(e) => setBrand((prev) => ({ ...prev, logoUrl: e.target.value }))} />
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
                    <label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>عنوان الصفحة</label>
                    <input style={styles.input} value={brand.heroTitle} onChange={(e) => setBrand((prev) => ({ ...prev, heroTitle: e.target.value }))} />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>الوصف</label>
                    <textarea style={styles.textarea} value={brand.heroSubtitle} onChange={(e) => setBrand((prev) => ({ ...prev, heroSubtitle: e.target.value }))} />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <button style={{ ...styles.button, background: primaryColor }} onClick={saveBrandSettings}>حفظ الإعدادات</button>
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <SectionTitle icon={<Lock size={20} />} title="كلمة مرور الإدارة" sub="الصفحة الوحيدة المحمية بكلمة مرور" />
                <div style={{ marginTop: 18 }}>
                  <label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>كلمة المرور</label>
                  <input style={styles.input} type="password" value={rolePasswords.admin || ""} onChange={(e) => setRolePasswords((prev) => ({ ...prev, admin: e.target.value }))} />
                  <button style={{ ...styles.button, background: primaryColor, marginTop: 12 }} onClick={saveRolePasswords}>حفظ كلمة المرور</button>
                  <button style={{ ...styles.buttonSecondary, marginTop: 12, display: "flex", alignItems: "center", gap: 8 }} onClick={() => setRoleSession((prev) => ({ ...prev, admin: false }))}>
                    <LogOut size={16} /> تسجيل خروج الإدارة
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24 }}>
              <div style={styles.card}>
                <SectionTitle icon={<Receipt size={20} />} title="تقرير المبيعات اليومية" sub="مع اختيار التاريخ والطباعة" />
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto", gap: 12, marginTop: 18, alignItems: "end" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, color: "#64748b" }}>تاريخ التقرير</label>
                    <input type="date" style={styles.input} value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
                  </div>
                  <button style={{ ...styles.button, background: primaryColor, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }} onClick={printDailyReport}>
                    <Printer size={16} /> طباعة التقرير
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12, marginTop: 16 }}>
                  <MetricCard label="مبيعات اليوم" value={money(todaySales)} accent={accentColor} />
                  <MetricCard label="عدد الطلبات" value={todayOrders.length} accent={primaryColor} />
                  <MetricCard label="طلبات مسلمة" value={todayDeliveredOrders.length} accent="#059669" />
                </div>
                <div style={{ marginTop: 18, border: "1px solid #e5e7eb", borderRadius: 22, overflow: "hidden" }}>
                  <div style={{ padding: 14, background: "#fafaf9", fontWeight: 800 }}>الأصناف الأكثر مبيعاً</div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {topItemsToday.length === 0 ? (
                      <div style={{ padding: 16, color: "#64748b" }}>لا توجد طلبات مسلمة في هذا التاريخ.</div>
                    ) : (
                      topItemsToday.slice(0, 8).map((item, index) => (
                        <div key={item.name} style={{ padding: 14, borderTop: index === 0 ? "none" : "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", gap: 12 }}>
                          <div>
                            <div style={{ fontWeight: 700 }}>{item.name}</div>
                            <div style={{ color: "#64748b", marginTop: 4 }}>الكمية: {item.qty}</div>
                          </div>
                          <div style={{ fontWeight: 800 }}>{money(item.sales)}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <SectionTitle icon={<Upload size={20} />} title="إضافة صنف جديد" sub="مع صورة ووصف ليظهر مباشرة في المنيو" />
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
                  <input style={styles.input} value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="اسم الصنف" />
                  <input style={styles.input} value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} placeholder="التصنيف" />
                  <input style={styles.input} value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} placeholder="السعر" />
                  <input style={styles.input} value={newItemImage} onChange={(e) => setNewItemImage(e.target.value)} placeholder="رابط الصورة" />
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <label style={{ ...styles.buttonSecondary, display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <Upload size={16} /> تحميل الصورة مباشرة
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => uploadImageAndSetUrl(e.target.files?.[0], setNewItemImage)} />
                    </label>
                    {isUploadingImage ? <span style={{ color: "#64748b", fontSize: 13 }}>جاري رفع الصورة...</span> : null}
                  </div>
                  <textarea style={styles.textarea} value={newItemDescription} onChange={(e) => setNewItemDescription(e.target.value)} placeholder="وصف الصنف" />
                  <button style={{ ...styles.button, background: primaryColor }} onClick={addMenuItem}>إضافة إلى المنيو</button>
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <SectionTitle icon={<Package size={20} />} title="إدارة المنيو" sub="تعديل الأصناف والصور والتوافر" />
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                {menu.map((item) => (
                  <div key={item.id} style={{ border: "1px solid #e5e7eb", borderRadius: 24, padding: 16, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "180px 1fr", gap: 16, alignItems: "start" }}>
                    <div>
                      <img src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80"} alt={item.name} style={{ width: "100%", height: 140, borderRadius: 18, objectFit: "cover", marginBottom: 10 }} />
                      <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ background: item.available ? "#d1fae5" : "#ffe4e6", color: item.available ? "#065f46" : "#9f1239", padding: "8px 12px", borderRadius: 999, fontWeight: 700, fontSize: 13 }}>
                          {item.available ? "متاح" : "غير متاح"}
                        </div>
                        <button style={styles.buttonSecondary} onClick={() => toggleAvailability(item.id, item.available)}>{item.available ? "إيقاف" : "تفعيل"}</button>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
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
                        <input style={styles.input} value={item.image || ""} onChange={(e) => updateMenuItemField(item.id, "image", e.target.value)} />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ display: "block", marginBottom: 6, color: "#64748b", fontSize: 13 }}>الوصف</label>
                        <textarea style={{ ...styles.textarea, minHeight: 84 }} value={item.description || ""} onChange={(e) => updateMenuItemField(item.id, "description", e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
