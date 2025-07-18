import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Bucketeer React SDK Demo/);
});

test('String Variation Screen', async ({ page }) => {
  // launchApp
  await page.goto('/');

  // tapOn: id: "nav-string" (matches the button for String Demo)
  await page.getByTestId('nav-string').click();

  // assertVisible: "Bucketeer React SDK Demo" (main heading)
  await expect(
    page.getByRole('heading', { name: 'Bucketeer React SDK Demo' })
  ).toBeVisible();

  // assertVisible: "String Evaluations" (screen heading)
  await expect(
    page.getByRole('heading', { name: 'String Evaluations' })
  ).toBeVisible();

  // assertVisible: id: "client-status" and "Client Status: Ready"
  await expect(page.getByTestId('client-status')).toContainText(
    'Client Status: Ready'
  );

  // assertVisible: id: "string-flag-value"
  await expect(page.getByTestId('string-flag-value')).toBeVisible();

  // assertVisible: "Evaluation Value: value-1"
  await expect(page.getByTestId('string-flag-value')).toContainText('value-1');

  // assertVisible: id: "string-details-variation-feature-id"
  await expect(
    page.getByTestId('string-details-variation-feature-id')
  ).toBeVisible();
  await expect(
    page.getByTestId('string-details-variation-feature-id')
  ).toContainText('feature-js-e2e-string');

  // assertVisible: id: "string-details-variation-feature-version"
  await expect(
    page.getByTestId('string-details-variation-feature-version')
  ).toBeVisible();
  await expect(
    page.getByTestId('string-details-variation-feature-version')
  ).toContainText('5');

  // assertVisible: id: "string-details-variation-user-id"
  await expect(
    page.getByTestId('string-details-variation-user-id')
  ).toBeVisible();
  await expect(
    page.getByTestId('string-details-variation-user-id')
  ).toContainText('bucketeer-js-user-id-1');

  // assertVisible: id: "string-details-variation-id"
  await expect(page.getByTestId('string-details-variation-id')).toBeVisible();
  await expect(page.getByTestId('string-details-variation-id')).toContainText(
    '87e0a1ef-a0cb-49da-8460-289948f117ba'
  );

  // assertVisible: id: "string-details-variation-name"
  await expect(page.getByTestId('string-details-variation-name')).toBeVisible();
  await expect(page.getByTestId('string-details-variation-name')).toContainText(
    'variation 1'
  );

  // assertVisible: id: "string-details-variation-value"
  await expect(
    page.getByTestId('string-details-variation-value')
  ).toBeVisible();
  await expect(
    page.getByTestId('string-details-variation-value')
  ).toContainText('value-1');

  // assertVisible: id: "string-details-variation-reason"
  await expect(
    page.getByTestId('string-details-variation-reason')
  ).toBeVisible();
  await expect(
    page.getByTestId('string-details-variation-reason')
  ).toContainText('DEFAULT');
});

