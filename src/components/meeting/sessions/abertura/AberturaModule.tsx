import {
  SessionModuleLayout,
  type SessionModuleProps,
} from "../SessionModule";

export function AberturaModule(props: SessionModuleProps) {
  return <SessionModuleLayout title="Abertura" {...props} />;
}
