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
  categoryId?: string;
}

export class FilterProductRequest {
  name?: string;
  price?: string;
  // stock: number;
  // categoryId: number;
  page: number;
  size: number;
  sortKey: string;
  sortOrder: number;
}