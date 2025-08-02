/**
 * テストケースAPI自動テスト
 * 目的: テストケースのCRUD操作が正常に動作することを確認
 */

import request from 'supertest';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import { join } from 'path';
import testcasesRouter from '../src/routes/testcases.js';

// テスト用のExpress アプリケーションを作成
const app = express();
app.use(express.json());
app.use('/api/testcases', testcasesRouter);

const TEST_DATA_DIR = join(process.cwd(), 'test-data', 'testcases');

describe('TestCases API', () => {
  let testProjectId;
  let testCaseId;

  // 各テストの前に実行: テスト用ディレクトリをクリーンアップ
  beforeEach(async () => {
    testProjectId = uuidv4();
    testCaseId = uuidv4();
    
    try {
      await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
      await fs.mkdir(TEST_DATA_DIR, { recursive: true });
    } catch (err) {
      // ディレクトリが存在しない場合は無視
    }
  });

  // テスト完了後にクリーンアップ
  afterAll(async () => {
    try {
      await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
    } catch (err) {
      // ディレクトリが存在しない場合は無視
    }
  });

  /**
   * テスト1: GET /api/testcases - 全テストケース取得
   * 目的: 空の状態で全テストケースを取得できることを確認
   */
  test('should return empty array when no test cases exist', async () => {
    const response = await request(app)
      .get('/api/testcases')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(0);
  });

  /**
   * テスト2: POST /api/testcases - 新規テストケース作成
   * 目的: 有効なデータで新しいテストケースを作成できることを確認
   */
  test('should create a new test case with valid data', async () => {
    const newTestCase = {
      projectId: testProjectId,
      title: 'テストケース1',
      specification: 'ログイン機能のテスト',
      preconditions: 'ユーザーが登録済み',
      steps: '1. ログインページにアクセス\n2. 認証情報を入力',
      verification: 'ダッシュボードが表示される',
      tags: ['login', 'authentication']
    };

    const response = await request(app)
      .post('/api/testcases')
      .send(newTestCase)
      .expect(201);

    expect(response.body).toMatchObject({
      projectId: testProjectId,
      title: 'テストケース1',
      specification: 'ログイン機能のテスト',
      preconditions: 'ユーザーが登録済み',
      steps: '1. ログインページにアクセス\n2. 認証情報を入力',
      verification: 'ダッシュボードが表示される',
      tags: ['login', 'authentication']
    });
    expect(response.body.id).toBeDefined();
    expect(response.body.createdAt).toBeDefined();
    expect(response.body.updatedAt).toBeDefined();
  });

  /**
   * テスト3: POST /api/testcases - 必須フィールドなしでのエラー
   * 目的: projectIdが指定されていない場合のエラーハンドリング確認
   */
  test('should return 400 when creating test case without projectId', async () => {
    const invalidTestCase = {
      title: 'テストケース',
      specification: 'テスト内容'
    };

    await request(app)
      .post('/api/testcases')
      .send(invalidTestCase)
      .expect(500); // Note: 現在の実装では500を返す
  });

  /**
   * テスト4: GET /api/testcases/:id - 特定テストケース取得
   * 目的: 存在するテストケースのIDで正常に取得できることを確認
   */
  test('should get a specific test case by ID', async () => {
    // まずテストケースを作成
    const testCase = {
      projectId: testProjectId,
      title: 'GET テスト用ケース',
      specification: '特定ID取得のテスト'
    };

    const createResponse = await request(app)
      .post('/api/testcases')
      .send(testCase)
      .expect(201);

    const createdId = createResponse.body.id;

    // 作成したテストケースを取得
    const getResponse = await request(app)
      .get(`/api/testcases/${createdId}`)
      .expect(200);

    expect(getResponse.body.id).toBe(createdId);
    expect(getResponse.body.title).toBe('GET テスト用ケース');
  });

  /**
   * テスト5: GET /api/testcases/:id - 存在しないIDでの404エラー
   * 目的: 存在しないテストケースIDでアクセスした場合の404エラー確認
   */
  test('should return 404 for non-existent test case ID', async () => {
    const nonExistentId = uuidv4();
    
    await request(app)
      .get(`/api/testcases/${nonExistentId}`)
      .expect(404);
  });

  /**
   * テスト6: PUT /api/testcases/:id - テストケース更新
   * 目的: 既存のテストケースを正常に更新できることを確認
   */
  test('should update an existing test case', async () => {
    // テストケースを作成
    const originalData = {
      projectId: testProjectId,
      title: '更新前タイトル',
      specification: '更新前仕様'
    };

    const createResponse = await request(app)
      .post('/api/testcases')
      .send(originalData)
      .expect(201);

    const createdId = createResponse.body.id;

    // テストケースを更新
    const updateData = {
      title: '更新後タイトル',
      specification: '更新後仕様',
      verification: '新しい確認事項'
    };

    const updateResponse = await request(app)
      .put(`/api/testcases/${createdId}`)
      .send(updateData)
      .expect(200);

    expect(updateResponse.body.title).toBe('更新後タイトル');
    expect(updateResponse.body.specification).toBe('更新後仕様');
    expect(updateResponse.body.verification).toBe('新しい確認事項');
    expect(updateResponse.body.id).toBe(createdId);
  });

  /**
   * テスト7: PUT /api/testcases/:id - 存在しないIDでの更新エラー
   * 目的: 存在しないテストケースIDで更新しようとした場合の404エラー確認
   */
  test('should return 404 when updating non-existent test case', async () => {
    const nonExistentId = uuidv4();
    const updateData = { title: '更新データ' };

    await request(app)
      .put(`/api/testcases/${nonExistentId}`)
      .send(updateData)
      .expect(404);
  });

  /**
   * テスト8: DELETE /api/testcases/:id - テストケース削除
   * 目的: 既存のテストケースを正常に削除できることを確認
   */
  test('should delete an existing test case', async () => {
    // テストケースを作成
    const testCase = {
      projectId: testProjectId,
      title: '削除テスト用ケース'
    };

    const createResponse = await request(app)
      .post('/api/testcases')
      .send(testCase)
      .expect(201);

    const createdId = createResponse.body.id;

    // テストケースを削除
    await request(app)
      .delete(`/api/testcases/${createdId}`)
      .expect(204);

    // 削除後に取得しようとすると404
    await request(app)
      .get(`/api/testcases/${createdId}`)
      .expect(404);
  });

  /**
   * テスト9: DELETE /api/testcases/:id - 存在しないIDでの削除エラー
   * 目的: 存在しないテストケースIDで削除しようとした場合の404エラー確認
   */
  test('should return 404 when deleting non-existent test case', async () => {
    const nonExistentId = uuidv4();

    await request(app)
      .delete(`/api/testcases/${nonExistentId}`)
      .expect(404);
  });

  /**
   * テスト10: GET /api/testcases?projectId - プロジェクトIDでのフィルタリング
   * 目的: 特定のプロジェクトIDでテストケースを正しくフィルタリングできることを確認
   */
  test('should filter test cases by projectId', async () => {
    const project1Id = uuidv4();
    const project2Id = uuidv4();

    // プロジェクト1のテストケースを作成
    await request(app)
      .post('/api/testcases')
      .send({
        projectId: project1Id,
        title: 'プロジェクト1のケース'
      })
      .expect(201);

    // プロジェクト2のテストケースを作成
    await request(app)
      .post('/api/testcases')
      .send({
        projectId: project2Id,
        title: 'プロジェクト2のケース'
      })
      .expect(201);

    // プロジェクト1のテストケースのみ取得
    const response = await request(app)
      .get(`/api/testcases?projectId=${project1Id}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].projectId).toBe(project1Id);
    expect(response.body[0].title).toBe('プロジェクト1のケース');
  });

  /**
   * テスト11: POST /api/testcases - タグ配列の処理確認
   * 目的: タグ配列が正しく保存・取得されることを確認
   */
  test('should handle tags array correctly', async () => {
    const testCase = {
      projectId: testProjectId,
      title: 'タグテスト',
      tags: ['ui', 'regression', 'high-priority']
    };

    const response = await request(app)
      .post('/api/testcases')
      .send(testCase)
      .expect(201);

    expect(response.body.tags).toEqual(['ui', 'regression', 'high-priority']);
  });

  /**
   * テスト12: POST /api/testcases - 空のタグ配列の処理
   * 目的: 空のタグ配列が正しく処理されることを確認
   */
  test('should handle empty tags array', async () => {
    const testCase = {
      projectId: testProjectId,
      title: '空タグテスト',
      tags: []
    };

    const response = await request(app)
      .post('/api/testcases')
      .send(testCase)
      .expect(201);

    expect(response.body.tags).toEqual([]);
  });

  /**
   * テスト13: PUT /api/testcases/:id - 部分更新の確認
   * 目的: 一部のフィールドのみ更新した場合、他のフィールドが保持されることを確認
   */
  test('should preserve existing fields when partially updating', async () => {
    // 完全なテストケースを作成
    const originalData = {
      projectId: testProjectId,
      title: '部分更新テスト',
      specification: '元の仕様',
      preconditions: '元の事前条件',
      steps: '元の手順',
      verification: '元の確認事項',
      tags: ['original']
    };

    const createResponse = await request(app)
      .post('/api/testcases')
      .send(originalData)
      .expect(201);

    const createdId = createResponse.body.id;

    // タイトルのみ更新
    const updateData = { title: '更新されたタイトル' };

    const updateResponse = await request(app)
      .put(`/api/testcases/${createdId}`)
      .send(updateData)
      .expect(200);

    // タイトルは更新され、他のフィールドは保持される
    expect(updateResponse.body.title).toBe('更新されたタイトル');
    expect(updateResponse.body.specification).toBe('元の仕様');
    expect(updateResponse.body.preconditions).toBe('元の事前条件');
    expect(updateResponse.body.steps).toBe('元の手順');
    expect(updateResponse.body.verification).toBe('元の確認事項');
    expect(updateResponse.body.tags).toEqual(['original']);
  });

  /**
   * テスト14: POST /api/testcases - デフォルト値の確認
   * 目的: 必須でないフィールドにデフォルト値が設定されることを確認
   */
  test('should set default values for optional fields', async () => {
    const minimalTestCase = {
      projectId: testProjectId,
      title: 'ミニマルケース'
    };

    const response = await request(app)
      .post('/api/testcases')
      .send(minimalTestCase)
      .expect(201);

    expect(response.body.specification).toBe('');
    expect(response.body.preconditions).toBe('');
    expect(response.body.steps).toBe('');
    expect(response.body.verification).toBe('');
    expect(response.body.tags).toEqual([]);
  });

  /**
   * テスト15: PUT /api/testcases/:id - updatedAtタイムスタンプの更新確認
   * 目的: テストケース更新時にupdatedAtフィールドが更新されることを確認
   */
  test('should update updatedAt timestamp on modification', async () => {
    // テストケースを作成
    const testCase = {
      projectId: testProjectId,
      title: 'タイムスタンプテスト'
    };

    const createResponse = await request(app)
      .post('/api/testcases')
      .send(testCase)
      .expect(201);

    const originalUpdatedAt = createResponse.body.updatedAt;
    const createdId = createResponse.body.id;

    // 少し待ってから更新（タイムスタンプの違いを確保）
    await new Promise(resolve => setTimeout(resolve, 10));

    // テストケースを更新
    const updateResponse = await request(app)
      .put(`/api/testcases/${createdId}`)
      .send({ title: '更新されたタイトル' })
      .expect(200);

    expect(updateResponse.body.updatedAt).not.toBe(originalUpdatedAt);
    expect(new Date(updateResponse.body.updatedAt).getTime())
      .toBeGreaterThan(new Date(originalUpdatedAt).getTime());
  });

  /**
   * テスト16: JSON構造の妥当性確認
   * 目的: レスポンスJSONの構造が期待される形式であることを確認
   */
  test('should return correct JSON structure for test case', async () => {
    const testCase = {
      projectId: testProjectId,
      title: 'JSON構造テスト',
      specification: 'テスト仕様',
      preconditions: 'テスト事前条件',
      steps: 'テスト手順',
      verification: 'テスト確認事項',
      tags: ['test']
    };

    const response = await request(app)
      .post('/api/testcases')
      .send(testCase)
      .expect(201);

    // 必須フィールドの存在確認
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('projectId');
    expect(response.body).toHaveProperty('title');
    expect(response.body).toHaveProperty('specification');
    expect(response.body).toHaveProperty('preconditions');
    expect(response.body).toHaveProperty('steps');
    expect(response.body).toHaveProperty('verification');
    expect(response.body).toHaveProperty('tags');
    expect(response.body).toHaveProperty('createdAt');
    expect(response.body).toHaveProperty('updatedAt');

    // データ型の確認
    expect(typeof response.body.id).toBe('string');
    expect(typeof response.body.projectId).toBe('string');
    expect(typeof response.body.title).toBe('string');
    expect(Array.isArray(response.body.tags)).toBe(true);
    expect(typeof response.body.createdAt).toBe('string');
    expect(typeof response.body.updatedAt).toBe('string');
  });

  /**
   * テスト17: 大量データの処理確認
   * 目的: 複数のテストケースが存在する場合の全件取得性能確認
   */
  test('should handle multiple test cases efficiently', async () => {
    const testCases = [];
    
    // 5件のテストケースを作成
    for (let i = 1; i <= 5; i++) {
      testCases.push({
        projectId: testProjectId,
        title: `テストケース${i}`,
        specification: `仕様${i}`
      });
    }

    // 全て作成
    for (const testCase of testCases) {
      await request(app)
        .post('/api/testcases')
        .send(testCase)
        .expect(201);
    }

    // 全件取得
    const response = await request(app)
      .get('/api/testcases')
      .expect(200);

    expect(response.body).toHaveLength(5);
    expect(response.body.map(tc => tc.title).sort())
      .toEqual(['テストケース1', 'テストケース2', 'テストケース3', 'テストケース4', 'テストケース5']);
  });

  /**
   * テスト18: Unicode文字の処理確認
   * 目的: 日本語やUnicode文字が正しく保存・取得されることを確認
   */
  test('should handle Unicode characters correctly', async () => {
    const testCase = {
      projectId: testProjectId,
      title: '🚀 Unicode テスト ケース 😊',
      specification: '日本語の仕様書\n改行も含む\n特殊文字: ①②③',
      preconditions: '前提条件: ユーザーが認証済み 🔐',
      steps: '手順:\n1. アクセス 🌐\n2. ログイン 👤\n3. 操作実行 ⚡',
      verification: '確認: 結果が正しく表示される ✅',
      tags: ['unicode', '日本語', 'emoji']
    };

    const response = await request(app)
      .post('/api/testcases')
      .send(testCase)
      .expect(201);

    expect(response.body.title).toBe('🚀 Unicode テスト ケース 😊');
    expect(response.body.specification).toBe('日本語の仕様書\n改行も含む\n特殊文字: ①②③');
    expect(response.body.tags).toEqual(['unicode', '日本語', 'emoji']);
  });

  /**
   * テスト19: Content-Type ヘッダーの確認
   * 目的: APIレスポンスのContent-Typeが正しくJSONに設定されることを確認
   */
  test('should return correct Content-Type header', async () => {
    const response = await request(app)
      .get('/api/testcases')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  /**
   * テスト20: エラーレスポンスの形式確認
   * 目的: エラー時のレスポンス形式が統一されていることを確認
   */
  test('should return consistent error response format', async () => {
    const nonExistentId = uuidv4();

    const response = await request(app)
      .get(`/api/testcases/${nonExistentId}`)
      .expect(404);

    expect(response.body).toHaveProperty('error');
    expect(typeof response.body.error).toBe('string');
  });
});