export interface QAValidationResult {
  isValid: boolean;
  checks: {
    cartNotEmpty: boolean;
    pricesMatchCatalog: boolean;
    stockAvailable: boolean;
    credentialsValid: boolean;
  };
  message: string;
}

export function validateOrderQA(cartItems: any[], catalog: any[]): QAValidationResult {
  // 1. Validar que el carrito no esté vacío
  const cartNotEmpty = cartItems && cartItems.length > 0;

  // 2. Validar que los precios no hayan sido manipulados en el frontend
  let pricesMatchCatalog = true;
  if (cartNotEmpty) {
    for (const item of cartItems) {
      const originalProduct = catalog.find((p) => p.id === item.id);
      if (!originalProduct || originalProduct.price !== item.price) {
        pricesMatchCatalog = false;
        break;
      }
    }
  }

  // 3. Simulación de control de stock e integridad de red
  const stockAvailable = true;
  const credentialsValid = true;

  const isValid = cartNotEmpty && pricesMatchCatalog && stockAvailable;

  return {
    isValid,
    checks: {
      cartNotEmpty,
      pricesMatchCatalog,
      stockAvailable,
      credentialsValid,
    },
    message: isValid
      ? '¡Validación Exitosa! Procediendo a la Pasarela de Pago de Mercado Pago...'
      : 'Error de integridad: Se detectaron inconsistencias en la orden de compra.',
  };
}