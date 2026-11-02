import {
  SessionModuleLayout,
  type SessionModuleProps,
} from "../SessionModule";

export function DiscursantesModule(props: SessionModuleProps) {
  return <SessionModuleLayout title="Discursantes" {...props} />;
}
