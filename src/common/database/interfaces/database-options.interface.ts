export interface DatabaseOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize?: boolean;
  logging?: boolean;
  entities?: any[];
}
