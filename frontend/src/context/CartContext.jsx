import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('medifly_cart');
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('medifly_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (medicine, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === medicine.id);
      if (existing) {
        return prev.map(i => i.id === medicine.id ? { ...i, qty: i.qty + qty } : i);
      }
      return [...prev, { ...medicine, qty }];
    });
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return removeItem(id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const hasColdChain = items.some(i => i.coldChain);
  const hasRx = items.some(i => i.prescriptionRequired);

  return (
    <CartContext.Provider value={{
      items, isOpen, setIsOpen,
      addItem, removeItem, updateQty, clearCart,
      totalItems, subtotal, hasColdChain, hasRx
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
