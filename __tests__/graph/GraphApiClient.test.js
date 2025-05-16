// Basic file existence test
describe("GraphAuthProvider", () => {
  it("file exists", () => {
    const fs = require("fs");
    const path = "./graph/GraphAuthProvider.js";
    expect(fs.existsSync(path)).toBe(true);
  });

  it("can be required without errors", () => {
    expect(() => {
      require("../../graph/GraphAuthProvider");
    }).not.toThrow();
  });
});
