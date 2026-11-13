type AuthError = {
  status?: number;
  code?: string;
};

const ALREADY_EXISTS_CODES = ["USER_ALREADY_EXISTS", "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"];

/** Traduz o erro do cadastro em uma mensagem clara em português. */
export function getSignUpErrorMessage(error: AuthError) {
  if (error.status === 422 || ALREADY_EXISTS_CODES.includes(error.code ?? "")) {
    return "Este e-mail já está cadastrado. Entre pela tela de login.";
  }

  if (error.status === 400 || error.code === "VALIDATION_ERROR") {
    return "Confira seu nome, e-mail e senha e tente novamente.";
  }

  return "Não foi possível criar a conta. Verifique os dados informados.";
}

export const SIGN_IN_ERROR = "Não foi possível entrar. Verifique o e-mail e a senha.";
export const AUTH_CONNECTION_ERROR = "Não foi possível conectar à autenticação. Tente novamente.";
export const PASSWORD_MIN_LENGTH = 8;
