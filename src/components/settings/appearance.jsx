import { AppearanceToc } from './appearance-toc';
import AppearanceForm from './forms/appearance';
import { SettingsPage } from './layout';
import { TocProvider } from './toc/provider';

export default function AppearancePage() {
  return (
    <SettingsPage title="Site appearance">
      <TocProvider>
        <AppearanceToc />
        <AppearanceForm />
      </TocProvider>
    </SettingsPage>
  );
}
