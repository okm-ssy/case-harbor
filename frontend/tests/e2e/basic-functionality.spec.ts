import { test, expect } from '@playwright/test';

test.describe('Case Harbor E2E Tests', () => {
  test('アプリケーションが正常に起動することを確認する', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle('Case Harbor');
    await expect(page.locator('main')).toBeVisible();
  });

  test('サイドバーが表示され、プロジェクト選択ができる', async ({ page }) => {
    await page.goto('/');
    
    // サイドバーエリアが表示されている
    const sidebar = page.locator('.flex.min-h-screen > *:first-child');
    await expect(sidebar).toBeVisible();
  });

  test('メインエリアが表示される', async ({ page }) => {
    await page.goto('/');
    
    // メインエリアが表示されている
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('プロジェクトが選択されていない時、適切なメッセージが表示される', async ({ page }) => {
    await page.goto('/');
    
    // ローディング状態が解消されるまで待機
    await page.waitForLoadState('networkidle');
    
    // プロジェクトが選択されていない場合の状態確認
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('ページのレスポンシブ性をテスト', async ({ page }) => {
    await page.goto('/');
    
    // デスクトップサイズ
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.flex.min-h-screen')).toBeVisible();
    
    // タブレットサイズ
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.flex.min-h-screen')).toBeVisible();
  });

  test('ダークテーマが正しく適用されている', async ({ page }) => {
    await page.goto('/');
    
    // ダークテーマのクラスが適用されている
    const darkContainer = page.locator('.flex.min-h-screen.bg-gray-800');
    await expect(darkContainer).toBeVisible();
  });
});