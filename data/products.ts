export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  images: string[]; // <--- Galería de imágenes (varias fotos por prenda)
  sizes: string[];
  colors?: string[];
  featured?: boolean;
}

export const CATEGORIES = [
  'Todos',
  'Conjuntos',
  'Bodies',
  'Pijamas & Satín',
  'Lencería Fina',
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Conjunto de Encaje Flor de Loto',
    price: 95000,
    category: 'Conjuntos',
    description: 'Conjunto en encaje floral suave con copa estructurada y arneses ajustables.',
    images: [
      '/products/conjunto-loto-1.jpg',
      '/products/conjunto-loto-2.jpg',
      '/products/conjunto-loto-3.jpg',
    ],
    sizes: ['S', 'M', 'L'],
    colors: ['Negro', 'Vino Tinto'],
    featured: true,
  },
  {
    id: '2',
    name: 'Body en Malla & Escote Profundo',
    price: 110000,
    category: 'Bodies',
    description: 'Body estilizado con transparencias delicadas y broches inferiores ajustables.',
    images: [
      '/products/body-malla-1.jpg',
      '/products/body-malla-2.jpg',
    ],
    sizes: ['S', 'M', 'L'],
    colors: ['Negro'],
    featured: true,
  },
  {
    id: '3',
    name: 'Pijama Satín Kimono & Short',
    price: 125000,
    category: 'Pijamas & Satín',
    description: 'Pijama de dos piezas en satín suave al tacto con finos bordados en los bordes.',
    images: [
      '/products/pijama-satin-1.jpg',
      '/products/pijama-satin-2.jpg',
    ],
    sizes: ['M', 'L', 'XL'],
    colors: ['Rosa Pale', 'Marfil'],
    featured: false,
  },
];