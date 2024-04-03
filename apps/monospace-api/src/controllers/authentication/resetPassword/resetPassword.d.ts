export interface IRequest {
  params: {
    token: string;
  };
  body: {
    password: string;
    confirmPassword: string;
  };
}
