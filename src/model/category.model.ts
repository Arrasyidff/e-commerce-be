export class CreateCategoryRequest {
  name: string;
}

export class CategoryResponse {
  id: string;
  name: string;
}

export class UpdateCategoryRequest {
  id: string;
  name?: string | null;
}