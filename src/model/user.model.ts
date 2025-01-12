export class RegisterUserRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export class UserResponse {
  username: string;
  email: string;
  role: string;
}