import React, { useEffect, useMemo, useState } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Search,
  Store,
  Globe,
  Sun,
  Moon,
  CreditCard,
  Wallet,
  Banknote,
  CheckCircle2,
} from "lucide-react";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  serverTimestamp,
  getDocs,
  setDoc,
  doc,
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
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80",
    description: "قهوة مثلجة بحليب غني ولمسة كراميل ناعمة.",
  },
  {
    name: "آيس لاتيه",
    category: "القهوة",
    price: 16,
    available: true,
    prepTime: 3,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
    description: "إسبريسو بارد مع حليب طازج وطعم متوازن.",
  },
  {
    name: "برغر لحم",
    category: "الوجبات",
    price: 28,
    available: true,
    prepTime: 9,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
    description: "برغر لحم طازج مع جبن وصوص خاص وخبز محمص.",
  },
  {
    name: "برغر دجاج",
    category: "الوجبات",
    price: 25,
    available: true,
    prepTime: 8,
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80",
    description: "برغر دجاج مقرمش مع خس وصوص خفيف.",
  },
  {
    name: "بطاطس",
    category: "الإضافات",
    price: 12,
    available: true,
    prepTime: 4,
    image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=900&q=80",
    description: "بطاطس ذهبية مقرمشة تقدم ساخنة.",
  },
];

const defaultBrand = {
  brandName: "KRS Coffee Truck",
  logoUrl: "",
  primaryColor: "#111111",
  accentColor: "#c8a96b",
  heroTitle: "اطلب مباشرة",
  heroSubtitle: "تجربة سريعة ونظيفة لطلبك من الجوال.",
};

const translations = {
  ar: {
    dir: "rtl",
    menu: "المنيو",
    search: "ابحث في المنيو",
    cart: "السلة",
    add: "إضافة",
    total: "الإجمالي",
    continue: "إكمال الطلب",
    customerName: "اسم العميل",
    phone: "رقم الهاتف",
    notes: "ملاحظات عامة",
    itemNotes: "ملاحظات الصنف",
    payment: "طريقة الدفع",
    applePay: "Apple Pay",
    card: "بطاقة",
    cash: "كاش",
    pickup: "عند الاستلام",
    sendOrder: "تأكيد وإرسال الطلب",
    sending: "جاري إرسال الطلب...",
    empty: "السلة فارغة",
    prep: "وقت التحضير",
    mins: "دقائق",
    theme: "الوضع",
    language: "اللغة",
    all: "الكل",
    back: "رجوع",
    success: "تم إرسال طلبك بنجاح",
  },
  en: {
    dir: "ltr",
    menu: "Menu",
    search: "Search menu",
    cart: "Cart",
    add: "Add",
    total: "Total",
    continue: "Checkout",
    customerName: "Customer name",
    phone: "Phone number",
    notes: "General notes",
    itemNotes: "Item notes",
    payment: "Payment method",
    applePay: "Apple Pay",
    card: "Card",
    cash: "Cash",
    pickup: "Pay on pickup",
    sendOrder: "Confirm & send",
    sending: "Sending order...",
    empty: "Your cart is empty",
    prep: "Prep time",
    mins: "mins",
    theme: "Theme",
    language: "Language",
    all: "All",
    back: "Back",
    success: "Your order has been sent successfully",
  },
};

function money(value) {
  return `${Number(value || 0).toFixed(2)} د.إ`;
}

function useViewport() {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1440);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return { isMobile: width <= 768, width };
}

