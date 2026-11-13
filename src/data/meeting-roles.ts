/**
 * Funções fixas de cada domingo (regra de negócio estável).
 *
 * - `group`: seção da reunião em que a função aparece.
 * - `input`: tipo de campo — membro (autocomplete de membros), hino
 *   (autocomplete do hinário) ou texto livre com várias linhas.
 * - `registersPeople`: os nomes digitados entram na lista de membros da ala
 *   quando o planejamento é salvo.
 */
export const meetingRoles = [
  { key: "presidida", label: "Presidida", group: "Abertura", input: "person", registersPeople: true },
  { key: "dirigida", label: "Dirigida", group: "Abertura", input: "person", registersPeople: true },
  {
    key: "reconhecimentos",
    label: "Reconhecimentos",
    group: "Abertura",
    input: "person",
    registersPeople: true,
  },
  { key: "anuncios", label: "Anúncios", group: "Abertura", input: "text", registersPeople: false },
  { key: "primeiroHino", label: "1º hino", group: "Abertura", input: "hymn", registersPeople: false },
  { key: "regente", label: "Regente", group: "Abertura", input: "person", registersPeople: true },
  { key: "organista", label: "Organista", group: "Abertura", input: "person", registersPeople: true },
  {
    key: "primeiraOracao",
    label: "1ª oração",
    group: "Abertura",
    input: "person",
    registersPeople: true,
  },
  {
    key: "chamados",
    label: "Chamados, desobrigações e ordenanças",
    group: "Abertura",
    input: "text",
    registersPeople: false,
  },
  {
    key: "hinoSacramental",
    label: "Hino sacramental",
    group: "Sacramento",
    input: "hymn",
    registersPeople: false,
  },
  {
    key: "primeiroOrador",
    label: "1º orador",
    group: "Discursantes",
    input: "person",
    registersPeople: true,
  },
  {
    key: "segundoOrador",
    label: "2º orador",
    group: "Discursantes",
    input: "person",
    registersPeople: true,
  },
  {
    key: "hinoIntermediario",
    label: "Hino intermediário",
    group: "Encerramento",
    input: "hymn",
    registersPeople: false,
  },
  {
    key: "tempoTestemunhos",
    label: "Tempo para testemunhos",
    group: "Testemunhos",
    input: "text",
    registersPeople: false,
  },
  {
    key: "ultimoOrador",
    label: "Último orador",
    group: "Encerramento",
    input: "person",
    registersPeople: true,
  },
  { key: "ultimoHino", label: "Último hino", group: "Encerramento", input: "hymn", registersPeople: false },
  {
    key: "ultimaOracao",
    label: "Última oração",
    group: "Encerramento",
    input: "person",
    registersPeople: true,
  },
] as const;

export const meetingGroups = [
  "Abertura",
  "Sacramento",
  "Discursantes",
  "Testemunhos",
  "Encerramento",
] as const;

/** Quantidade de domingos planejados por mês (cinco colunas fixas). */
export const SUNDAYS_PER_MONTH = 5;

/** O primeiro domingo do mês é a reunião de testemunhos. */
export const TESTIMONY_SUNDAY_NUMBER = 1;
