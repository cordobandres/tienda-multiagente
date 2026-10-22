import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Mercado Pago envía notificaciones tipo 'payment'
    if (body.type === 'payment' && body.data?.id) {
      const paymentId = body.data.id;

      // 1. Consultar estado del pago a la API de Mercado Pago
      const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      });

      const paymentData = await paymentRes.json();

      // 2. Si el pago fue aprobado, descontar el inventario en Supabase
      if (paymentData.status === 'approved') {
        const items = paymentData.additional_info?.items || [];

        for (const item of items) {
          const productId = item.id;
          const purchasedSize = item.category_id; // Guardamos la talla aquí en el checkout
          const quantity = Number(item.quantity) || 1;

          // Obtener las tallas actuales del producto
          const { data: product } = await supabase
            .from('products')
            .select('sizes')
            .eq('id', productId)
            .single();

          if (product && product.sizes) {
            const updatedSizes = product.sizes.map((s: { size: string; stock: number }) => {
              if (s.size === purchasedSize) {
                return { ...s, stock: Math.max(0, s.stock - quantity) };
              }
              return s;
            });

            // Actualizar arreglo de tallas en la base de datos
            await supabase
              .from('products')
              .update({ sizes: updatedSizes })
              .eq('id', productId);
          }
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error en Webhook Mercado Pago:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}