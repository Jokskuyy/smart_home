const DatabaseService = require("../services/DatabaseService");

class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
    this.db = null;
    this.init();
  }

  async init() {
    // Tunggu pool siap
    while (!DatabaseService.isConnected()) {
      await new Promise((r) => setTimeout(r, 100)); // tunggu 100ms
    }
    this.db = DatabaseService.getPool();
  }

  async getTableSchema() {
    return await DatabaseService.getTableSchema(this.tableName);
  }

  buildInsertQuery(availableColumns, dataFields) {
    const validFields = dataFields.filter((field) =>
      availableColumns.includes(field)
    );
    const placeholders = validFields.map(() => "?").join(", ");

    return {
      query: `INSERT INTO ${this.tableName} (${validFields.join(
        ", "
      )}) VALUES (${placeholders})`,
      fields: validFields,
    };
  }

  buildUpsertQuery(availableColumns, dataFields, keyField = "device_id") {
    const validFields = dataFields.filter((field) =>
      availableColumns.includes(field)
    );
    const placeholders = validFields.map(() => "?").join(", ");

    const updateFields = validFields
      .filter((field) => field !== keyField)
      .map((field) => `${field} = VALUES(${field})`)
      .join(", ");

    let updateClause = updateFields;
    if (availableColumns.includes("last_seen")) {
      updateClause += updateClause
        ? ", last_seen = CURRENT_TIMESTAMP"
        : "last_seen = CURRENT_TIMESTAMP";
    }

    return {
      query: `INSERT INTO ${this.tableName} (${validFields.join(
        ", "
      )}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updateClause}`,
      fields: validFields,
    };
  }

  async findLatest() {
    const [rows] = await this.db.execute(
      `SELECT * FROM ${this.tableName} ORDER BY created_at DESC LIMIT 1`
    );
    return rows[0] || null;
  }

  async findHistory(limit = 100) {
    const [rows] = await this.db.execute(
      `SELECT * FROM ${this.tableName} ORDER BY created_at DESC LIMIT ?`,
      [limit]
    );
    return rows;
  }

  async findAll() {
    const [rows] = await this.db.execute(`SELECT * FROM ${this.tableName}`);
    return rows;
  }

  async findById(id) {
    const [rows] = await this.db.execute(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async update(id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((field) => `${field} = ?`).join(", ");

    await this.db.execute(
      `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
  }

  async delete(id) {
    await this.db.execute(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
  }
}

module.exports = BaseModel;
