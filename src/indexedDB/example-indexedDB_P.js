const DB_NAME = 'rxjs_study';
const DB_VERSION = 1;
const DB_STORE_NAME_PROJECT = 'project';
const DB_STORE_NAME_MODEL = 'model';
const MODE = {
  RW: 'readwrite',
  R: 'readonly',
};

let db = null;

const openIndexedDB = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onerror = e => {
      alert('IndexedDB onerror');
      reject(e);
    };
    req.onsuccess = e => {
      console.log('IndexedDB onsuccess');
      db = req.result;
      resolve();
    };
    req.onupgradeneeded = e => {
      console.log('IndexedDB onupgradeneeded');
      e.currentTarget.result.createObjectStore(DB_STORE_NAME_PROJECT, {
        keyPath: 'id',
      });
      e.currentTarget.result.createObjectStore(DB_STORE_NAME_MODEL, {
        keyPath: 'id',
        autoIncrement: true,
      });
    };
  });

const getObjectStore = (storeName, mode, complete) =>
  new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);

    tx.oncomplete = e => {
      complete && complete();
    };
    tx.onerror = reject;

    resolve(tx.objectStore(storeName));
  });

const add = (storeName, data) =>
  new Promise(async (resolve, reject) => {
    try {
      const store = await getObjectStore(storeName, MODE.RW, resolve);

      store.add(data);
    } catch (e) {
      reject(e);
    }
  });

const findById = (storeName, id) =>
  new Promise(async (resolve, reject) => {
    try {
      const store = await getObjectStore(storeName, MODE.R);
      const req = store.get(id);

      req.onsuccess = e => {
        resolve(e.target.result);
      };
    } catch (e) {
      reject(e);
    }
  });

const updateById = (storeName, id, data) =>
  new Promise(async (resolve, reject) => {
    try {
      const store = await getObjectStore(storeName, MODE.RW, resolve);
      const req = store.get(id);

      req.onsuccess = e => {
        const oldData = req.result;

        store.put({
          ...oldData,
          ...data,
        });
      };
    } catch (e) {
      reject(e);
    }
  });

const deleteById = (storeName, id) =>
  new Promise(async (resolve, reject) => {
    try {
      const store = await getObjectStore(storeName, MODE.RW, resolve);
      const req = store.get(id);

      req.onsuccess = e => {
        store.delete(id);
      };
    } catch (e) {
      reject(e);
    }
  });

const findAll = storeName =>
  new Promise(async (resolve, reject) => {
    try {
      const store = await getObjectStore(storeName, MODE.R);
      const req = store.openCursor();
      const list = [];

      req.onsuccess = e => {
        const cursor = e.target.result;

        if (cursor) {
          const req = store.get(cursor.key);

          req.onsuccess = e => {
            list.push(e.target.result);
          };

          cursor.continue();
        } else {
          resolve(list);
        }
      };
    } catch (e) {
      reject(e);
    }
  });

/**
 * example 실행
 */

openIndexedDB().then(() => {
  const projectId = Math.random().toString();

  add(DB_STORE_NAME_PROJECT, {
    id: projectId,
    name: 'test',
  }).then(() => console.log('project 추가'));

  add(DB_STORE_NAME_MODEL, {
    name: 'test',
  }).then(() => console.log('model 추가'));

  findById(DB_STORE_NAME_PROJECT, projectId).then(console.log);

  updateById(DB_STORE_NAME_PROJECT, projectId, {
    name: 'test-update',
  }).then(() => console.log('project 수정'));

  deleteById(DB_STORE_NAME_PROJECT, projectId).then(() => console.log('삭제'));

  findAll(DB_STORE_NAME_MODEL).then(console.log);
});
