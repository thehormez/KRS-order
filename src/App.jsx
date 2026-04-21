import React, { useEffect, useMemo, useState } from "react";
import {
  Truck,
  ShoppingCart,
  User,
  Phone,
  Bell,
  Clock3,
  Search,
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
} from "lucide-react";

type MenuItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  available: boolean;
  prepTime: number;
};

type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
};

type OrderStatus = "new" | "preparing" | "ready" | "delivered";
type ViewMode = "customer" | "cashier" | "kitchen" | "pickup" | "admin";

type Order = {
  id: string;
  customerName: string;
  phone: string;
  notes: string;
  items: CartItem[];
  total: number;
  truckName: string;
  notifyCustomer: boolean;
  status: OrderStatus;
  createdAt: string;
};

const initialMenu: MenuItem[] = [
  { id: 1, name: "سبانيش لاتيه", category: "القهوة", price: 18, available: true, prepTime: 4 },
  { id: 2, name: "آيس لاتيه", category: "القهوة", price: 16, available: true, prepTime: 3 },
  { id: 3, name: "برغر لحم", category: "الوجبات", price: 28, available: true, prepTime: 9 },
  { id: 4, name: "برغر دجاج", category: "الوجبات", price: 25, available: true, prepTime: 8 },
  { id: 5, name: "بطاطس", category: "الإضافات", price: 12, available: true, prepTime: 4 },
  { id: 6, name: "كرك", category: "المشروبات", price: 8, available: false, prepTime: 3 },
  { id: 7, name: "ماء", category: "المشروبات", price: 3, available: true, prepTime: 1 },
  { id: 8, name: "شاورما بوكس", category: "الوجبات", price: 24, available: true, prepTime: 7 },
];

const initialOrders: Order[] = [
  {
    id: "KRS-101",
    customerName: "محمد",
    phone: "0501234567",
    notes: "بدون بصل",
    items: [
      { id: 3, name: "برغر لحم", price: 28, qty: 1 },
      { id: 5, name: "بطاطس", price: 12, qty: 1 },
    ],
    total: 40,
    truckName: "KRS Coffee Truck",
    notifyCustomer: true,
    status: "new",
    createdAt: "12:10 PM",
  },
  {
    id: "KRS-102",
    customerName: "سارة",
    phone: "0508882211",
    notes: "",
    items: [{ id: 1, name: "سبانيش لاتيه", price: 18, qty: 2 }],
    total: 36,
    truckName: "KRS Coffee Truck",
    notifyCustomer: true,
    status: "preparing",
    createdAt: "12:14 PM",
  },
  {
    id: "KRS-103",
    customerName: "أحمد",
    phone: "0507774521",
    notes: "سكر قليل",
    items: [{ id: 2, name: "آيس لاتيه", price: 16, qty: 1 }],
    total: 16,
    truckName: "KRS Coffee Truck",
    notifyCustomer: true,
    status: "ready",
    createdAt: "12:18 PM",
  },
];

const statusMap: Record<OrderStatus, { label: string; bg: string; color: string; border: string }> = {
  new: { label: "جديد", bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
  preparing: { label: "قيد التحضير", bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" },
  ready: { label: "جاهز", bg: "#d1fae5", color: "#065f46", border: "#6ee7b7" },
  delivered: { label: "تم التسليم", bg: "#e5e7eb", color: "#374151", border: "#d1d5db" },
};

function money(value: number) {
  return `${value.toFixed(2)} د.إ`;
}

function orderTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const styles = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom, #f5f5f4, #ffffff, #f5f5f4)",
    color: "#0f172a",
    direction: "rtl" as const,
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: 16,
  },
  hero: {
    background: "#111111",
    color: "white",
    borderRadius: 28,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
    marginBottom: 24,
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
    boxSizing: "border-box" as const,
  },
  textarea: {
    width: "100%",
    minHeight: 100,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid #d1d5db",
    fontSize: 14,
    boxSizing: "border-box" as const,
    resize: "vertical" as const,
  },
};

function SectionTitle({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
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

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ ...styles.card, borderRadius: 24, padding: 18 }}>
      <div style={{ color: "#64748b", fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>{value}</div>
    </div>
  );
}

import {
  initializeApp,
  getApps,
  getApp,
} from "firebase/app";
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
  limit,
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

