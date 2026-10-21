import { NextResponse } from 'next/server';
import { processSalesAssistantMessage } from '../../../agents/salesAgent';

export async function POST(request: Request) {
  try {
    const { message, products } = await request.json();
    const reply = await processSalesAssistantMessage(message, products);
    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar mensaje' }, { status: 500 });
  }
}