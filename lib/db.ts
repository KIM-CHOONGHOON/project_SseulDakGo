import mysql, { Pool, PoolOptions, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

declare global {
  // eslint-disable-next-line no-var
  var __ssuldak_db_pool__: Pool | undefined;
}

/**
 * ============================================================================
 * [데이터베이스 연결 풀 기본 설정]
 * - 기본 인코딩      : CHARSET=utf8mb4 / COLLATE=utf8mb4_0900_ai_ci
 * - DB 호스트 (IP)   : 5.104.87.214
 * - DB 포트          : 3306
 * - 데이터베이스명   : ssuldak_db
 * - DB 사용자 (User) : ssuldak (권장) 또는 root
 * - DB 비밀번호      : Ch72337528
 * - 커넥션 스트링 URI:
 *     전용 계정: mysql://ssuldak:Ch72337528@5.104.87.214:3306/ssuldak_db
 *     루트 계정: mysql://root:Ch72337528@5.104.87.214:3306/ssuldak_db
 * ============================================================================
 */

export const DB_CONFIG = {
  DEFAULT_HOST: '5.104.87.214',
  DEFAULT_PORT: 3306,
  DEFAULT_USER: 'ssuldak',
  DEFAULT_ROOT_USER: 'root',
  DEFAULT_PASSWORD: 'Ch72337528',
  DEFAULT_DATABASE: 'ssuldak_db',
  DEFAULT_CHARSET: 'utf8mb4',
  DEFAULT_TIMEZONE: '+09:00', // 한국 표준시 (KST)
  URI_DEDICATED: 'mysql://ssuldak:Ch72337528@5.104.87.214:3306/ssuldak_db',
  URI_ROOT: 'mysql://root:Ch72337528@5.104.87.214:3306/ssuldak_db',
};

// URI 형태(DATABASE_URL) 또는 개별 옵션 지원
const poolOptions: PoolOptions = process.env.DATABASE_URL
  ? {
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
      queueLimit: 0,
      charset: 'utf8mb4',
      timezone: '+09:00',
    }
  : {
      host: process.env.DB_HOST || DB_CONFIG.DEFAULT_HOST,
      port: Number(process.env.DB_PORT) || DB_CONFIG.DEFAULT_PORT,
      user: process.env.DB_USER || DB_CONFIG.DEFAULT_USER,
      password: process.env.DB_PASSWORD || DB_CONFIG.DEFAULT_PASSWORD,
      database: process.env.DB_NAME || DB_CONFIG.DEFAULT_DATABASE,
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
      queueLimit: 0,
      charset: 'utf8mb4',
      timezone: '+09:00', // 한국 표준시(KST)
      // MySQL 8.0 이상 utf8mb4_0900_ai_ci 및 세션 초기화 보장
      ssl: process.env.DB_USE_SSL === 'true' ? {} : undefined,
    };

let pool: Pool;

// 싱글톤 커넥션 풀 보장 (Next.js / Node HMR 재로딩 시 커넥션 누수 방지)
if (process.env.NODE_ENV === 'production') {
  pool = mysql.createPool(poolOptions);
} else {
  if (!global.__ssuldak_db_pool__) {
    global.__ssuldak_db_pool__ = mysql.createPool(poolOptions);
  }
  pool = global.__ssuldak_db_pool__;
}

/**
 * 활성화된 MySQL 커넥션 풀 인스턴스 반환
 */
export function getDbPool(): Pool {
  return pool;
}

/**
 * 단일 SQL 쿼리 실행 헬퍼 함수
 * @param query 실행할 SQL 구문
 * @param params 바인딩 파라미터 배열
 */
export async function executeQuery<T = RowDataPacket[] | ResultSetHeader>(
  query: string,
  params: unknown[] = []
): Promise<T> {
  const db = getDbPool();
  const [results] = await db.execute(query, params as any);
  return results as T;
}

/**
 * 트랜잭션 전용 실행 헬퍼 함수 (자동 commit / rollback / release)
 * @param callback 트랜잭션 내에서 실행할 비즈니스 로직
 */
export async function executeTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const db = getDbPool();
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * DB 연결 및 인코딩 상태 사전 헬스체크 함수
 */
export async function checkDbConnection(): Promise<{
  connected: boolean;
  characterSet?: string;
  collation?: string;
  database?: string;
  user?: string;
  error?: string;
}> {
  try {
    const db = getDbPool();
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT @@character_set_database AS cs, @@collation_database AS col, DATABASE() AS db, CURRENT_USER() AS user'
    );
    if (rows && rows.length > 0) {
      return {
        connected: true,
        characterSet: rows[0].cs,
        collation: rows[0].col,
        database: rows[0].db,
        user: rows[0].user,
      };
    }
    return { connected: true };
  } catch (err: any) {
    return {
      connected: false,
      error: err?.message || 'DB 연결 확인 실패',
    };
  }
}

export default pool;
