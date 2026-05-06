export interface CustomerAuthUserDto {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerLoginResponseDto {
  user: CustomerAuthUserDto;
}
