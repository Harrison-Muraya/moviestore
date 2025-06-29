import React, { useState } from 'react';
import { Button, Container, Title, Select, Switch, Paper } from '@mantine/core';

const Settings = () => {
  const [notificationType, setNotificationType] = useState('Email');
  const [enableAlerts, setEnableAlerts] = useState(false);
  const [theme, setTheme] = useState('Light');
  const [language, setLanguage] = useState('English');

  const notificationOptions = ['Email', 'SMS', 'In-App'];
  const themeOptions = ['Light', 'Dark'];
  const languageOptions = ['English', 'Spanish', 'French'];

  return (
    <Container py="md">
      <Title order={2} mb="md">
        System Settings
      </Title>

      {/* Farm & User Notifications Section */}
      <Paper shadow="xs" padding="md" mb="md">
        <Title order={3} mb="sm">
          Farm & User Notifications
        </Title>

        <Select
          label="Notification Type"
          data={notificationOptions}
          value={notificationType}
          onChange={(value) => setNotificationType(value)}
          mb="md"
        />

        <Switch
          label="Enable Alerts for New Users"
          checked={enableAlerts}
          onChange={(e) => setEnableAlerts(e.target.checked)}
          mb="md"
        />
      </Paper>

      {/* UI/UX Customization Section */}
      <Paper shadow="xs" padding="md" mb="md">
        <Title order={3} mb="sm">
          UI/UX Customization
        </Title>

        <Select
          label="Theme Settings"
          data={themeOptions}
          value={theme}
          onChange={(value) => setTheme(value)}
          mb="md"
        />

        <Select
          label="Language"
          data={languageOptions}
          value={language}
          onChange={(value) => setLanguage(value)}
          mb="md"
        />
      </Paper>

      {/* Save Button */}
      <Button fullWidth mt="md" color="blue">
        Save Settings
      </Button>
    </Container>
  );
};

export default Settings;
