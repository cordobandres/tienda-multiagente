import { NextResponse } from 'next/server';
import { validateOrderQA } from '@/agents/qaAgent';

export async function POST(request: Request) {
  try {
    const { cart, products } = await request.json();

    // Pequeño delay de 800ms para simular la verificación del agente en tiempo real
    await new Promise((resolve) => setTimeout(resolve, 800));

    const result = validateOrderQA(cart, products);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { isValid: false, message: 'Error de ejecución en el Agente QA' },
      { status: 500 }
    );
  }
}