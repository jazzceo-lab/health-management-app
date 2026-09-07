import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('health_app.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // 복약 체크 테이블
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS medication_checks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            medication_id TEXT NOT NULL,
            date TEXT NOT NULL,
            time_slot TEXT NOT NULL,
            completed INTEGER DEFAULT 0,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );`
        );

        // 혈액검사 기록 테이블
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS blood_tests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            test_item_id TEXT NOT NULL,
            value REAL NOT NULL,
            date TEXT NOT NULL,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );`
        );

        // 탈모약 복용 추적 테이블
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS hairloss_tracking (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            medication TEXT NOT NULL,
            completed INTEGER DEFAULT 0,
            minoxidil_applied INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );`
        );

        // 알림 설정 테이블
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS notification_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            medication_id TEXT NOT NULL,
            time_slot TEXT NOT NULL,
            enabled INTEGER DEFAULT 1,
            notification_id TEXT
          );`
        );
      },
      reject,
      resolve
    );
  });
};

// 복약 체크 조회
export const getMedicationChecks = (date) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM medication_checks WHERE date = ?',
        [date],
        (_, result) => resolve(result.rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

// 복약 체크 저장
export const saveMedicationCheck = (medicationId, date, timeSlot, completed, notes = '') => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO medication_checks (medication_id, date, time_slot, completed, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [medicationId, date, timeSlot, completed ? 1 : 0, notes],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

// 복약 체크 업데이트
export const updateMedicationCheck = (id, completed, notes = '') => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE medication_checks SET completed = ?, notes = ? WHERE id = ?',
        [completed ? 1 : 0, notes, id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

// 혈액검사 기록 저장
export const saveBloodTest = (testItemId, value, date, notes = '') => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO blood_tests (test_item_id, value, date, notes)
         VALUES (?, ?, ?, ?)`,
        [testItemId, value, date, notes],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

// 특정 검사항목의 히스토리 조회
export const getBloodTestHistory = (testItemId, limit = 12) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM blood_tests WHERE test_item_id = ?
         ORDER BY date DESC LIMIT ?`,
        [testItemId, limit],
        (_, result) => resolve(result.rows._array.reverse()),
        (_, error) => reject(error)
      );
    });
  });
};

// 탈모약 추적 저장
export const saveHairlossTracking = (date, medication, completed, minoxidilApplied) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO hairloss_tracking (date, medication, completed, minoxidil_applied)
         VALUES (?, ?, ?, ?)`,
        [date, medication, completed ? 1 : 0, minoxidilApplied ? 1 : 0],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

// 주간 탈모약 추적 조회
export const getWeeklyHairlossTracking = (startDate, endDate) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM hairloss_tracking WHERE date BETWEEN ? AND ?
         ORDER BY date ASC`,
        [startDate, endDate],
        (_, result) => resolve(result.rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export default db;
