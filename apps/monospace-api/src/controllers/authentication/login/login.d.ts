//  define interface for req and res of login
export interface ILoginRequest {
  body: {
    email: string;
    password: string;
  };
}
