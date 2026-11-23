/**
 * Interpreta a resposta da verificação de sessão do Neon Auth.
 *
 * Distingue "não há sessão" de "não foi possível verificar a sessão". Tratar
 * uma falha do serviço como sessão ausente manda o usuário de volta ao login
 * mesmo depois de entrar, criando um ciclo que só termina quando o serviço
 * volta a responder.
 */

export type SessionUser = {
  id: string;
  email: string;
};

export type SessionCheck =
  | { status: "signedIn"; user: SessionUser }
  | { status: "signedOut" }
  | { status: "unavailable"; reason: string };

type SessionError = {
  status?: number;
  code?: string;
};

type SessionResult = {
  data: { user?: SessionUser | null } | null;
  error: SessionError | null;
};

/** Estados HTTP que significam, de fato, que a sessão não existe ou não vale. */
const SIGNED_OUT_STATUSES = [401, 403];

export function classifySessionResult({ data, error }: SessionResult): SessionCheck {
  if (error) {
    if (error.status !== undefined && SIGNED_OUT_STATUSES.includes(error.status)) {
      return { status: "signedOut" };
    }

    return { status: "unavailable", reason: describeSessionError(error) };
  }

  if (!data?.user) {
    return { status: "signedOut" };
  }

  return { status: "signedIn", user: data.user };
}

/** Descrição técnica para os logs, sem dados pessoais. */
function describeSessionError(error: SessionError) {
  const status = error.status ?? "sem status";
  const code = error.code ?? "sem código";

  return `status ${status}, código ${code}`;
}
