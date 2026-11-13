export type Person = {
  id: string;
  name: string;
};

/** Resultado de uma ação no navegador: `error` vem preenchido quando ela falha. */
export type ActionResult = {
  error: string | null;
};
