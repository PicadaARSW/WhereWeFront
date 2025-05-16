describe("Style Files", () => {
  it("HomeScreenStyles can be imported", () => {
    const styles = require("../../styles/HomeScreenStyles").default;
    expect(styles).toBeDefined();
    expect(styles.container).toBeDefined();
  });

  it("GroupItemStyles can be imported", () => {
    const styles = require("../../styles/GroupItemStyles").default;
    expect(styles).toBeDefined();
  });

  it("UserItemStyles can be imported", () => {
    const styles = require("../../styles/UserItemStyles").default;
    expect(styles).toBeDefined();
  });

  it("CustomAlertStyles can be imported", () => {
    const styles = require("../../styles/CustomAlertStyles").default;
    expect(styles).toBeDefined();
  });

  it("DrawerMenuStyles can be imported", () => {
    const styles = require("../../styles/DrawerMenuStyles").default;
    expect(styles).toBeDefined();
  });

  it("GroupScreenStyles can be imported", () => {
    const styles = require("../../styles/GroupScreenStyles").default;
    expect(styles).toBeDefined();
  });

  it("AuthLoadingScreenStyles can be imported", () => {
    const styles = require("../../styles/AuthLoadingScreenStyles").default;
    expect(styles).toBeDefined();
  });

  it("SigninScreenStyles can be imported", () => {
    const styles = require("../../styles/SigninScreenStyles").default;
    expect(styles).toBeDefined();
  });

  it("EditProfileScreenStyles can be imported", () => {
    const styles = require("../../styles/EditProfileScreenStyles").default;
    expect(styles).toBeDefined();
  });
});
