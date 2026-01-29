import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';

const SQLiteContext = createContext(null);

export function SQLiteProvider({ children }) {
  const [dbWrapper, setDbWrapper] = useState(null);

  useEffect(() => {
    const database = SQLite.openDatabase('bonakota.db');

    const wrapper = {
      rawDb: database,
      runAsync(sql, params = []) {
        return new Promise((resolve, reject) => {
          database.transaction(
            (tx) => {
              tx.executeSql(
                sql,
                params,
                (_, result) => resolve(result),
                (_, err) => {
                  reject(err);
                  return false;
                }
              );
            },
            (txErr) => reject(txErr)
          );
        });
      },
      async getAllAsync(sql, params = []) {
        const res = await wrapper.runAsync(sql, params);
        const rows = [];
        for (let i = 0; i < res.rows.length; i++) {
          rows.push(res.rows.item(i));
        }
        return rows;
      },
    };

    setDbWrapper(wrapper);
  }, []);

  return <SQLiteContext.Provider value={dbWrapper}>{children}</SQLiteContext.Provider>;
}

export function useSQLiteContext() {
  const ctx = useContext(SQLiteContext);
  if (!ctx) throw new Error('useSQLiteContext must be used within SQLiteProvider');
  return ctx;
}

export default { SQLiteProvider, useSQLiteContext };
