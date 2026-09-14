import { DefinitionCrudView } from './definitions/DefinitionCrudView';
import type { DefinitionKind } from './definitions/definitionDomain';
import type { Language } from '../i18n';

type Props = { kind: DefinitionKind; parkingId: number; language: Language; title: string; pageTitle: string; canEdit?: boolean; canDelete?: boolean };

/** Thin route adapter; domain state and API orchestration live in useDefinitionCrud. */
export function ParkingDefinitionsCrudWorkspace({ kind, parkingId, language, title, pageTitle, canEdit = true, canDelete = true }: Props) {
  return <DefinitionCrudView kind={kind} parkingId={parkingId} language={language} title={title} pageTitle={pageTitle} canEdit={canEdit} canDelete={canDelete} />;
}
