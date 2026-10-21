'use client';

import { useState } from 'react';
import { ShoppingCart, Bot, Send, CheckCircle2, ShoppingBag } from 'lucide-react';

const PRODUCTS = [
  { id: '1', name: 'Chaqueta Streetwear Oversize', price: 180000, category: 'Ropa', description: 'Chaqueta urbana impermeable con estilo moderno.' },
  { id: '2', name: 'Sartén Antiadherente Ceramic Pro', price: 120000, category: 'Hogar', description: 'Cocina saludable sin aceite con recubrimiento cerámico.' },
  { id: '3', name: 'Audífonos Bluetooth Noise Cancelling', price: 250000, category: 'Tecnología', description: 'Cancelación de ruido activa y batería de 30 horas.' },
  { id: '4', name: 'Café Especial Origen Huila 500g', price: 45000, category: 'Alimentos', description: 'Café arábico Premium con notas dulces y acidez balanceada.' }
];

export default function Home() {
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([
    { sender: 'Aura', text: '¡Hola! Soy Aura, tu asistente virtual. ¿Buscabas alguna recomendación u oferta especial hoy?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setChatMessages((prev) => [...prev, { sender: 'Usuario', text: userText }]);
    setInputMessage('');
    setLoadingChat(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, products: PRODUCTS })
      });
      const data = await res.json();
      
      if (data.reply) {
        setChatMessages((prev) => [...prev, { sender: 'Aura', text: data.reply }]);
      } else {
        setChatMessages((prev) => [...prev, { sender: 'Aura', text: `Error del servidor: ${data.error || 'Respuesta vacía'}` }]);
      }
    } catch (err: any) {
      setChatMessages((prev) => [...prev, { sender: 'Aura', text: `Error de red: ${err?.message}` }]);
    } finally {
      setLoadingChat(false);
    }
  };

  const totalCart = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-indigo-400" />
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Tienda Multiagente
          </h1>
        </div>
        <button
          onClick={() => setIsCartOpen(!isCartOpen)}
          className="relative p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition"
        >
          <ShoppingCart className="h-5 w-5 text-slate-200" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
          )}
        </button>
      </header>

      {/* Catálogo de Productos */}
      <main className="max-w-6xl mx-auto px-6 py-10 flex-1 w-full">
        <h2 className="text-2xl font-bold mb-6">Catálogo Destacado</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((prod) => (
            <div key={prod.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
              <div>
                <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">{prod.category}</span>
                <h3 className="text-lg font-semibold mt-1 mb-2">{prod.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{prod.description}</p>
              </div>
              <div>
                <div className="text-xl font-bold text-emerald-400 mb-3">
                  ${prod.price.toLocaleString('es-CO')} COP
                </div>
                <button
                  onClick={() => addToCart(prod)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg font-medium text-sm transition"
                >
                  Añadir al carrito
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Widget de Agente de Ventas "Aura" */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-full shadow-lg transition"
          >
            <Bot className="h-5 w-5" />
            <span className="font-medium text-sm">Hablar con Asistente IA</span>
          </button>
        ) : (
          <div className="w-80 md:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[480px]">
            <div className="p-4 border-b border-slate-800 bg-slate-950/50 rounded-t-2xl flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-indigo-400" />
                <span className="font-semibold text-sm">Aura - Agente de Ventas</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white text-xs">Cerrar</button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`max-w-[80%] p-3 rounded-xl text-sm ${
                    msg.sender === 'Usuario'
                      ? 'bg-indigo-600 text-white ml-auto'
                      : 'bg-slate-800 text-slate-200 mr-auto'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {loadingChat && <div className="text-slate-500 text-xs italic">Aura está escribiendo...</div>}
            </div>

            <div className="p-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Pregunta por un producto o descuento..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <button onClick={handleSendMessage} className="bg-indigo-600 hover:bg-indigo-500 p-2 rounded-lg text-white">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer Carrito */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-slate-900 h-full p-6 flex flex-col justify-between border-l border-slate-800">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Carrito de Compras</h3>
                <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              {cart.length === 0 ? (
                <p className="text-slate-400 text-sm">El carrito está vacío.</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <div>
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-slate-400">Cantidad: {item.quantity}</div>
                      </div>
                      <div className="font-semibold text-sm text-emerald-400">
                        ${(item.price * item.quantity).toLocaleString('es-CO')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-slate-800 pt-4">
                <div className="flex justify-between font-bold text-lg mb-4">
                  <span>Total:</span>
                  <span className="text-emerald-400">${totalCart.toLocaleString('es-CO')} COP</span>
                </div>
                <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Proceder al Pago (Mercado Pago)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}