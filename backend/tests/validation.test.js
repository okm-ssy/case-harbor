/**
 * データバリデーションテスト
 * 目的: データの検証とエラーハンドリングが正常に動作することを確認
 */

const request = require('supertest');
const express = require('express');

describe('Data Validation Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // バリデーション用のミドルウェア
    const validateUser = (req, res, next) => {
      const { name, email, age } = req.body;
      const errors = [];
      
      if (!name || name.length < 2) {
        errors.push('Name must be at least 2 characters long');
      }
      
      if (!email || !email.includes('@')) {
        errors.push('Valid email is required');
      }
      
      if (age !== undefined && (isNaN(age) || age < 0 || age > 150)) {
        errors.push('Age must be a number between 0 and 150');
      }
      
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      
      next();
    };
    
    // テスト用ルート
    app.post('/validate-user', validateUser, (req, res) => {
      res.json({ message: 'User data is valid', data: req.body });
    });
    
    app.post('/strict-validation', (req, res) => {
      const { id, name, type } = req.body;
      
      // IDの形式チェック
      if (!id || !/^[A-Z]{2}\d{4}$/.test(id)) {
        return res.status(400).json({ 
          error: 'ID must be in format: XX0000 (2 letters + 4 digits)' 
        });
      }
      
      // 名前の長さチェック
      if (!name || name.length < 3 || name.length > 50) {
        return res.status(400).json({ 
          error: 'Name must be between 3 and 50 characters' 
        });
      }
      
      // タイプのホワイトリストチェック
      const allowedTypes = ['user', 'admin', 'guest'];
      if (!type || !allowedTypes.includes(type)) {
        return res.status(400).json({ 
          error: 'Type must be one of: ' + allowedTypes.join(', ') 
        });
      }
      
      res.json({ message: 'Strict validation passed', data: req.body });
    });
  });

  /**
   * テスト1: 正常なユーザーデータのバリデーション
   * 目的: 有効なデータがバリデーションを通過することを確認
   */
  test('should pass validation with valid user data', async () => {
    const validUser = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    };
    
    const response = await request(app)
      .post('/validate-user')
      .send(validUser)
      .expect(200);

    expect(response.body.message).toBe('User data is valid');
    expect(response.body.data).toEqual(validUser);
  });

  /**
   * テスト2: 名前のバリデーションエラー
   * 目的: 短すぎる名前でバリデーションエラーが発生することを確認
   */
  test('should fail validation with too short name', async () => {
    const invalidUser = {
      name: 'J',
      email: 'john@example.com',
      age: 30
    };
    
    const response = await request(app)
      .post('/validate-user')
      .send(invalidUser)
      .expect(400);

    expect(response.body.errors).toContain('Name must be at least 2 characters long');
  });

  /**
   * テスト3: メールアドレスのバリデーションエラー
   * 目的: 無効なメールアドレスでバリデーションエラーが発生することを確認
   */
  test('should fail validation with invalid email', async () => {
    const invalidUser = {
      name: 'John Doe',
      email: 'invalid-email',
      age: 30
    };
    
    const response = await request(app)
      .post('/validate-user')
      .send(invalidUser)
      .expect(400);

    expect(response.body.errors).toContain('Valid email is required');
  });

  /**
   * テスト4: 年齢のバリデーションエラー
   * 目的: 範囲外の年齢でバリデーションエラーが発生することを確認
   */
  test('should fail validation with invalid age', async () => {
    const invalidUser = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 200
    };
    
    const response = await request(app)
      .post('/validate-user')
      .send(invalidUser)
      .expect(400);

    expect(response.body.errors).toContain('Age must be a number between 0 and 150');
  });

  /**
   * テスト5: 複数のバリデーションエラー
   * 目的: 複数のフィールドでエラーが発生した場合、すべてのエラーが返されることを確認
   */
  test('should return multiple validation errors', async () => {
    const invalidUser = {
      name: 'J',
      email: 'invalid-email',
      age: -5
    };
    
    const response = await request(app)
      .post('/validate-user')
      .send(invalidUser)
      .expect(400);

    expect(response.body.errors).toHaveLength(3);
    expect(response.body.errors).toContain('Name must be at least 2 characters long');
    expect(response.body.errors).toContain('Valid email is required');
    expect(response.body.errors).toContain('Age must be a number between 0 and 150');
  });

  /**
   * テスト6: 厳密なIDフォーマットバリデーション
   * 目的: 正規表現を使ったIDフォーマットの検証が正常に動作することを確認
   */
  test('should validate strict ID format', async () => {
    const validData = {
      id: 'AB1234',
      name: 'Test User',
      type: 'user'
    };
    
    const response = await request(app)
      .post('/strict-validation')
      .send(validData)
      .expect(200);

    expect(response.body.message).toBe('Strict validation passed');
  });

  /**
   * テスト7: 無効なIDフォーマット
   * 目的: 正規表現にマッチしないIDでエラーが発生することを確認
   */
  test('should reject invalid ID format', async () => {
    const invalidData = {
      id: 'invalid',
      name: 'Test User',
      type: 'user'
    };
    
    const response = await request(app)
      .post('/strict-validation')
      .send(invalidData)
      .expect(400);

    expect(response.body.error).toContain('ID must be in format: XX0000');
  });

  /**
   * テスト8: ホワイトリストバリデーション
   * 目的: 許可されていない値でエラーが発生することを確認
   */
  test('should reject invalid type from whitelist', async () => {
    const invalidData = {
      id: 'AB1234',
      name: 'Test User',
      type: 'invalid-type'
    };
    
    const response = await request(app)
      .post('/strict-validation')
      .send(invalidData)
      .expect(400);

    expect(response.body.error).toContain('Type must be one of: user, admin, guest');
  });

  /**
   * テスト9: 欠落フィールドの検出
   * 目的: 必須フィールドが欠落している場合のエラー処理を確認
   */
  test('should detect missing required fields', async () => {
    const incompleteData = {
      name: 'Test User'
      // id と type が欠落
    };
    
    const response = await request(app)
      .post('/strict-validation')
      .send(incompleteData)
      .expect(400);

    expect(response.body.error).toContain('ID must be in format');
  });

  /**
   * テスト10: 空文字列のバリデーション
   * 目的: 空文字列が適切にバリデーションされることを確認
   */
  test('should handle empty strings in validation', async () => {
    const emptyData = {
      name: '',
      email: '',
    };
    
    const response = await request(app)
      .post('/validate-user')
      .send(emptyData)
      .expect(400);

    expect(response.body.errors).toContain('Name must be at least 2 characters long');
    expect(response.body.errors).toContain('Valid email is required');
  });
});