// Regras dos membros da ala. Seguras para o navegador; o acesso ao banco
// fica em `people-repository.ts` (somente servidor).
export {
  collectPersonNames,
  extractPersonNames,
  normalizePersonName,
  PERSON_NAME_MAX_LENGTH,
  PERSON_NAME_MIN_LENGTH,
  personRoleKeys,
  sortPeopleByName,
  validatePersonName,
} from "./names";
