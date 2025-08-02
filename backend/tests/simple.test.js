/**
 * 基本的なHTTPテスト
 * 目的: バックエンドAPIの基本動作を確認
 */

const request = require('supertest');
const express = require('express');

describe('Basic API Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // 基本的なテストエンドポイント
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    
    app.post('/echo', (req, res) => {
      res.json({ received: req.body });
    });
  });

  /**
   * テスト1: ヘルスチェックエンドポイント
   * 目的: 基本的なGETリクエストが正常に動作することを確認
   */
  test('should respond to health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });

  /**
   * テスト2: エコーエンドポイント
   * 目的: POSTリクエストでJSONデータが正しく処理されることを確認
   */
  test('should echo POST data', async () => {
    const testData = { message: 'Hello, World!', number: 42 };
    
    const response = await request(app)
      .post('/echo')
      .send(testData)
      .expect(200);

    expect(response.body.received).toEqual(testData);
  });

  /**
   * テスト3: 404エラーハンドリング
   * 目的: 存在しないエンドポイントで404が返されることを確認
   */
  test('should return 404 for unknown endpoints', async () => {
    await request(app)
      .get('/nonexistent')
      .expect(404);
  });

  /**
   * テスト4: JSONレスポンスヘッダー
   * 目的: Content-Typeヘッダーが正しく設定されることを確認
   */
  test('should set correct content type for JSON responses', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  /**
   * テスト5: 無効なJSONの処理
   * 目的: 不正なJSONデータが送信された場合のエラーハンドリング確認
   */
  test('should handle invalid JSON gracefully', async () => {
    // 無効なJSONを送信しようとする場合
    const response = await request(app)
      .post('/echo')
      .set('Content-Type', 'application/json')
      .send('invalid json')
      .expect(400);

    // Express.jsが400エラーを返すことを確認
    expect(response.status).toBe(400);
  });
});