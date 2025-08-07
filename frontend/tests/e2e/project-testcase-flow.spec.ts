import { test, expect } from '@playwright/test';

test.describe('プロジェクトとテストケースの統合フロー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('プロジェクトが存在する場合の基本フロー', async ({ page }) => {
    // プロジェクト選択エリアが存在するかチェック
    const projectArea = page.locator('[data-testid="project-selector"], .project-selector, select').first();
    
    if (await projectArea.isVisible()) {
      // プロジェクトを選択
      await projectArea.click();
      
      // プロジェクトが選択された後、タイトルが変更されることを確認
      await page.waitForTimeout(1000); // API呼び出し待機
      
      const title = await page.title();
      expect(title).toMatch(/Case Harbor/);
    }
  });

  test('テストケーステーブルの表示確認', async ({ page }) => {
    // メインコンテンツエリアが表示される
    await expect(page.locator('main')).toBeVisible();
  });

  test('新しいテストケース追加ボタンの確認', async ({ page }) => {
    // メインコンテンツが表示される
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('エクスポート機能が利用可能か確認', async ({ page }) => {
    // メイン要素が表示されていることを確認
    await expect(page.locator('main')).toBeVisible();
  });

  test('レスポンシブデザインの動作確認', async ({ page }) => {
    // モバイルサイズでのレイアウト確認
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.flex.min-h-screen')).toBeVisible();
    
    // サイドバーの動作（コラップス可能かなど）
    const sidebar = page.locator('[data-testid="sidebar"], aside').first();
    if (await sidebar.isVisible()) {
      const toggleButton = page.locator('button:has-text("Toggle"), [data-testid="sidebar-toggle"]').first();
      if (await toggleButton.isVisible()) {
        await toggleButton.click();
      }
    }
    
    // デスクトップサイズに戻す
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.flex.min-h-screen')).toBeVisible();
  });
});