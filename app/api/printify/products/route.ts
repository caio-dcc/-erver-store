import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.PRINTIFY_API_KEY;
  const shopId = process.env.PRINTIFY_SHOP_ID;

  if (!apiKey || !shopId) {
    return NextResponse.json(
      { error: 'Configuração do Printify ausente (API Key ou Shop ID)' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`https://api.printify.com/v1/shops/${shopId}/products.json`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }, // Cache por 1 hora
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao buscar produtos do Printify');
    }

    const data = await response.json();
    
    // Mapear produtos do Printify para um formato compatível com o nosso sistema
    const mappedProducts = data.data.map((product: any) => ({
      id: product.id,
      name: product.title,
      description: product.description,
      price: parseFloat(product.variants[0]?.price) / 100 || 0,
      image: product.images[0]?.src || '',
      images: product.images,
      provider: 'printify',
      options: product.options,
      variants: product.variants.map((v: any) => ({
        id: v.id,
        title: v.title,
        price: parseFloat(v.price) / 100,
        sku: v.sku,
        is_enabled: v.is_enabled,
        options: v.options
      }))
    }));


    return NextResponse.json(mappedProducts);
  } catch (error: any) {
    console.error('Printify API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
