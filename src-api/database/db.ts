import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';

// Abre o banco local do dispositivo
const expoDb = SQLite.openDatabaseSync('app.db');

// Exporta o Drizzle pronto para uso
export const db = drizzle(expoDb);