test('Boolean Variation Screen', async ({ page }) => {
  // launchApp
  await page.goto('/');
  // tapOn: id: "nav-bool" (matches the button for Bool Demo)
  await page.getByTestId('nav-bool').click();

  // assertVisible: "Bucketeer React SDK Demo" (main heading)
  await expect(
    page.getByRole('heading', { name: 'Bucketeer React SDK Demo' })
  ).toBeVisible();

  // assertVisible: "Bool Evaluations" (screen heading)
  await expect(
    page.getByRole('heading', { name: 'Bool Evaluations' })
  ).toBeVisible();

  // assertVisible: id: "client-status" and "Client Status: Ready"
  await expect(page.getByTestId('client-status')).toContainText(
    'Client Status: Ready'
  );

  // assertVisible: id: "bool-flag-value"
  await expect(page.getByTestId('bool-flag-value')).toBeVisible();

  // assertVisible: "Evaluation Value: true"
  await expect(page.getByTestId('bool-flag-value')).toContainText('true');

  // assertVisible: id: "bool-details-variation-feature-id"
  await expect(
    page.getByTestId('bool-details-variation-feature-id')
  ).toBeVisible();
  await expect(
    page.getByTestId('bool-details-variation-feature-id')
  ).toContainText('feature-js-e2e-boolean');

  // assertVisible: id: "bool-details-variation-version"
  await expect(
    page.getByTestId('bool-details-variation-version')
  ).toBeVisible();
  await expect(
    page.getByTestId('bool-details-variation-version')
  ).toContainText('3');

  // assertVisible: id: "bool-details-variation-userId"
  await expect(page.getByTestId('bool-details-variation-userId')).toBeVisible();
  await expect(page.getByTestId('bool-details-variation-userId')).toContainText(
    'bucketeer-js-user-id-1'
  );

  // assertVisible: id: "bool-details-variation-id"
  await expect(page.getByTestId('bool-details-variation-id')).toBeVisible();
  await expect(page.getByTestId('bool-details-variation-id')).toContainText(
    '4fab39c8-bf62-4a78-8a10-1b8bc3dd3806'
  );

  // assertVisible: id: "bool-details-variation-name"
  await expect(page.getByTestId('bool-details-variation-name')).toBeVisible();
  await expect(page.getByTestId('bool-details-variation-name')).toContainText(
    'variation true'
  );

  // assertVisible: id: "bool-details-variation-value"
  await expect(page.getByTestId('bool-details-variation-value')).toBeVisible();
  await expect(page.getByTestId('bool-details-variation-value')).toContainText(
    'true'
  );

  // assertVisible: id: "bool-details-variation-reason"
  await expect(page.getByTestId('bool-details-variation-reason')).toBeVisible();
  await expect(page.getByTestId('bool-details-variation-reason')).toContainText(
    'DEFAULT'
  );

  // tapOn: id: "back-to-demo-button" (update selector if needed)
  // await page.getByTestId('back-to-demo-button').click();
});

test('Object Variation Screen', async ({ page }) => {
  // launchApp
  await page.goto('/');
  // tapOn: id: "nav-object" (matches the button for Object Demo)
  await page.getByTestId('nav-object').click();

  // assertVisible: "Bucketeer React SDK Demo" (main heading)
  await expect(page.getByRole('heading', { name: 'Bucketeer React SDK Demo' })).toBeVisible();

  // assertVisible: "Object Evaluations" (screen heading)
  await expect(page.getByRole('heading', { name: 'Object Evaluations' })).toBeVisible();

  // assertVisible: id: "client-status" and "Client Status: Ready"
  await expect(page.getByTestId('client-status')).toContainText('Client Status: Ready');

  // assertVisible: id: "object-flag-value"
  await expect(page.getByTestId('object-flag-value')).toBeVisible();

  // assertVisible: 'Evaluation Value: {"key":"value-1"}'
  await expect(page.getByTestId('object-flag-value')).toContainText('{"key":"value-1"}');

  // assertVisible: id: "object-details-variation-feature-id"
  await expect(page.getByTestId('object-details-variation-feature-id')).toBeVisible();
  await expect(page.getByTestId('object-details-variation-feature-id')).toContainText('feature-js-e2e-json');

  // assertVisible: id: "object-details-variation-feature-version"
  await expect(page.getByTestId('object-details-variation-feature-version')).toBeVisible();
  await expect(page.getByTestId('object-details-variation-feature-version')).toContainText('3');

  // assertVisible: id: "object-details-userId"
  await expect(page.getByTestId('object-details-variation-user-id')).toBeVisible();
  await expect(page.getByTestId('object-details-variation-user-id')).toContainText('bucketeer-js-user-id-1');

  // assertVisible: id: "object-details-variation-id"
  await expect(page.getByTestId('object-details-variation-id')).toBeVisible();
  await expect(page.getByTestId('object-details-variation-id')).toContainText('8b53a27b-2658-4f8c-925e-fb277808ed30');

  // assertVisible: id: "object-details-variation-name"
  await expect(page.getByTestId('object-details-variation-name')).toBeVisible();
  await expect(page.getByTestId('object-details-variation-name')).toContainText('variation 1');

  // assertVisible: id: "object-details-variation-value"
  await expect(page.getByTestId('object-details-variation-value')).toBeVisible();
  await expect(page.getByTestId('object-details-variation-value')).toContainText('{"key":"value-1"}');

  // assertVisible: id: "object-details-variation-reason"
  await expect(page.getByTestId('object-details-variation-reason')).toBeVisible();
  await expect(page.getByTestId('object-details-variation-reason')).toContainText('DEFAULT');

  // tapOn: id: "back-to-demo-button" (update selector if needed)
  // await page.getByTestId('back-to-demo-button').click();
});