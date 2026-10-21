import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || ''
});

export async function POST(request: Request) {
  try {
    const { items } = await request.json();

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: items.map((item: any) => ({
          title: item.name,
          unit_price: Number(item.price),
          quantity: item.quantity,
          currency_id: 'COP'
        })),
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/?status=success`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/?status=failure`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/?status=pending`
        },
        auto_return: 'approved'
      }
    });

    return NextResponse.json({ init_point: result.init_point });
  } catch (error) {
    console.error('Error procesando pago:', error);
    return NextResponse.json({ error: 'Error al iniciar la sesión de pago' }, { status: 500 });
  }
}