export default function App() {
  const [mode, setMode] = useState("customer");
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [truckName, setTruckName] = useState("KRS Coffee Truck");
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const menuQuery = query(collection(db, "menu"));
    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubMenu = onSnapshot(
      menuQuery,
      async (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        if (items.length === 0) {
          for (const item of initialMenu) {
            await addDoc(collection(db, "menu"), item);
          }
          return;
        }

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

    return () => {
      unsubMenu();
      unsubOrders();
    };
  }, []);

  const availableMenu = useMemo(
    () => menu.filter((item) => item.available && (item.name.includes(search) || item.category.includes(search))),
    [menu, search]
  );

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0), [cart]);
  const totalOrders = orders.length;
  const newOrders = orders.filter((o) => o.status === "new").length;
  const preparingOrders = orders.filter((o) => o.status === "preparing").length;
  const readyOrders = orders.filter((o) => o.status === "ready").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const totalSales = orders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + Number(o.total || 0), 0);

  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === item.id);
      if (exists) return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
      return [...prev, { id: item.id, name: item.name, price: Number(item.price), qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0));
  };

  const placeOrder = async () => {
    if (!customerName.trim() || !phone.trim() || cart.length === 0) return;

    try {
      setIsSaving(true);
      setErrorMessage("");

      const countSnapshot = await getDocs(query(collection(db, "orders"), limit(999)));
      const nextOrderNumber = 100 + countSnapshot.size + 1;

      await addDoc(collection(db, "orders"), {
        orderCode: `KRS-${nextOrderNumber}`,
        customerName,
        phone,
        notes,
        items: cart,
        total: cartTotal,
        truckName,
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
        createdAt: serverTimestamp(),
      });
      setNewItemName("");
      setNewItemCategory("");
      setNewItemPrice("");
    } catch (error) {
      setErrorMessage("فشل إضافة الصنف الجديد");
      console.error(error);
    }
  };

  const visibleOrders = useMemo(() => {
    if (mode === "kitchen") return orders.filter((o) => o.status === "new" || o.status === "preparing");
    if (mode === "pickup") return orders.filter((o) => o.status === "ready");
    return orders;
  }, [orders, mode]);

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <div style={styles.hero}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ flex: "1 1 420px" }}>
              <div style={{ display: "inline-flex", gap: 8, alignItems: "center", background: "rgba(255,255,255,0.1)", padding: "10px 14px", borderRadius: 999, fontSize: 14 }}>
                <Sparkles size={16} />
                نظام حقيقي مباشر مربوط بـ Firebase
              </div>
              <h1 style={{ fontSize: 46, margin: "16px 0 10px" }}>KRS Truck Order Pro</h1>
              <p style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.8, maxWidth: 760 }}>
                أي طلب يرسله العميل من جواله يُحفظ فعليًا في قاعدة البيانات ويظهر مباشرة داخل شاشة الاستقبال والمطبخ والاستلام.
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

        {errorMessage ? (
          <div style={{ ...styles.card, borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b", marginBottom: 24 }}>
            {errorMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div style={styles.card}>جاري تحميل البيانات الحقيقية من Firebase...</div>
        ) : null}

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
                  background: mode === value ? "#111111" : "white",
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

        {mode === "customer" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={styles.card}>
                <SectionTitle icon={<Store size={20} />} title="صفحة العميل من QR" sub="الطلب يُرسل الآن فعليًا إلى Firebase ويظهر مباشرة داخل النظام" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>اسم العميل</label>
                    <input style={styles.input} value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="اكتب اسمك" />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>رقم الهاتف</label>
                    <input style={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XXXXXXXX" />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>ملاحظات الطلب</label>
                    <textarea style={styles.textarea} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="مثال: بدون ثلج / صوص زيادة / بدون بصل" />
                  </div>
                  <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #e5e7eb", background: "#fafaf9", borderRadius: 18, padding: 16 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>إشعار العميل عند الجاهزية</div>
                      <div style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>الخطوة التالية بعد Firebase هي ربط واتساب أو SMS</div>
                    </div>
                    <input type="checkbox" checked={notifyCustomer} onChange={(e) => setNotifyCustomer(e.target.checked)} />
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 28, marginBottom: 6 }}>
                  <ClipboardList size={20} /> المنيو المباشر
                </div>
                <div style={{ color: "#64748b", marginBottom: 16 }}>هذه الأصناف تأتي الآن من قاعدة البيانات ويمكن تعديلها من لوحة الإدارة</div>
                <input style={{ ...styles.input, marginBottom: 16 }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث في المنيو" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {availableMenu.map((item) => (
                    <div key={item.id} style={{ border: "1px solid #e5e7eb", borderRadius: 24, padding: 16, display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 800 }}>{item.name}</div>
                        <div style={{ color: "#64748b", marginTop: 6 }}>{item.category}</div>
                        <div style={{ color: "#94a3b8", marginTop: 6 }}>وقت تحضير تقريبي: {item.prepTime} دقائق</div>
                        <div style={{ fontWeight: 700, marginTop: 8 }}>{money(Number(item.price))}</div>
                      </div>
                      <button style={styles.button} onClick={() => addToCart(item)}>إضافة</button>
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
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                          <div>
                            <div style={{ fontWeight: 700 }}>{item.name}</div>
                            <div style={{ color: "#64748b", marginTop: 4 }}>{money(Number(item.price) * item.qty)}</div>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <button style={styles.buttonSecondary} onClick={() => updateQty(item.id, -1)}><Minus size={16} /></button>
                            <div style={{ minWidth: 18, textAlign: "center" }}>{item.qty}</div>
                            <button style={styles.buttonSecondary} onClick={() => updateQty(item.id, 1)}><Plus size={16} /></button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div style={{ background: "#111111", color: "white", borderRadius: 18, padding: 16, display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 18 }}>
                    <span>الإجمالي</span>
                    <span>{money(cartTotal)}</span>
                  </div>
                  <button style={{ ...styles.button, opacity: isSaving ? 0.7 : 1 }} onClick={placeOrder} disabled={!customerName || !phone || cart.length === 0 || isSaving}>
                    {isSaving ? "جاري إرسال الطلب..." : "إرسال الطلب إلى النظام الحقيقي"}
                  </button>
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
                title={mode === "cashier" ? "لوحة الاستقبال المباشرة" : mode === "kitchen" ? "شاشة المطبخ المباشرة" : "شاشة الاستلام المباشرة"}
                sub="أي طلب جديد سيظهر هنا مباشرة لحظة إرساله من العميل"
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
                        <div key={`${order.id}-${idx}`} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span>{item.name} × {item.qty}</span>
                          <span style={{ fontWeight: 700 }}>{money(Number(item.price) * item.qty)}</span>
                        </div>
                      ))}
                    </div>

                    {order.notes ? <div style={{ border: "1px solid #e5e7eb", borderRadius: 18, padding: 14, marginTop: 12 }}>ملاحظات: {order.notes}</div> : null}

                    <div style={{ background: "#111111", color: "white", borderRadius: 18, padding: 16, display: "flex", justifyContent: "space-between", fontWeight: 800, marginTop: 12 }}>
                      <span>الإجمالي</span>
                      <span>{money(Number(order.total || 0))}</span>
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
                        <button style={{ ...styles.button, width: "100%" }} onClick={() => setOrderStatus(order.id, "delivered")}>تم التسليم</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {mode === "admin" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
            <div style={styles.card}>
              <SectionTitle icon={<Package size={20} />} title="إدارة المنيو الحقيقية" sub="أي تعديل هنا ينعكس مباشرة على صفحة العميل" />
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                {menu.map((item) => (
                  <div key={item.id} style={{ border: "1px solid #e5e7eb", borderRadius: 24, padding: 16, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{item.name}</div>
                      <div style={{ color: "#64748b", marginTop: 6 }}>{item.category} • {money(Number(item.price))} • {item.prepTime} دقائق</div>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ background: item.available ? "#d1fae5" : "#ffe4e6", color: item.available ? "#065f46" : "#9f1239", padding: "8px 12px", borderRadius: 999, fontWeight: 700 }}>
                        {item.available ? "متاح" : "غير متاح"}
                      </div>
                      <button style={styles.buttonSecondary} onClick={() => toggleAvailability(item.id, item.available)}>{item.available ? "إيقاف" : "تفعيل"}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={styles.card}>
                <div style={{ fontSize: 28, fontWeight: 800 }}>إعدادات التشغيل</div>
                <div style={{ color: "#64748b", marginTop: 6 }}>الآن النظام مربوط فعليًا بقاعدة بيانات مباشرة</div>
                <div style={{ marginTop: 16 }}>
                  <label style={{ display: "block", marginBottom: 8, color: "#64748b" }}>اسم الكوفي / التراك</label>
                  <input style={styles.input} value={truckName} onChange={(e) => setTruckName(e.target.value)} />
                </div>
              </div>

              <div style={styles.card}>
                <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>إضافة صنف جديد</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input style={styles.input} value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="اسم الصنف" />
                  <input style={styles.input} value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} placeholder="التصنيف" />
                  <input style={styles.input} value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} placeholder="السعر" />
                  <button style={styles.button} onClick={addMenuItem}>إضافة إلى قاعدة البيانات</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ ...styles.card, background: "#0f0f0f", color: "white", marginTop: 24 }}>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>ما الذي أصبح حقيقيًا الآن؟</div>
          <div style={{ color: "rgba(255,255,255,0.8)", lineHeight: 2 }}>
            1) المنيو الآن من قاعدة البيانات. <br />
            2) الطلبات تُرسل فعلًا إلى Firebase. <br />
            3) شاشة الكاشير والمطبخ والاستلام تتحدث لحظيًا. <br />
            4) تغيير الحالة يُحفظ مباشرة. <br />
            5) الخطوة التالية هي ربط واتساب أو SMS عند الجاهزية.
          </div>
        </div>
      </div>
    </div>
  );
}
