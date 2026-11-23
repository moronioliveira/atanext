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
export const AUTH_TIMEOUT_ERROR =
  "A autenticação está demorando para responder. Aguarde alguns instantes e tente novamente.";
export const PASSWORD_MIN_LENGTH = 8;

/** Tempo máximo de espera pelo serviço de autenticação ao entrar. */
export const AUTH_REQUEST_TIMEOUT_MS = 20_000;

/**
 * Traduz o erro do login. Falhas do serviço (5xx, sem status ou excesso de
 * tentativas) não culpam o e-mail e a senha digitados.
 */
export function getSignInErrorMessage(error: AuthError) {
  const status = error.status;

  if (status === undefined || status === 0 || status === 429 || status >= 500) {
    return AUTH_CONNECTION_ERROR;
  }

  return SIGN_IN_ERROR;
}

/**
 * Traduz um erro lançado durante o login. O cliente do Neon Auth lança (em vez
 * de devolver) erros HTTP, como 401 para e-mail ou senha incorretos.
 */
export function getThrownSignInErrorMessage(error: unknown) {
  if (error instanceof Error && error.name === "TimeoutError") {
    return AUTH_TIMEOUT_ERROR;
  }

  const httpError = readThrownAuthError(error);

  return httpError ? getSignInErrorMessage(httpError) : AUTH_CONNECTION_ERROR;
}

/** Traduz um erro lançado durante o cadastro, como 422 para e-mail já cadastrado. */
export function getThrownSignUpErrorMessage(error: unknown) {
  const httpError = readThrownAuthError(error);

  return httpError ? getSignUpErrorMessage(httpError) : AUTH_CONNECTION_ERROR;
}

/** Lê status e código de um erro HTTP lançado pelo cliente; `null` se não houver status. */
function readThrownAuthError(error: unknown): AuthError | null {
  if (!error || typeof error !== "object" || !("status" in error)) {
    return null;
  }

  const status = typeof error.status === "number" ? error.status : undefined;
  const code = "code" in error && typeof error.code === "string" ? error.code : undefined;

  return { status, code };
}
