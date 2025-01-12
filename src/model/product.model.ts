export class CreateProductRequest {
  name: string;
  description: string;
  price: string;
  stock: number;
  categoryId: string;
}

export class ProductResponse {
  id: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  categoryId: string;
}