export class CreateOrderRequest {
  payment_method: string;
}

export class OrderResponse {
  id: string;
  userId: string;
  totalAmount: string;
  status: string;
  paymentMethod: string;
}