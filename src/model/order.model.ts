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

export class FilterOrderRequest {
  status?: string;
}

export class UpdateOrderRequest {
  id: string;
  status: string;
}