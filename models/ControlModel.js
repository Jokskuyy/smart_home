const BaseModel = require("./BaseModel");

class ControlModel extends BaseModel {
  constructor() {
    super("control_commands");
  }

  async logCommand(commandType, action) {
    await this.db.execute(
      "INSERT INTO control_commands (command_type, action) VALUES (?, ?)",
      [commandType, action]
    );
  }
}

module.exports = new ControlModel();
