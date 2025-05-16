// Basic file existence test
describe("SignInScreen", () => {
  it("file exists", () => {
    const fs = require("fs");
    const path = "./screens/SignInScreen.jsx";
    expect(fs.existsSync(path)).toBe(true);
  });

  it("can be required without errors", () => {
    expect(() => {
      require("../../screens/SignInScreen");
    }).not.toThrow();
  });
});
