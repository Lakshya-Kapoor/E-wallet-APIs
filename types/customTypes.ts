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
  readonly user_id: number;
  readonly name_of_user: string;
  readonly wallet_id: number;
  readonly phoneNo: number;
  readonly password: string;
  readonly balance?: number;
}
