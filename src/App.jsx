import React, { useEffect, useMemo, useState } from "react";
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
} from "firebase/firestore";

/* 🔥 ضع بياناتك هنا */
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
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const q1 = query(collection(db, "menu"));
    const q2 = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubMenu = onSnapshot(q1, (snap) => {
      setMenu(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubOrders = onSnapshot(q2, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubMenu();
      unsubOrders();
    };
  }, []);

  const total = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * i.qty, 0),
    [cart]
  );

  const addToCart = (item) => {
    const exist = cart.find((i) => i.id === item.id);
    if (exist) {
      setCart(
        cart.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        )
      );
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const sendOrder = async () => {
    if (!name || !phone || cart.length === 0) return;

    await addDoc(collection(db, "orders"), {
      name,
      phone,
      items: cart,
      total,
      status: "new",
      createdAt: serverTimestamp(),
    });

    setCart([]);
    setName("");
    setPhone("");
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>🔥 KRS Order System (Live)</h1>

      {/* العميل */}
      <h2>👤 العميل</h2>
      <input
        placeholder="الاسم"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="رقم الهاتف"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <h3>المنيو</h3>
      {menu.map((item) => (
        <div key={item.id}>
          {item.name} - {item.price} AED
          <button onClick={() => addToCart(item)}>إضافة</button>
        </div>
      ))}

      <h3>السلة</h3>
      {cart.map((i) => (
        <div key={i.id}>
          {i.name} x {i.qty}
        </div>
      ))}

      <h3>الإجمالي: {total} AED</h3>
      <button onClick={sendOrder}>إرسال الطلب</button>

      {/* الكاشير */}
      <h2>💻 الكاشير</h2>
      {orders.map((o) => (
        <div key={o.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
          <b>{o.name}</b> ({o.phone})
          <div>
            {o.items?.map((i, idx) => (
              <div key={idx}>
                {i.name} x {i.qty}
              </div>
            ))}
          </div>
          <b>{o.total} AED</b>
        </div>
      ))}
    </div>
  );
}
