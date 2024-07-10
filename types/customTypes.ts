export interface AuthBody {
  readonly name?: string;
  readonly phone_no: number;
  readonly password: string;
}

export interface Wallet {
  readonly wallet_id: number;
  readonly balance: number;
}

export interface User {
  readonly user_name: string;
  readonly wallet_id: number;
  readonly phone_no: number;
  readonly user_password: string;
  readonly balance?: number;
}

export interface Payment {
  readonly amount: number;
  readonly receiver_phone_no: number;
}
