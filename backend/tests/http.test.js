/**
 * HTTP基本機能テスト
 * 目的: HTTPの基本的な機能が正常に動作することを確認
 */

const request = require('supertest');
const express = require('express');

describe('HTTP Basic Features', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // テスト用ルート
    app.get('/users/:id', (req, res) => {
      const id = req.params.id;
      if (id === '1') {
        res.json({ id: 1, name: 'Test User', email: 'test@example.com' });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    });
    
    app.post('/users', (req, res) => {
      const { name, email } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }
      res.status(201).json({ id: 2, name, email, created: true });
    });
    
    app.put('/users/:id', (req, res) => {
      const id = req.params.id;
      const updates = req.body;
      res.json({ id: parseInt(id), ...updates, updated: true });
    });
    
    app.delete('/users/:id', (req, res) => {
      res.status(204).send();
    });
  });

  /**
   * テスト1: GET リクエスト - 成功ケース
   * 目的: パラメータを使ったGETリクエストが正常に動作することを確認
   */
  test('should handle GET request with parameters', async () => {
    const response = await request(app)
      .get('/users/1')
      .expect(200);

    expect(response.body).toEqual({
      id: 1,
      name: 'Test User',
      email: 'test@example.com'
    });
  });

  /**
   * テスト2: GET リクエスト - 404エラー
   * 目的: 存在しないリソースに対して404が返されることを確認
   */
  test('should return 404 for non-existent user', async () => {
    const response = await request(app)
      .get('/users/999')
      .expect(404);

    expect(response.body).toHaveProperty('error', 'User not found');
  });

  /**
   * テスト3: POST リクエスト - 成功ケース
   * 目的: JSONデータを含むPOSTリクエストが正常に処理されることを確認
   */
  test('should handle POST request with JSON data', async () => {
    const userData = { name: 'New User', email: 'new@example.com' };
    
    const response = await request(app)
      .post('/users')
      .send(userData)
      .expect(201);

    expect(response.body).toMatchObject({
      id: 2,
      name: 'New User',
      email: 'new@example.com',
      created: true
    });
  });

  /**
   * テスト4: POST リクエスト - バリデーションエラー
   * 目的: 必須フィールドが不足している場合の400エラー確認
   */
  test('should return 400 for missing required fields', async () => {
    const incompleteData = { name: 'Incomplete User' };
    
    const response = await request(app)
      .post('/users')
      .send(incompleteData)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Name and email are required');
  });

  /**
   * テスト5: PUT リクエスト
   * 目的: データ更新のPUTリクエストが正常に処理されることを確認
   */
  test('should handle PUT request for updates', async () => {
    const updateData = { name: 'Updated User', email: 'updated@example.com' };
    
    const response = await request(app)
      .put('/users/1')
      .send(updateData)
      .expect(200);

    expect(response.body).toMatchObject({
      id: 1,
      name: 'Updated User',
      email: 'updated@example.com',
      updated: true
    });
  });

  /**
   * テスト6: DELETE リクエスト
   * 目的: DELETEリクエストが正常に処理され204が返されることを確認
   */
  test('should handle DELETE request', async () => {
    await request(app)
      .delete('/users/1')
      .expect(204);
  });

  /**
   * テスト7: Content-Type ヘッダー確認
   * 目的: JSONレスポンスで正しいContent-Typeヘッダーが設定されることを確認
   */
  test('should set correct Content-Type for JSON responses', async () => {
    const response = await request(app)
      .get('/users/1')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  /**
   * テスト8: リクエストボディの処理
   * 目的: 異なる形式のリクエストボディが正しく処理されることを確認
   */
  test('should parse JSON request body correctly', async () => {
    const complexData = {
      user: {
        name: 'Complex User',
        email: 'complex@example.com',
        preferences: {
          theme: 'dark',
          notifications: true
        }
      }
    };
    
    const response = await request(app)
      .put('/users/1')
      .send(complexData)
      .expect(200);

    expect(response.body.user).toEqual(complexData.user);
  });

  /**
   * テスト9: 空のリクエストボディ
   * 目的: 空のリクエストボディが適切に処理されることを確認
   */
  test('should handle empty request body', async () => {
    const response = await request(app)
      .put('/users/1')
      .send({})
      .expect(200);

    expect(response.body).toMatchObject({
      id: 1,
      updated: true
    });
  });

  /**
   * テスト10: クエリパラメータの処理
   * 目的: クエリパラメータが正しく解析されることを確認
   */
  test('should handle query parameters', async () => {
    // クエリパラメータを処理するルートを追加
    app.get('/search', (req, res) => {
      const { q, page = 1, limit = 10 } = req.query;
      res.json({ 
        query: q, 
        page: parseInt(page), 
        limit: parseInt(limit),
        results: []
      });
    });

    const response = await request(app)
      .get('/search?q=test&page=2&limit=5')
      .expect(200);

    expect(response.body).toEqual({
      query: 'test',
      page: 2,
      limit: 5,
      results: []
    });
  });
});