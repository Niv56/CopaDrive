const { files } = require('../utils/storage');

const normalizeParentId = (parentId) => (parentId === undefined ? null : parentId);

/**
 * מחזיר קבצים/תיקיות תחת parentId, אבל **לא מחזיר trashed**
 */
const findByParent = (parentId, ownerId) => {
  const p = normalizeParentId(parentId);
  return files.filter(f => {
    if (f.trashed === true) return false; // ⭐️ חשוב ל-Trash
    const fp = normalizeParentId(f.parentId);
    const parentMatch = fp === p;
    const ownerMatch = ownerId ? f.ownerId === ownerId : true;
    return parentMatch && ownerMatch;
  });
};

const findAll = () => files;

/**
 * findById משאיר כולל trashed (כי צריך את זה ל-restore / delete forever)
 */
const findById = (id, ownerId) => {
  if (!ownerId) return files.find(f => f.id === id);
  return files.find(f => f.id === id && f.ownerId === ownerId);
};

const create = (fileData) => {
  const newFileData = {
    trashed: false,
    trashedAt: null,
    originalParentId: null,
    ...fileData,
  };

  files.push(newFileData);
  return newFileData;
};

const update = (id, updates, ownerId) => {
  const idx = files.findIndex(f => {
    if (!ownerId) return f.id === id;
    return f.id === id && f.ownerId === ownerId;
  });

  if (idx === -1) return null;

  files[idx] = { ...files[idx], ...updates };
  return files[idx];
};

const remove = (id, ownerId) => {
  const idx = files.findIndex(f => {
    if (!ownerId) return f.id === id;
    return f.id === id && f.ownerId === ownerId;
  });

  if (idx === -1) return null;
  return files.splice(idx, 1)[0];
};

/**
 * ילדים “פעילים” בלבד (לא trashed), אחרת תיקייה trashed תיחשב שיש לה ילדים ותתקע דברים
 */
const hasChildren = (parentId, ownerId) => {
  return files.some(f => {
    if (f.trashed === true) return false; // ⭐️ חשוב ל-Trash
    const ownerMatch = ownerId ? f.ownerId === ownerId : true;
    return ownerMatch && (f.parentId ?? null) === parentId;
  });
};

/**
 * חיפוש “פעיל” בלבד (לא trashed) – ה-Trash יקבל endpoint משלו
 */
const searchFiles = (userId, query) => {
  const normalizedQuery = query.toLowerCase();

  return files.filter(file =>
    file.ownerId === userId &&
    file.trashed !== true && // ⭐️ חשוב ל-Trash
    (
      file.name.toLowerCase().includes(normalizedQuery) ||
      (file.content && file.content.toLowerCase().includes(normalizedQuery))
    )
  );
};

/**
 * ⭐️ חדש: רשימת Trash
 */
const findTrashed = (ownerId) => {
  return files.filter(f => f.ownerId === ownerId && f.trashed === true);
};

// Find multiple files by their IDs
const findByIds = (idsArray) => files.filter(f => idsArray.includes(f.id));

module.exports = {
  findByParent,
  findById,
  create,
  update,
  remove,
  hasChildren,
  searchFiles,
  findByIds,
  findAll,
  findTrashed, // ⭐️ חדש
};
