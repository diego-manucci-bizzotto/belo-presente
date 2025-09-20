
/*

 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    list_id BIGINT NOT NULL REFERENCES "list"(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(512),
    url TEXT,
    image_url TEXT,
    price DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'BRL' NOT NULL,
    quantity INT DEFAULT 1 NOT NULL,
    purchase_type TEXT NOT NULL, -- 'payment' or 'redirect'
    created_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT TRUE

 */

export type CreateProductRequest = {
  list_id: string;
  product: {
    name: string;
    description?: string;
    url? : string;
    image_url? : string;
    price: number;
    currency: string;
    quantity: number;
    purchase_type: 'payment' | 'redirect';
  }
}

type CreateProductResponse = {
  id: string;
  list_id: string;
  name: string;
  description: string;
  url?: string;
  image_url?: string;
  price?: number;
  currency: string;
  quantity: number;
  purchase_type: 'payment' | 'redirect';
  created_at: string;
  is_active: boolean;
}

export const createProduct = async ({list_id, product} : CreateProductRequest) : Promise<CreateProductResponse> => {
  const response = await fetch(`/api/lists/${list_id}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
};
