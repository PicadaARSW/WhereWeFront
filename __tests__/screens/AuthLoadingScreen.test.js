// Basic file existence test
describe("AuthLoadingScreen", () => {
  it("file exists", () => {
    const fs = require("fs");
    const path = "./screens/AuthLoadingScreen.jsx";
    expect(fs.existsSync(path)).toBe(true);
  });

  it("can be required without errors", () => {
    expect(() => {
      require("../../screens/AuthLoadingScreen");
    }).not.toThrow();
  });
});