export default function CustomerPage() {
  const { isMobile } = useViewport();
  const [menu, setMenu] = useState([]);
  const [brand, setBrand] = useState(defaultBrand);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [language, setLanguage] = useState("ar");
  const [theme, setTheme] = useState("light");
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("apple_pay");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const t = translations[language];
  const isDark = theme === "dark";
  const primaryColor = brand.primaryColor || "#111111";
  const accentColor = brand.accentColor || "#c8a96b";

  useEffect(() => {
    const bootstrap = async () => {
      const currentMenu = await getDocs(collection(db, "menu"));
      if (currentMenu.empty) {
        for (const item of defaultMenu) {
          await addDoc(collection(db, "menu"), { ...item, createdAt: serverTimestamp() });
        }
      }
      await setDoc(doc(db, "settings", "brand"), defaultBrand, { merge: true });
    };
    bootstrap();

    const unsubMenu = onSnapshot(query(collection(db, "menu")), (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMenu(items);
    });

    const unsubBrand = onSnapshot(doc(db, "settings", "brand"), (snapshot) => {
      if (snapshot.exists()) setBrand((prev) => ({ ...prev, ...snapshot.data() }));
    });

    return () => {
      unsubMenu();
      unsubBrand();
    };
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(menu.map((item) => item.category).filter(Boolean)));
    return [t.all, ...cats];
  }, [menu, t.all]);

  const visibleMenu = useMemo(() => {
    return menu.filter((item) => {
      const matchSearch = (item.name || "").toLowerCase().includes(search.toLowerCase()) || (item.category || "").toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === t.all || item.category === selectedCategory;
      return item.available && matchSearch && matchCategory;
    });
  }, [menu, search, selectedCategory, t.all]);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.qty * Number(item.price), 0), [cart]);

  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === item.id);
      if (exists) return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
      return [...prev, { id: item.id, name: item.name, price: Number(item.price), qty: 1, image: item.image || "", note: "" }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item)).filter((item) => item.qty > 0));
  };

  const updateItemNote = (id, note) => {
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, note } : item)));
  };

  const placeOrder = async () => {
    if (!customerName.trim() || !phone.trim() || cart.length === 0) return;
    try {
      setIsSaving(true);
      const countSnap = await getDocs(collection(db, "orders"));
      const nextNumber = 100 + countSnap.size + 1;
      await addDoc(collection(db, "orders"), {
        orderCode: `KRS-${nextNumber}`,
        customerName,
        phone,
        notes,
        items: cart.map((item) => ({ name: item.name, price: item.price, qty: item.qty, itemNote: item.note || "" })),
        total: cartTotal,
        paymentMethod,
        status: "new",
        source: "customer_page",
        createdAt: serverTimestamp(),
      });
      setSuccessMessage(t.success);
      setCart([]);
      setCustomerName("");
      setPhone("");
      setNotes("");
      setPaymentMethod("apple_pay");
      setShowCheckout(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const pageBg = isDark ? "#0b0b0c" : "#f6f3ec";
  const cardBg = isDark ? "#121316" : "#ffffff";
  const softBg = isDark ? "#17191d" : "#f8f8f8";
  const textColor = isDark ? "#f8fafc" : "#111827";
  const mutedColor = isDark ? "#cbd5e1" : "#6b7280";
  const borderColor = isDark ? "#262a31" : "#e5e7eb";

  return (
    <div style={{ minHeight: "100vh", background: pageBg, color: textColor, direction: t.dir, fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 1220, margin: "0 auto", padding: isMobile ? 14 : 20 }}>
        <div
          style={{
            background: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: 28,
            padding: isMobile ? 16 : 20,
            boxShadow: isDark ? "none" : "0 12px 30px rgba(0,0,0,0.05)",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
              {brand.logoUrl ? (
                <img src={brand.logoUrl} alt={brand.brandName} style={{ width: 54, height: 54, borderRadius: 18, objectFit: "cover" }} />
              ) : (
                <div style={{ width: 54, height: 54, borderRadius: 18, background: softBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Store size={24} color={primaryColor} />
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, color: mutedColor }}>KRS</div>
                <div style={{ fontSize: isMobile ? 20 : 28, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{brand.brandName}</div>
                <div style={{ color: mutedColor, marginTop: 4, fontSize: 14 }}>{brand.heroSubtitle}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => setLanguage((prev) => (prev === "ar" ? "en" : "ar"))}
                style={{ width: 46, height: 46, borderRadius: 14, border: `1px solid ${borderColor}`, background: softBg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                title={t.language}
              >
                <Globe size={18} color={textColor} />
              </button>
              <button
                onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
                style={{ width: 46, height: 46, borderRadius: 14, border: `1px solid ${borderColor}`, background: softBg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                title={t.theme}
              >
                {isDark ? <Moon size={18} color={textColor} /> : <Sun size={18} color={textColor} />}
              </button>
            </div>
          </div>
        </div>

        {successMessage ? (
          <div style={{ marginBottom: 16, background: isDark ? "#0f2a1f" : "#ecfdf5", border: "1px solid #86efac", color: isDark ? "#bbf7d0" : "#166534", borderRadius: 18, padding: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle2 size={18} /> {successMessage}
          </div>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0,1.7fr) 360px", gap: 18, alignItems: "start" }}>
          <div>
            <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 28, padding: isMobile ? 14 : 18, boxShadow: isDark ? "none" : "0 12px 30px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
                <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800 }}>{t.menu}</div>
                <div style={{ position: "relative", width: isMobile ? "100%" : 280 }}>
                  <Search size={16} style={{ position: "absolute", top: 14, left: t.dir === "ltr" ? 12 : "auto", right: t.dir === "rtl" ? 12 : "auto", color: mutedColor }} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t.search}
                    style={{ width: "100%", boxSizing: "border-box", borderRadius: 16, border: `1px solid ${borderColor}`, background: softBg, color: textColor, padding: t.dir === "rtl" ? "12px 40px 12px 14px" : "12px 14px 12px 40px", fontSize: 14 }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    style={{
                      borderRadius: 999,
                      padding: "10px 14px",
                      border: `1px solid ${selectedCategory === category ? primaryColor : borderColor}`,
                      background: selectedCategory === category ? primaryColor : softBg,
                      color: selectedCategory === category ? "white" : textColor,
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                {visibleMenu.map((item) => (
                  <div key={item.id} style={{ background: softBg, border: `1px solid ${borderColor}`, borderRadius: 24, overflow: "hidden" }}>
                    <img src={item.image} alt={item.name} style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />
                    <div style={{ padding: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 18 }}>{item.name}</div>
                          <div style={{ color: mutedColor, fontSize: 13, marginTop: 4 }}>{item.category}</div>
                        </div>
                        <div style={{ fontWeight: 800, color: primaryColor, whiteSpace: "nowrap" }}>{money(item.price)}</div>
                      </div>
                      <div style={{ color: mutedColor, fontSize: 14, lineHeight: 1.7, marginTop: 10, minHeight: 48 }}>{item.description}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, gap: 10 }}>
                        <div style={{ fontSize: 13, color: mutedColor }}>{t.prep}: {item.prepTime} {t.mins}</div>
                        <button onClick={() => addToCart(item)} style={{ background: primaryColor, color: "white", border: "none", borderRadius: 14, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>{t.add}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ position: isMobile ? "relative" : "sticky", top: 18 }}>
            <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 28, padding: isMobile ? 14 : 18, boxShadow: isDark ? "none" : "0 12px 30px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 24, fontWeight: 800 }}>
                  <ShoppingCart size={20} /> {t.cart}
                </div>
                <div style={{ color: mutedColor, fontSize: 13 }}>{cart.length}</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {cart.length === 0 ? (
                  <div style={{ background: softBg, border: `1px solid ${borderColor}`, borderRadius: 18, padding: 16, color: mutedColor }}>{t.empty}</div>
                ) : cart.map((item) => (
                  <div key={item.id} style={{ background: softBg, border: `1px solid ${borderColor}`, borderRadius: 18, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{item.name}</div>
                        <div style={{ color: mutedColor, marginTop: 4, fontSize: 13 }}>{money(item.price * item.qty)}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button onClick={() => updateQty(item.id, -1)} style={{ width: 30, height: 30, borderRadius: 10, border: `1px solid ${borderColor}`, background: cardBg, cursor: "pointer" }}><Minus size={14} /></button>
                        <div style={{ minWidth: 18, textAlign: "center" }}>{item.qty}</div>
                        <button onClick={() => updateQty(item.id, 1)} style={{ width: 30, height: 30, borderRadius: 10, border: `1px solid ${borderColor}`, background: cardBg, cursor: "pointer" }}><Plus size={14} /></button>
                      </div>
                    </div>
                    <textarea
                      value={item.note}
                      onChange={(e) => updateItemNote(item.id, e.target.value)}
                      placeholder={t.itemNotes}
                      style={{ width: "100%", boxSizing: "border-box", marginTop: 10, minHeight: 72, borderRadius: 14, border: `1px solid ${borderColor}`, background: cardBg, color: textColor, padding: 12, resize: "vertical" }}
                    />
                  </div>
                ))}

                <div style={{ background: primaryColor, color: "white", borderRadius: 18, padding: 16, display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
                  <span>{t.total}</span>
                  <span>{money(cartTotal)}</span>
                </div>

                {!showCheckout ? (
                  <button onClick={() => setShowCheckout(true)} disabled={cart.length === 0} style={{ background: primaryColor, color: "white", border: "none", borderRadius: 16, padding: "14px 16px", fontWeight: 800, cursor: "pointer", opacity: cart.length === 0 ? 0.5 : 1 }}>
                    {t.continue}
                  </button>
                ) : (
                  <div style={{ background: softBg, border: `1px solid ${borderColor}`, borderRadius: 20, padding: 14 }}>
                    <div style={{ display: "grid", gap: 12 }}>
                      <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={t.customerName} style={{ width: "100%", boxSizing: "border-box", borderRadius: 14, border: `1px solid ${borderColor}`, background: cardBg, color: textColor, padding: 12 }} />
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.phone} style={{ width: "100%", boxSizing: "border-box", borderRadius: 14, border: `1px solid ${borderColor}`, background: cardBg, color: textColor, padding: 12 }} />

                      <div>
                        <div style={{ fontWeight: 700, marginBottom: 10 }}>{t.payment}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          {[
                            ["apple_pay", t.applePay, <Wallet size={16} />],
                            ["card", t.card, <CreditCard size={16} />],
                            ["cash", t.cash, <Banknote size={16} />],
                            ["pickup", t.pickup, <CheckCircle2 size={16} />],
                          ].map(([value, label, icon]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setPaymentMethod(value)}
                              style={{
                                borderRadius: 14,
                                border: `1px solid ${paymentMethod === value ? primaryColor : borderColor}`,
                                background: paymentMethod === value ? primaryColor : cardBg,
                                color: paymentMethod === value ? "white" : textColor,
                                padding: "12px 10px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                fontWeight: 700,
                              }}
                            >
                              {icon}
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t.notes} style={{ width: "100%", boxSizing: "border-box", minHeight: 90, borderRadius: 14, border: `1px solid ${borderColor}`, background: cardBg, color: textColor, padding: 12, resize: "vertical" }} />
                    </div>

                    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 10, marginTop: 12 }}>
                      <button onClick={() => setShowCheckout(false)} style={{ flex: 1, borderRadius: 14, border: `1px solid ${borderColor}`, background: cardBg, color: textColor, padding: "12px 14px", cursor: "pointer", fontWeight: 700 }}>
                        {t.back}
                      </button>
                      <button onClick={placeOrder} disabled={!customerName || !phone || isSaving} style={{ flex: 1, borderRadius: 14, border: "none", background: primaryColor, color: "white", padding: "12px 14px", cursor: "pointer", fontWeight: 800, opacity: !customerName || !phone || isSaving ? 0.6 : 1 }}>
                        {isSaving ? t.sending : t.sendOrder}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
