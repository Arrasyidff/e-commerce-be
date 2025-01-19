export class AddItemCartRequest {
  userId: string;
  productId: string;
  quantity: number;
}

export class CartResponse {
  id: string;
  userId: string;
}