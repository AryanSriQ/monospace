export interface IRequest {
  body: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
}
