export interface RegisterResultDto {
  code: RegisterCode;
  message: string;
  data: any;
}

export enum RegisterCode {
  Ok = 'ok',
  AccountIsExist = 'account_is_exist',
  ExistEmail = 'exist_email',
  ExistUsernameNotVerified = 'exist_username_not_verified',
  AccountValidated = 'account_validated',
}
