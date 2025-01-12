export class WebResponse<T> {
  data?: T;
  errors?: string;
  pagging?: Pagging;
}

export class Pagging {
  size: number;
  current_page: number;
  total: number;
}
