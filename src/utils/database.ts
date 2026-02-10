import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const checkpointDatabase = async () => {
    const database = await getDb();
    await database.execAsync('PRAGMA wal_checkpoint(TRUNCATE);');
};

export const closeDb = async () => {
    if (db) {
        await db.closeAsync();
        db = null;
    }
};

export const initDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('vault.db');
  }

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS registros_acceso (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_nombre TEXT NOT NULL,
      plataforma TEXT NOT NULL,
      usuario TEXT NOT NULL,
      password_cifrada TEXT NOT NULL,
      notas TEXT,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_cliente ON registros_acceso (cliente_nombre);
  `);
  
  return db;
};

export const getDb = async () => {
  if (!db) return await initDatabase();
  return db;
};

export interface RegistroAcceso {
  id?: number;
  cliente_nombre: string;
  plataforma: string;
  usuario: string;
  password_cifrada: string;
  notas?: string;
  fecha_creacion?: string;
}

export const addPassword = async (registro: RegistroAcceso) => {
  const database = await getDb();
  const result = await database.runAsync(
    'INSERT INTO registros_acceso (cliente_nombre, plataforma, usuario, password_cifrada, notas) VALUES (?, ?, ?, ?, ?)',
    [registro.cliente_nombre, registro.plataforma, registro.usuario, registro.password_cifrada, registro.notas || '']
  );
  return result.lastInsertRowId;
};

export const searchPasswords = async (query: string): Promise<RegistroAcceso[]> => {
  const database = await getDb();
  // Buscamos tanto en cliente como en plataforma para que si un cliente tiene varias, aparezcan todas
  const rows = await database.getAllAsync<RegistroAcceso>(
    'SELECT * FROM registros_acceso WHERE cliente_nombre LIKE ? OR plataforma LIKE ? ORDER BY cliente_nombre ASC, plataforma ASC',
    [`%${query}%`, `%${query}%`]
  );
  return rows;
};

export const deletePassword = async (id: number) => {
  const database = await getDb();
  await database.runAsync('DELETE FROM registros_acceso WHERE id = ?', [id]);
};

export const updatePassword = async (id: number, registro: Partial<RegistroAcceso>) => {
  const database = await getDb();
  // Nota: Simplificado, en una app real construirías el SET dinámicamente
  await database.runAsync(
    'UPDATE registros_acceso SET cliente_nombre = ?, plataforma = ?, usuario = ?, password_cifrada = ?, notas = ? WHERE id = ?',
    [registro.cliente_nombre!, registro.plataforma!, registro.usuario!, registro.password_cifrada!, registro.notas || '', id]
  );
};
