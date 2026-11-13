/**
 * Textos institucionais do Atas+ (marca, metadados e navegação).
 * Altere aqui para mudar o que aparece no cabeçalho, na aba do navegador
 * e nas telas de acesso.
 */
export const siteConfig = {
  name: "Atas+",
  shortName: "Atas",
  tagline: "Reuniões da ala, organizadas",
  description:
    "Planeje os domingos do mês, mantenha a lista de membros da ala e gere a ata pronta para impressão.",
} as const;

export const mainNavigation = [
  { href: "/", label: "Planejamento" },
  { href: "/ala", label: "Ala e membros" },
] as const;

/** Destaques exibidos no painel lateral das telas de acesso. */
export const authHighlights = [
  "Os cinco domingos do mês em um só lugar",
  "Membros da ala sugeridos enquanto você digita",
  "Ata em uma folha A4, pronta para imprimir",
] as const;

/** Crédito do estúdio que desenvolveu o sistema (rodapé das telas). */
export const developerCredit = {
  label: "Desenvolvido por",
  name: "Solid Solutions",
  url: "https://solidsolutionsdigital.com.br",
} as const;
