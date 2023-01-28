export class UserResponseDTO {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  message: string;
  tokens: {
    access_token: string;
    refresh_token: string;
  };

  constructor(partial: Partial<UserResponseDTO>) {
    Object.assign(this, partial);
  }
}
