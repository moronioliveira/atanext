/** Erro lançado quando uma operação passa do tempo limite. */
export class TimeoutError extends Error {
  constructor(milliseconds: number) {
    super(`A operação passou do tempo limite de ${milliseconds} ms.`);
    this.name = "TimeoutError";
  }
}

/**
 * Rejeita com `TimeoutError` se a promessa não terminar a tempo, para que a
 * interface não fique carregando para sempre quando um serviço não responde.
 */
export function withTimeout<TValue>(promise: Promise<TValue>, milliseconds: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(milliseconds)), milliseconds);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
