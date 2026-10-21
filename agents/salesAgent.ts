export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
}

export async function processSalesAssistantMessage(
  userMessage: string,
  productsCatalog: Product[]
) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return 'Error: No se encontró la variable GEMINI_API_KEY en el archivo .env.local.';
    }

    const systemPrompt = `
Eres "Aura", la Asistente Virtual Inteligente de esta tienda e-commerce en Colombia.
Tu objetivo es asesorar a los clientes, recomendar productos del catálogo y ayudarles con cupones de descuento.

Catálogo de productos disponible:
${JSON.stringify(productsCatalog, null, 2)}

Reglas de respuesta:
1. Responde de manera amable, amigable y profesional.
2. Si el usuario busca algo específico, recomienda productos del catálogo incluyendo su nombre y precio en COP.
3. Si el usuario pide un descuento, ofrécele el código "COLOMBIA2026" para un 10% de descuento.
4. Mantén tus respuestas concisas y claras.
    `;

    // Apuntamos a gemini-3.8-flash según las instrucciones de la API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nPregunta del cliente: ${userMessage}` }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Error desde la API de Gemini:', data);
      return `Error de la API (${response.status}): ${data.error?.message || 'Verifica la clave API'}`;
    }

    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      '¡Hola! ¿En qué puedo ayudarte a elegir hoy?'
    );
  } catch (error: any) {
    console.error('Error en Sales Agent:', error);
    return `Error de red: ${error?.message || 'No se pudo conectar con el servidor'}`;
  }
}