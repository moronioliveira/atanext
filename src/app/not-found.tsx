import { FullPageStatus } from "@/components/layout/FullPageStatus";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <FullPageStatus
      loading={false}
      message="Página não encontrada."
      action={
        <ButtonLink href="/" icon="chevronLeft" variant="secondary">
          Voltar para o planejamento
        </ButtonLink>
      }
    />
  );
}
