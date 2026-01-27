// user.model.ts
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  phone?: string;
  status: UserStatus;
  roleIds: string[]; // 用户拥有的角色ID列表
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Locked = 'locked',
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  roleIds: string[];
}

export interface UpdateUserDto {
  id: string;
  email?: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  status?: UserStatus;
  roleIds?: string[];
}

export interface UserState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: any;
}
