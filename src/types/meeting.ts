export const meetingRoles = [
  { key: "presidida", label: "Presidida", group: "Abertura" },
  { key: "dirigida", label: "Dirigida", group: "Abertura" },
  { key: "reconhecimentos", label: "Reconhecimentos", group: "Abertura" },
  { key: "anuncios", label: "Anúncios", group: "Abertura" },
  { key: "primeiroHino", label: "1º hino", group: "Abertura" },
  { key: "regente", label: "Regente", group: "Abertura" },
  { key: "organista", label: "Organista", group: "Abertura" },
  { key: "primeiraOracao", label: "1ª oração", group: "Abertura" },
  {
    key: "chamados",
    label: "Chamados, desobrigações e ordenanças",
    group: "Abertura",
  },
  { key: "hinoSacramental", label: "Hino sacramental", group: "Sacramento" },
  { key: "primeiroOrador", label: "1º orador", group: "Discursantes" },
  { key: "segundoOrador", label: "2º orador", group: "Discursantes" },
  {
    key: "hinoIntermediario",
    label: "Hino intermediário",
    group: "Encerramento",
  },
  {
    key: "tempoTestemunhos",
    label: "Tempo para testemunhos",
    group: "Testemunhos",
  },
  { key: "ultimoOrador", label: "Último orador", group: "Encerramento" },
  { key: "ultimoHino", label: "Último hino", group: "Encerramento" },
  { key: "ultimaOracao", label: "Última oração", group: "Encerramento" },
] as const;

export type MeetingRole = (typeof meetingRoles)[number];
export type RoleKey = MeetingRole["key"];
export type SundaySchedule = Record<RoleKey, string>;

export function isHymnRole(roleKey: RoleKey) {
  return [
    "primeiroHino",
    "hinoSacramental",
    "hinoIntermediario",
    "ultimoHino",
  ].includes(roleKey);
}

export const meetingGroups = [
  "Abertura",
  "Sacramento",
  "Discursantes",
  "Testemunhos",
  "Encerramento",
] as const;

export type MeetingGroup = (typeof meetingGroups)[number];

export function getMeetingRoles(sundayNumber: number) {
  return meetingRoles.filter((role) => {
    if (sundayNumber === 1) {
      return role.group !== "Discursantes";
    }

    return role.group !== "Testemunhos";
  });
}

export function getMeetingGroups(sundayNumber: number) {
  return meetingGroups.filter((group) =>
    sundayNumber === 1 ? group !== "Discursantes" : group !== "Testemunhos",
  );
}
