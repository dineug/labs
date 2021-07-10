/**
 * indexedDB example 예제는
 * electron 환경에서 여러창이
 * indexedDB에 접근할때 tx마다 열고 닫는 예제입니다.
 */

const DB_NAME = 'rxjs_study';
const DB_VERSION = 1;
const DB_STORE_NAME_PROJECT = 'project';
const DB_STORE_NAME_MODEL = 'model';
const MODE = {
  RW: 'readwrite',
  R: 'readonly',
};

function openIndexedDB() {
  const openDB = indexedDB.open(DB_NAME, DB_VERSION);

  openDB.onerror = e => {
    alert('IndexedDB onerror');
  };

  openDB.onupgradeneeded = e => {
    console.log('IndexedDB onupgradeneeded');
    e.currentTarget.result.createObjectStore(DB_STORE_NAME_PROJECT, {
      keyPath: 'id',
    });
    e.currentTarget.result.createObjectStore(DB_STORE_NAME_MODEL, {
      keyPath: 'id',
      autoIncrement: true,
    });
  };

  return openDB;
}

function getObjectStore(openDB, storeName, mode, complete) {
  const db = {};

  db.result = openDB.result;
  db.tx = db.result.transaction(storeName, mode);
  db.store = db.tx.objectStore(storeName);
  db.tx.oncomplete = e => {
    db.result.close();
    complete && complete();
  };

  return db;
}

function addProject(data, callback) {
  const openDB = openIndexedDB();

  openDB.onsuccess = e => {
    const db = getObjectStore(openDB, DB_STORE_NAME_PROJECT, MODE.RW, callback);

    db.store.add(data);
  };
}

function addModel(data, callback) {
  const openDB = openIndexedDB();

  openDB.onsuccess = e => {
    const db = getObjectStore(openDB, DB_STORE_NAME_MODEL, MODE.RW, callback);

    db.store.add(data);
  };
}

function findByProjectId(id, callback) {
  const openDB = openIndexedDB();

  openDB.onsuccess = e => {
    const db = getObjectStore(openDB, DB_STORE_NAME_PROJECT, MODE.R);
    const req = db.store.get(id);

    req.onsuccess = e => {
      callback(e.target.result);
    };
  };
}

function updateByProjectId(id, data, callback) {
  const openDB = openIndexedDB();

  openDB.onsuccess = e => {
    const db = getObjectStore(openDB, DB_STORE_NAME_PROJECT, MODE.RW, callback);
    const req = db.store.get(id);

    req.onsuccess = e => {
      const oldData = req.result;

      db.store.put({
        ...oldData,
        ...data,
      });
    };
  };
}

function deleteByProjectId(id, callback) {
  const openDB = openIndexedDB();

  openDB.onsuccess = e => {
    const db = getObjectStore(openDB, DB_STORE_NAME_PROJECT, MODE.RW, callback);
    const req = db.store.get(id);

    req.onsuccess = e => {
      db.store.delete(id);
    };
  };
}

function findModels(callback) {
  const list = [];
  const openDB = openIndexedDB();

  openDB.onsuccess = e => {
    const db = getObjectStore(openDB, DB_STORE_NAME_MODEL, MODE.R);
    const req = db.store.openCursor();

    req.onsuccess = e => {
      const cursor = e.target.result;

      if (cursor) {
        const req = db.store.get(cursor.key);

        req.onsuccess = e => {
          list.push(e.target.result);
        };

        cursor.continue();
      } else {
        callback(list);
      }
    };
  };
}

/**
 * example 실행
 */

const projectId = Math.random().toString();

addProject(
  {
    id: projectId,
    name: 'test',
  },
  () => console.log('project 추가')
);

addModel(
  {
    name: 'test',
  },
  () => console.log('model 추가')
);

findByProjectId(projectId, console.log);

updateByProjectId(
  projectId,
  {
    name: 'test-update',
  },
  () => console.log('project 수정')
);

deleteByProjectId(projectId, () => console.log('삭제'));

findModels(console.log);
