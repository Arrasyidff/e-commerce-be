export class RegisterUserRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export class UserResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  token?: string;
}

export class LoginUserRequest {
  email: string;
  password: string;
}

export class UpdateUserRequest {
  id: string;
  username?: string | null;
  email?: string | null;
  password?: string | null;
  role?: string | null;
}