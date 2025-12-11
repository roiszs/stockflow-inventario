import { useState, useEffect } from "react";


type Product = {
  id: number;
  name: string;
  price: number; // en MXN
  stock: number;
};

type Sale = {
  id: number;
  productId: number;
  quantity: number;
  date: string;
};

const initialProducts: Product[] = [
  { id: 1, name: "Caja de guantes", price: 150, stock: 40 },
  { id: 2, name: "Gel antibacterial 1L", price: 90, stock: 25 },
  { id: 3, name: "Cubrebocas caja 50 pzas", price: 200, stock: 30 },
];

//Inicializar products leyendo de localStorage
function App() {
  const [products, setProducts] = useState<Product[]>(() => {
  const stored = localStorage.getItem("stockflow_products");
  if (stored) {
    try {
      return JSON.parse(stored) as Product[];
    } catch {
      return initialProducts;
    }
  }
  return initialProducts;
});
//Inicializar sales leyendo de localStorage
  const [sales, setSales] = useState<Sale[]>(() => {
  const stored = localStorage.getItem("stockflow_sales");
  if (stored) {
    try {
      return JSON.parse(stored) as Sale[];
    } catch {
      return [];
    }
  }
  return [];
});
//Guardar automáticamente cuando cambian products o sales
useEffect(() => {
  localStorage.setItem("stockflow_products", JSON.stringify(products));
}, [products]);

useEffect(() => {
  localStorage.setItem("stockflow_sales", JSON.stringify(sales));
}, [sales]);


  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [quantity, setQuantity] = useState<number>(1);

  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    if (quantity <= 0) {
      alert("La cantidad debe ser mayor a 0");
      return;
    }

    if (quantity > product.stock) {
      alert("No hay suficiente stock para esta venta");
      return;
    }

    const newSale: Sale = {
      id: Date.now(),
      productId: product.id,
      quantity,
      date: new Date().toLocaleString(),
    };

    // Actualizar ventas
    setSales((prev) => [...prev, newSale]);

    // Actualizar stock del producto
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, stock: p.stock - quantity } : p
      )
    );

    setQuantity(1);
  };

  const totalVentas = sales.length;
  const totalUnidades = sales.reduce((acc, sale) => acc + sale.quantity, 0);
  const totalIngresos = sales.reduce((acc, sale) => {
    const product = products.find((p) => p.id === sale.productId);
    return acc + (product ? product.price * sale.quantity : 0);
  }, 0);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>StockFlow</h1>
        <p style={styles.subtitle}>Mini sistema de inventario y ventas</p>
      </header>

      <main style={styles.main}>
        {/* Métricas */}
        <section style={styles.cardsRow}>
          <div style={styles.card}>
            <h3>Ventas registradas</h3>
            <p style={styles.cardNumber}>{totalVentas}</p>
          </div>
          <div style={styles.card}>
            <h3>Unidades vendidas</h3>
            <p style={styles.cardNumber}>{totalUnidades}</p>
          </div>
          <div style={styles.card}>
            <h3>Ingresos totales</h3>
            <p style={styles.cardNumber}>${totalIngresos.toFixed(2)} MXN</p>
          </div>
        </section>

        {/* Registrar venta */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Registrar nueva venta</h2>
          <form onSubmit={handleAddSale} style={styles.form}>
            <div style={styles.formGroup}>
              <label>Producto</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(Number(e.target.value))}
                style={styles.input}
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (stock: {product.stock})
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label>Cantidad</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                style={styles.input}
              />
            </div>

            <button type="submit" style={styles.button}>
              Registrar venta
            </button>
          </form>
        </section>

        {/* Tabla de ventas */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Historial de ventas</h2>
          {sales.length === 0 ? (
            <p style={styles.emptyText}>Aún no hay ventas registradas.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Fecha</th>
                  <th style={styles.th}>Producto</th>
                  <th style={styles.th}>Cantidad</th>
                  <th style={styles.th}>Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => {
                  const product = products.find(
                    (p) => p.id === sale.productId
                  );
                  const total = product
                    ? product.price * sale.quantity
                    : 0;
                  return (
                    <tr key={sale.id}>
                      <td style={styles.td}>{sale.date}</td>
                      <td style={styles.td}>{product?.name ?? "N/A"}</td>
                      <td style={styles.td}>{sale.quantity}</td>
                      <td style={styles.td}>${total.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "#e5e7eb",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    padding: "2rem 1rem",
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "2.5rem",
    margin: 0,
  },
  subtitle: {
    marginTop: "0.5rem",
    opacity: 0.8,
  },
  main: {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  cardsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
  },
  card: {
    background: "#020617",
    padding: "1.25rem",
    borderRadius: "0.75rem",
    boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
  },
  cardNumber: {
    fontSize: "1.8rem",
    fontWeight: 700,
    marginTop: "0.5rem",
  },
  section: {
    background: "#020617",
    padding: "1.5rem",
    borderRadius: "0.75rem",
    boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: "1rem",
  },
  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
    alignItems: "flex-end",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  input: {
    padding: "0.5rem 0.75rem",
    borderRadius: "0.5rem",
    border: "1px solid #475569",
    background: "#020617",
    color: "#e5e7eb",
  },
  button: {
    padding: "0.7rem 1rem",
    borderRadius: "0.75rem",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    background:
      "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
  },
  emptyText: {
    opacity: 0.8,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "0.5rem",
  },
  th: {
    textAlign: "left",
    padding: "0.6rem",
    borderBottom: "1px solid #1f2937",
    fontWeight: 600,
  },
  td: {
    padding: "0.6rem",
    borderBottom: "1px solid #111827",
    fontSize: "0.9rem",
  },
};

export default App;
