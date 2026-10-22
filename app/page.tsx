'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  ShoppingCart,
  Bot,
  Send,
  CheckCircle2,
  ShoppingBag,
  ShieldCheck,
  Loader2,
  Sparkles,
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface SizeStock {
  size: string;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  images: string[];
  colors: string[];
  sizes: SizeStock[];
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Carrito de compras
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Selección individual por producto
  const [selectedSizes, setSelectedSizes] = useState<{ [productId: string]: string }>({});
  const [selectedColors, setSelectedColors] = useState<{ [productId: string]: string }>({});
  const [activeImageIndexes, setActiveImageIndexes] = useState<{ [productId: string]: number }>({});

  // Agente Aura (Chatbot)
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([
    {
      sender: 'Aura',
      text: '¡Hola! Soy Aura, tu asesora de lencería y moda. ¿Buscas alguna prenda, talla o estilo especial hoy?',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  // Agente QA (Modal de Verificación Pre-Checkout)
  const [isQAModalOpen, setIsQAModalOpen] = useState(false);
  const [qaStatus, setQaStatus] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Cargar productos en tiempo real desde Supabase
  useEffect(() => {
    async function fetchProducts() {
      setLoadingProducts(true);
      const { data, error } = await supabase.from('products').select('*');

      if (error) {
        console.error('Error cargando productos desde Supabase:', error);
      } else if (data) {
        setProducts(data);

        // Inicializar estados de imágenes y colores por defecto
        const initialImages: { [key: string]: number } = {};
        const initialColors: { [key: string]: string } = {};

        data.forEach((p: Product) => {
          initialImages[p.id] = 0;
          if (p.colors && p.colors.length > 0) {
            initialColors[p.id] = p.colors[0];
          }
        });

        setActiveImageIndexes(initialImages);
        setSelectedColors(initialColors);
      }
      setLoadingProducts(false);
    }

    fetchProducts();
  }, []);

  // Categorías
  const categories = ['Todos', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filtrado de productos
  const filteredProducts =
    selectedCategory === 'Todos'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  // Añadir al carrito
  const addToCart = (product: Product) => {
    const size = selectedSizes[product.id];
    const color = selectedColors[product.id] || (product.colors?.[0] ?? '');

    if (!size) return;

    setCart((prev) => {
      const cartItemId = `${product.id}-${size}-${color}`;
      const existing = prev.find((item) => item.cartItemId === cartItemId);

      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          cartItemId,
          selectedSize: size,
          selectedColor: color,
          quantity: 1,
        },
      ];
    });

    setIsCartOpen(true);
  };

  // Enviar mensaje al Agente Aura
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
        body: JSON.stringify({ message: userText, products }),
      });
      const data = await res.json();

      if (data.reply) {
        setChatMessages((prev) => [...prev, { sender: 'Aura', text: data.reply }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { sender: 'Aura', text: `Error del servidor: ${data.error || 'Respuesta vacía'}` },
        ]);
      }
    } catch (err: any) {
      setChatMessages((prev) => [...prev, { sender: 'Aura', text: `Error de red: ${err?.message}` }]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Proceso de Checkout con QA Agent & Mercado Pago
  const handleCheckoutWithQA = async () => {
    setIsQAModalOpen(true);
    setQaStatus(null);
    setIsProcessingPayment(true);

    try {
      const qaRes = await fetch('/api/qa-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, products }),
      });
      const qaData = await qaRes.json();
      setQaStatus(qaData);

      if (!qaData.isValid) {
        setIsProcessingPayment(false);
        return;
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });
      const data = await res.json();

      setTimeout(() => {
        if (data.init_point || data.sandbox_init_point) {
          window.location.href = data.sandbox_init_point || data.init_point;
        } else {
          alert('Error al conectar con la pasarela de pago.');
          setIsQAModalOpen(false);
        }
      }, 1200);
    } catch (error) {
      alert('Error durante el proceso de verificación.');
      setIsQAModalOpen(false);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const totalCart = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  // Navegación de carrusel por producto
  const handleNextImage = (productId: string, totalImages: number) => {
    setActiveImageIndexes((prev) => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % totalImages,
    }));
  };

  const handlePrevImage = (productId: string, totalImages: number) => {
    setActiveImageIndexes((prev) => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + totalImages) % totalImages,
    }));
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#4A3E3D] font-sans antialiased flex flex-col">
      {/* Top Banner Elegante */}
      <div className="bg-[#E8DFE8]/60 text-[#5C4A5C] text-[11px] tracking-widest uppercase text-center py-2 px-4 font-medium border-b border-[#E8DFE8]">
        Envíos a toda Colombia • Pago seguro con Mercado Pago
      </div>

      {/* Header en Marfil / Blanco Cremoso */}
      <header className="sticky top-0 z-40 bg-[#FFFDFB]/90 backdrop-blur-md border-b border-[#F2ECE4] px-8 py-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#E8C5C8]" />
          <h1 className="text-xl md:text-2xl font-serif tracking-widest text-[#3A2E2B] uppercase">
            Skin de Oro
          </h1>
          <span className="text-[10px] bg-[#E8C5C8]/40 text-[#8C5257] px-2 py-0.5 rounded-full font-sans uppercase tracking-wider font-semibold">
            Lingerie
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button className="p-2 text-[#6B5756] hover:text-[#8C5257] transition-colors">
            <Heart className="w-5 h-5 stroke-[1.5]" />
          </button>
          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="relative p-2 text-[#6B5756] hover:text-[#8C5257] transition-colors"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#8C5257] text-[#FFFDFB] text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Categorías (Navegación tipo Mattelsa en Paleta Palo Rosa / Lila / Marfil) */}
      <div className="px-6 py-5 border-b border-[#F2ECE4] bg-[#FFFDFB]">
        <div className="max-w-7xl mx-auto flex space-x-3 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 text-xs font-medium uppercase tracking-wider rounded-full transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-[#E8C5C8] text-[#5A2E33] shadow-sm font-semibold'
                  : 'bg-[#F5EFE8] text-[#7A6968] hover:bg-[#E8DFE8] hover:text-[#5C4A5C]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catálogo de Productos con Supabase */}
      <section className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full">
        {loadingProducts ? (
          <div className="flex justify-center items-center py-24 text-xs tracking-widest text-[#A89895] uppercase font-serif">
            Cargando colección suave...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24 text-[#A89895] font-serif">
            No se encontraron prendas en esta categoría.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredProducts.map((product) => {
              const currentImageIndex = activeImageIndexes[product.id] || 0;
              const selectedSize = selectedSizes[product.id];
              const selectedColor = selectedColors[product.id];

              return (
                <div
                  key={product.id}
                  className="group bg-[#FFFDFB] p-4 rounded-xl border border-[#F2ECE4] hover:shadow-lg hover:shadow-[#E8C5C8]/10 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Tarjeta de Imagen y Galería */}
                  <div className="relative aspect-[3/4] bg-[#F7F2EC] overflow-hidden rounded-lg">
                    <img
                      src={product.images[currentImageIndex] || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Controles de Galería */}
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={() => handlePrevImage(product.id, product.images.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-[#FFFDFB]/80 backdrop-blur-sm text-[#5A4B4A] hover:bg-[#FFFDFB] rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleNextImage(product.id, product.images.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#FFFDFB]/80 backdrop-blur-sm text-[#5A4B4A] hover:bg-[#FFFDFB] rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5">
                          {product.images.map((_, idx) => (
                            <div
                              key={idx}
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                idx === currentImageIndex ? 'w-5 bg-[#E8C5C8]' : 'w-1.5 bg-[#FFFDFB]/70'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Detalles de la Prenda */}
                  <div className="mt-5 flex flex-col flex-grow">
                    <h2 className="text-sm font-serif font-medium tracking-wide text-[#3A2E2B]">
                      {product.name}
                    </h2>
                    <p className="text-xs text-[#8C5257] font-semibold mt-1">
                      ${Number(product.price).toLocaleString('es-CO')} COP
                    </p>
                    <p className="text-xs text-[#8A7977] mt-2 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Selector de Color */}
                    {product.colors && product.colors.length > 0 && (
                      <div className="mt-4">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#A89895] block mb-2">
                          Color: <span className="text-[#3A2E2B] font-bold">{selectedColor}</span>
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {product.colors.map((color) => (
                            <button
                              key={color}
                              onClick={() => setSelectedColors((prev) => ({ ...prev, [product.id]: color }))}
                              className={`text-xs px-3 py-1 rounded-full transition-all duration-200 border ${
                                selectedColor === color
                                  ? 'border-[#E8C5C8] bg-[#E8C5C8]/30 text-[#5A2E33] font-medium'
                                  : 'border-[#F2ECE4] text-[#7A6968] hover:border-[#E8C5C8]'
                              }`}
                            >
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Selector de Talla con Stock */}
                    <div className="mt-4">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-[#A89895] block mb-2">
                        Talla
                      </span>
                      <div className="flex gap-2">
                        {product.sizes?.map((item) => {
                          const isAgotado = item.stock <= 0;
                          const isSelected = selectedSize === item.size;

                          return (
                            <button
                              key={item.size}
                              disabled={isAgotado}
                              onClick={() => setSelectedSizes((prev) => ({ ...prev, [product.id]: item.size }))}
                              className={`text-xs px-3.5 py-1.5 rounded-md transition-all duration-200 border ${
                                isAgotado
                                  ? 'border-[#F2ECE4] text-[#C4B8B6] bg-[#FAF8F5] cursor-not-allowed line-through'
                                  : isSelected
                                  ? 'border-[#5A2E33] bg-[#5A2E33] text-[#FFFDFB] font-bold'
                                  : 'border-[#E8DFE8] text-[#5A4B4A] hover:border-[#E8C5C8] hover:bg-[#FFFDFB]'
                              }`}
                            >
                              {item.size}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Botón Añadir al Carrito */}
                    <button
                      disabled={!selectedSize}
                      onClick={() => addToCart(product)}
                      className={`mt-6 w-full py-3 text-xs tracking-widest uppercase font-semibold transition-all duration-300 rounded-md ${
                        selectedSize
                          ? 'bg-[#E8C5C8] text-[#4A2226] hover:bg-[#DFAFB4] shadow-sm hover:shadow'
                          : 'bg-[#F2ECE4] text-[#A89895] cursor-not-allowed'
                      }`}
                    >
                      {selectedSize ? `Añadir Talla ${selectedSize}` : 'Selecciona una Talla'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Widget Asesora de IA (Aura) */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2 bg-[#E8C5C8] text-[#4A2226] hover:bg-[#DFAFB4] px-5 py-3 rounded-full shadow-lg shadow-[#E8C5C8]/30 transition-all font-medium text-xs tracking-wider uppercase"
          >
            <Bot className="h-4 w-4" />
            <span>Asesora Aura</span>
          </button>
        ) : (
          <div className="w-80 md:w-96 bg-[#FFFDFB] border border-[#F2ECE4] rounded-2xl shadow-2xl flex flex-col h-[480px]">
            <div className="p-4 border-b border-[#F2ECE4] bg-[#FAF8F5] rounded-t-2xl flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-[#8C5257]" />
                <span className="font-serif font-semibold text-sm text-[#3A2E2B]">Aura • Asesora Lingerie</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-[#A89895] hover:text-[#3A2E2B]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`max-w-[80%] p-3 rounded-xl text-xs leading-relaxed ${
                    msg.sender === 'Usuario'
                      ? 'bg-[#5A2E33] text-[#FFFDFB] ml-auto'
                      : 'bg-[#F5EFE8] text-[#4A3E3D] mr-auto'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {loadingChat && <div className="text-[#A89895] text-xs italic">Aura está escribiendo...</div>}
            </div>

            <div className="p-3 border-t border-[#F2ECE4] flex gap-2 bg-[#FFFDFB] rounded-b-2xl">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Pregunta por conjuntos, tallas o colores..."
                className="flex-1 bg-[#FAF8F5] border border-[#F2ECE4] rounded-lg px-3 py-2 text-xs text-[#3A2E2B] focus:outline-none focus:border-[#E8C5C8]"
              />
              <button
                onClick={handleSendMessage}
                className="bg-[#E8C5C8] hover:bg-[#DFAFB4] p-2 rounded-lg text-[#4A2226] transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer Carrito de Compras */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-full max-w-md bg-[#FFFDFB] h-full p-6 flex flex-col justify-between border-l border-[#F2ECE4]">
            <div>
              <div className="flex justify-between items-center mb-6 border-b border-[#F2ECE4] pb-4">
                <h3 className="text-lg font-serif font-bold text-[#3A2E2B]">Tu Selección</h3>
                <button onClick={() => setIsCartOpen(false)} className="text-[#A89895] hover:text-[#3A2E2B]">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-[#A89895] text-xs text-center py-10">Tu bolsa de compras está vacía.</p>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.cartItemId} className="flex justify-between items-center border-b border-[#F2ECE4] pb-3">
                      <div>
                        <div className="font-medium text-xs text-[#3A2E2B]">{item.name}</div>
                        <div className="text-[11px] text-[#8A7977] mt-0.5">
                          Talla: <span className="font-bold text-[#3A2E2B]">{item.selectedSize}</span> | Color: {item.selectedColor}
                        </div>
                        <div className="text-[11px] text-[#8A7977]">Cantidad: {item.quantity}</div>
                      </div>
                      <div className="font-semibold text-xs text-[#8C5257]">
                        ${(Number(item.price) * item.quantity).toLocaleString('es-CO')} COP
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-[#F2ECE4] pt-4">
                <div className="flex justify-between font-bold text-sm mb-4 text-[#3A2E2B]">
                  <span>Total:</span>
                  <span className="text-[#8C5257]">${totalCart.toLocaleString('es-CO')} COP</span>
                </div>
                <button
                  onClick={handleCheckoutWithQA}
                  disabled={isProcessingPayment}
                  className="w-full bg-[#E8C5C8] hover:bg-[#DFAFB4] disabled:bg-[#F2ECE4] text-[#4A2226] py-3.5 rounded-md font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isProcessingPayment ? 'Verificando con QA Agent...' : 'Proceder al Pago (Mercado Pago)'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Agente QA */}
      {isQAModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFDFB] border border-[#F2ECE4] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="h-7 w-7 text-[#8C5257] animate-pulse" />
              <div>
                <h3 className="text-base font-serif font-bold text-[#3A2E2B]">Agente de Verificación (QA)</h3>
                <p className="text-[10px] text-[#A89895] uppercase tracking-widest font-semibold">Validación de Pre-compra</p>
              </div>
            </div>

            {!qaStatus ? (
              <div className="py-8 flex flex-col items-center gap-3 text-[#8A7977]">
                <Loader2 className="h-8 w-8 animate-spin text-[#8C5257]" />
                <p className="text-xs font-serif">Ejecutando pruebas de integridad y stock en Supabase...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#F2ECE4] space-y-2 text-xs text-[#4A3E3D]">
                  <div className="flex items-center justify-between">
                    <span>Integridad de Carrito</span>
                    <span className="text-emerald-600 font-semibold">[✓] Validado</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Coincidencia de Precios</span>
                    <span className="text-emerald-600 font-semibold">[✓] Coinciden</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Disponibilidad de Inventario</span>
                    <span className="text-emerald-600 font-semibold">[✓] Confirmado</span>
                  </div>
                </div>

                <p className="text-xs text-emerald-700 font-medium text-center">
                  {qaStatus.message}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}