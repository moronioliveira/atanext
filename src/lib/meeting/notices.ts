export function getSaveNotice(addedPeopleCount: number) {
  if (addedPeopleCount === 0) {
    return "Planejamento salvo com sucesso.";
  }

  if (addedPeopleCount === 1) {
    return "Planejamento salvo. 1 novo membro foi adicionado à lista.";
  }

  return `Planejamento salvo. ${addedPeopleCount} novos membros foram adicionados à lista.`;
}
