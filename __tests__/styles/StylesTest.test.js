/*
 * This file contains tests for all style files in the project.
 * We explicitly import each style file to ensure they're included in coverage.
 */
import homeStyles from "../../styles/HomeScreenStyles";
import groupItemStyles from "../../styles/GroupItemStyles";
import userItemStyles from "../../styles/UserItemStyles";
import customAlertStyles from "../../styles/CustomAlertStyles";
import drawerMenuStyles from "../../styles/DrawerMenuStyles";
import groupScreenStyles from "../../styles/GroupScreenStyles";
import authLoadingStyles from "../../styles/AuthLoadingScreenStyles";
import signinStyles from "../../styles/SigninScreenStyles";
import editProfileStyles from "../../styles/EditProfileScreenStyles";
import groupDetailStyles from "../../styles/GroupDetailScreenStyles";
import groupMapStyles from "../../styles/GroupMapScreenStyles";
import profilePictureStyles from "../../styles/ProfilePictureSettingsStyles";

describe("Style Files", () => {
  it("HomeScreenStyles has expected properties", () => {
    // Test that module is defined and exported correctly
    expect(homeStyles).toBeDefined();
    expect(typeof homeStyles).toBe("object");

    // Test container styles
    expect(homeStyles.container).toBeDefined();
    expect(homeStyles.container.flex).toBe(1);
    expect(homeStyles.container.backgroundColor).toBe("#FFFFFF");
    expect(homeStyles.container.alignItems).toBe("center");

    // Test infoContainer styles
    expect(homeStyles.infoContainer).toBeDefined();
    expect(homeStyles.infoContainer.borderRadius).toBe(20);

    // Test other style properties
    expect(homeStyles.userIcon.fontSize).toBe(50);
    expect(homeStyles.userText.fontSize).toBe(20);
    expect(homeStyles.email.fontSize).toBe(16);
    expect(homeStyles.separator.backgroundColor).toBe("#a3a3a3");
    expect(homeStyles.description.fontSize).toBe(14);
    expect(homeStyles.joinGroup.backgroundColor).toBe("#276B80");
    expect(homeStyles.buttonText.color).toBe("white");
    expect(homeStyles.createContainer.borderRadius).toBe(20);
    expect(homeStyles.groupIcon.fontSize).toBe(50);
    expect(homeStyles.createButton.backgroundColor).toBe("#276B80");
    expect(homeStyles.createButtonText.color).toBe("white");
    expect(homeStyles.modalContainer.flex).toBe(1);
    expect(homeStyles.modalContent.backgroundColor).toBe("white");
    expect(homeStyles.modalTitle.fontSize).toBe(20);
    expect(homeStyles.input.borderWidth).toBe(1);
    expect(homeStyles.button.backgroundColor).toBe("#276B80");
  });

  it("GroupItemStyles has expected properties", () => {
    expect(groupItemStyles).toBeDefined();
    expect(typeof groupItemStyles).toBe("object");

    expect(groupItemStyles.container).toBeDefined();
    expect(groupItemStyles.container.padding).toBe(15);
    expect(groupItemStyles.container.borderBottomWidth).toBe(1);
    expect(groupItemStyles.container.borderBottomColor).toBe("#ccc");

    expect(groupItemStyles.groupName).toBeDefined();
    expect(groupItemStyles.groupName.fontSize).toBe(18);
    expect(groupItemStyles.groupName.fontWeight).toBe("bold");

    expect(groupItemStyles.buttonMap).toBeDefined();
    expect(groupItemStyles.buttonMap.backgroundColor).toBe("#276B80");

    expect(groupItemStyles.buttonText).toBeDefined();
    expect(groupItemStyles.buttonText.color).toBe("white");
  });

  it("UserItemStyles has expected properties", () => {
    expect(userItemStyles).toBeDefined();
    expect(typeof userItemStyles).toBe("object");

    expect(userItemStyles.container).toBeDefined();
    expect(userItemStyles.container.flexDirection).toBe("row");
    expect(userItemStyles.container.padding).toBe(10);

    expect(userItemStyles.userName).toBeDefined();
    expect(userItemStyles.userName.fontSize).toBe(18);

    expect(userItemStyles.userEmail).toBeDefined();
    expect(userItemStyles.userEmail.fontSize).toBe(14);

    expect(userItemStyles.userTimeZone).toBeDefined();
    expect(userItemStyles.userTimeZone.fontSize).toBe(12);

    expect(userItemStyles.expelButton).toBeDefined();
    expect(userItemStyles.expelButton.backgroundColor).toBe("#d32f2f");
  });

  it("CustomAlertStyles has expected properties", () => {
    expect(customAlertStyles).toBeDefined();
    expect(typeof customAlertStyles).toBe("object");

    expect(customAlertStyles.overlay).toBeDefined();
    expect(customAlertStyles.overlay.flex).toBe(1);
    expect(customAlertStyles.overlay.backgroundColor).toBe(
      "rgba(0, 0, 0, 0.5)"
    );

    expect(customAlertStyles.alertContainer).toBeDefined();
    expect(customAlertStyles.alertContainer.backgroundColor).toBe("white");
    expect(customAlertStyles.alertContainer.borderRadius).toBe(15);

    expect(customAlertStyles.title).toBeDefined();
    expect(customAlertStyles.title.fontSize).toBe(20);

    expect(customAlertStyles.message).toBeDefined();
    expect(customAlertStyles.message.fontSize).toBe(16);

    expect(customAlertStyles.buttonContainer).toBeDefined();
    expect(customAlertStyles.buttonContainer.flexDirection).toBe("row");

    expect(customAlertStyles.button).toBeDefined();
    expect(customAlertStyles.button.flex).toBe(1);

    expect(customAlertStyles.buttonText).toBeDefined();
    expect(customAlertStyles.buttonText.color).toBe("white");

    expect(customAlertStyles.destructiveButton).toBeDefined();
    expect(customAlertStyles.destructiveButton.backgroundColor).toBe("#FF6347");

    expect(customAlertStyles.destructiveButtonText).toBeDefined();
    expect(customAlertStyles.destructiveButtonText.color).toBe("white");

    expect(customAlertStyles.cancelButton).toBeDefined();
    expect(customAlertStyles.cancelButton.backgroundColor).toBe("#ccc");

    expect(customAlertStyles.cancelButtonText).toBeDefined();
    expect(customAlertStyles.cancelButtonText.color).toBe("#333");
  });

  it("DrawerMenuStyles has expected properties", () => {
    expect(drawerMenuStyles).toBeDefined();
    expect(typeof drawerMenuStyles).toBe("object");

    expect(drawerMenuStyles.profileView).toBeDefined();
    expect(drawerMenuStyles.profileView.alignItems).toBe("center");
    expect(drawerMenuStyles.profileView.padding).toBe(10);

    expect(drawerMenuStyles.profilePhoto).toBeDefined();
    expect(drawerMenuStyles.profilePhoto.width).toBe(80);
    expect(drawerMenuStyles.profilePhoto.height).toBe(80);

    expect(drawerMenuStyles.profileUserName).toBeDefined();
    expect(drawerMenuStyles.profileUserName.fontWeight).toBe("700");

    expect(drawerMenuStyles.profileEmail).toBeDefined();
    expect(drawerMenuStyles.profileEmail.fontWeight).toBe("200");

    expect(drawerMenuStyles.signOutLabel).toBeDefined();
    expect(drawerMenuStyles.signOutLabel.color).toBe("#ff4444");
  });

  it("GroupScreenStyles has expected properties", () => {
    expect(groupScreenStyles).toBeDefined();
    expect(typeof groupScreenStyles).toBe("object");

    expect(groupScreenStyles.container).toBeDefined();
    expect(groupScreenStyles.container.flex).toBe(1);
    expect(groupScreenStyles.container.padding).toBe(20);

    expect(groupScreenStyles.header).toBeDefined();
    expect(groupScreenStyles.header.fontSize).toBe(24);
    expect(groupScreenStyles.header.fontWeight).toBe("bold");

    expect(groupScreenStyles.alertMessage).toBeDefined();
    expect(groupScreenStyles.alertMessage.fontSize).toBe(16);
    expect(groupScreenStyles.alertMessage.color).toBe("#555");
  });

  it("AuthLoadingScreenStyles has expected properties", () => {
    expect(authLoadingStyles).toBeDefined();
    expect(typeof authLoadingStyles).toBe("object");

    expect(authLoadingStyles.container).toBeDefined();
    expect(authLoadingStyles.container.flex).toBe(1);
    expect(authLoadingStyles.container.backgroundColor).toBe("#f0f4f7");

    expect(authLoadingStyles.header).toBeDefined();
    expect(authLoadingStyles.header.backgroundColor).toBe("#276b80");

    expect(authLoadingStyles.headerText).toBeDefined();
    expect(authLoadingStyles.headerText.fontSize).toBe(24);

    expect(authLoadingStyles.loadingContainer).toBeDefined();
    expect(authLoadingStyles.loadingContainer.flex).toBe(1);

    expect(authLoadingStyles.logo).toBeDefined();
    expect(authLoadingStyles.logo.width).toBe(310);
    expect(authLoadingStyles.logo.height).toBe(310);

    expect(authLoadingStyles.indicator).toBeDefined();
    expect(authLoadingStyles.indicator.marginBottom).toBe(15);

    expect(authLoadingStyles.statusText).toBeDefined();
    expect(authLoadingStyles.statusText.fontSize).toBe(18);
    expect(authLoadingStyles.statusText.color).toBe("#276b80");
  });

  it("SigninScreenStyles has expected properties", () => {
    expect(signinStyles).toBeDefined();
    expect(typeof signinStyles).toBe("object");

    expect(signinStyles.container).toBeDefined();
    expect(signinStyles.container.flex).toBe(1);
    expect(signinStyles.container.backgroundColor).toBe("#ecc6ea");

    expect(signinStyles.backgroundImage).toBeDefined();
    expect(signinStyles.backgroundImage.position).toBe("absolute");

    expect(signinStyles.mainTitle).toBeDefined();
    expect(signinStyles.mainTitle.fontSize).toBe(55);
    expect(signinStyles.mainTitle.color).toBe("#003366");

    expect(signinStyles.welcomeTitle).toBeDefined();
    expect(signinStyles.welcomeTitle.fontSize).toBe(24);
    expect(signinStyles.welcomeTitle.color).toBe("#276B80");

    expect(signinStyles.card).toBeDefined();
    expect(signinStyles.card.width).toBe(320);
    expect(signinStyles.card.borderRadius).toBe(10);

    expect(signinStyles.signInButton).toBeDefined();
    expect(signinStyles.signInButton.backgroundColor).toBe("#003366");

    expect(signinStyles.buttonContainer).toBeDefined();
    expect(signinStyles.buttonContainer.justifyContent).toBe("center");

    expect(signinStyles.paragraphText).toBeDefined();
    expect(signinStyles.paragraphText.fontSize).toBe(16);
  });

  it("EditProfileScreenStyles has expected properties", () => {
    expect(editProfileStyles).toBeDefined();
    expect(typeof editProfileStyles).toBe("object");

    expect(editProfileStyles.container).toBeDefined();
    expect(editProfileStyles.container.flex).toBe(1);
    expect(editProfileStyles.container.justifyContent).toBe("center");
    expect(editProfileStyles.container.backgroundColor).toBe("#f5f5f5");

    expect(editProfileStyles.title).toBeDefined();
    expect(editProfileStyles.title.fontSize).toBe(24);
    expect(editProfileStyles.title.color).toBe("#276b80");

    expect(editProfileStyles.button).toBeDefined();
    expect(editProfileStyles.button.backgroundColor).toBe("#276b80");
    expect(editProfileStyles.button.borderRadius).toBe(10);

    expect(editProfileStyles.deleteButton).toBeDefined();
    expect(editProfileStyles.deleteButton.backgroundColor).toBe("#ff4444");

    expect(editProfileStyles.buttonText).toBeDefined();
    expect(editProfileStyles.buttonText.color).toBe("white");
    expect(editProfileStyles.buttonText.fontSize).toBe(16);
  });

  it("GroupDetailScreenStyles has expected properties", () => {
    expect(groupDetailStyles).toBeDefined();
    expect(typeof groupDetailStyles).toBe("object");

    expect(groupDetailStyles.container).toBeDefined();
    expect(groupDetailStyles.container.flex).toBe(1);
    expect(groupDetailStyles.container.backgroundColor).toBe("#f5f5f5");

    expect(groupDetailStyles.groupInfo).toBeDefined();
    expect(groupDetailStyles.groupInfo.backgroundColor).toBe("white");
    expect(groupDetailStyles.groupInfo.borderRadius).toBe(10);

    expect(groupDetailStyles.headerContainer).toBeDefined();
    expect(groupDetailStyles.headerContainer.flexDirection).toBe("row");

    expect(groupDetailStyles.header).toBeDefined();
    expect(groupDetailStyles.header.fontSize).toBe(28);

    expect(groupDetailStyles.groupDetail).toBeDefined();
    expect(groupDetailStyles.groupDetail.marginBottom).toBe(10);

    expect(groupDetailStyles.detailText).toBeDefined();
    expect(groupDetailStyles.detailText.fontSize).toBe(16);

    expect(groupDetailStyles.groupName).toBeDefined();
    expect(groupDetailStyles.groupName.fontSize).toBe(18);

    expect(groupDetailStyles.adminText).toBeDefined();
    expect(groupDetailStyles.adminText.fontSize).toBe(16);

    expect(groupDetailStyles.membersHeader).toBeDefined();
    expect(groupDetailStyles.membersHeader.fontSize).toBe(22);

    expect(groupDetailStyles.buttonMap).toBeDefined();
    expect(groupDetailStyles.buttonMap.backgroundColor).toBe("#276B80");

    expect(groupDetailStyles.leaveButton).toBeDefined();
    expect(groupDetailStyles.leaveButton.backgroundColor).toBe("#d32f2f");

    expect(groupDetailStyles.leaveButtonText).toBeDefined();
    expect(groupDetailStyles.leaveButtonText.color).toBe("#fff");

    expect(groupDetailStyles.buttonText).toBeDefined();
    expect(groupDetailStyles.buttonText.color).toBe("white");
  });

  it("GroupMapScreenStyles has expected properties", () => {
    expect(groupMapStyles).toBeDefined();
    expect(typeof groupMapStyles).toBe("object");

    // Test just a subset of properties due to the large number
    expect(groupMapStyles.container).toBeDefined();
    expect(groupMapStyles.container.flex).toBe(1);

    expect(groupMapStyles.map).toBeDefined();
    expect(groupMapStyles.map.position).toBe("absolute");

    expect(groupMapStyles.loadingContainer).toBeDefined();
    expect(groupMapStyles.loadingContainer.flex).toBe(1);

    expect(groupMapStyles.loadingText).toBeDefined();
    expect(groupMapStyles.loadingText.fontSize).toBe(16);

    expect(groupMapStyles.errorContainer).toBeDefined();
    expect(groupMapStyles.errorContainer.flex).toBe(1);

    expect(groupMapStyles.retryButton).toBeDefined();
    expect(groupMapStyles.retryButton.backgroundColor).toBe("#276b80");

    expect(groupMapStyles.buttonContainer).toBeDefined();
    expect(groupMapStyles.buttonContainer.width).toBe("50%");

    expect(groupMapStyles.trackingButtonActive).toBeDefined();
    expect(groupMapStyles.trackingButtonActive.backgroundColor).toBe("#FF6347");

    expect(groupMapStyles.trackingButtonInactive).toBeDefined();
    expect(groupMapStyles.trackingButtonInactive.backgroundColor).toBe(
      "#276b80"
    );

    expect(groupMapStyles.statusBar).toBeDefined();
    expect(groupMapStyles.statusBar.position).toBe("absolute");

    expect(groupMapStyles.mapControls).toBeDefined();
    expect(groupMapStyles.mapControls.position).toBe("absolute");

    expect(groupMapStyles.modalOverlay).toBeDefined();
    expect(groupMapStyles.modalOverlay.flex).toBe(1);

    expect(groupMapStyles.saveButton).toBeDefined();
    expect(groupMapStyles.saveButton.backgroundColor).toBe("#276b80");

    expect(groupMapStyles.cancelButton).toBeDefined();
    expect(groupMapStyles.cancelButton.backgroundColor).toBe("#FF6347");
  });

  it("ProfilePictureSettingsStyles has expected properties", () => {
    expect(profilePictureStyles).toBeDefined();
    expect(typeof profilePictureStyles).toBe("object");

    expect(profilePictureStyles.container).toBeDefined();
    expect(profilePictureStyles.container.flex).toBe(1);
    expect(profilePictureStyles.container.padding).toBe(10);
    expect(profilePictureStyles.container.backgroundColor).toBe("#f5f5f5");

    expect(profilePictureStyles.imageContainer).toBeDefined();
    expect(profilePictureStyles.imageContainer.flex).toBe(1);
    expect(profilePictureStyles.imageContainer.margin).toBe(5);

    expect(profilePictureStyles.image).toBeDefined();
    expect(profilePictureStyles.image.width).toBe("100%");
    expect(profilePictureStyles.image.height).toBe(150);
    expect(profilePictureStyles.image.borderRadius).toBe(10);
  });
});
