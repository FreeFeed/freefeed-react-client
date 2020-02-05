import React from 'react';

import AppearanceForm from './forms/appearance';
import { SettingsPage } from './layout';

export default function AppearancePage() {
  return (
    <SettingsPage title="Site appearance">
      <AppearanceForm />
    </SettingsPage>
  );
}
