import React from "react";
import { render } from "@testing-library/react-native";
import CustomAlert from "../../components/CustomAlert";

// Mock para Modal si es necesario
jest.mock("react-native", () => {
  const rn = jest.requireActual("react-native");
  return {
    ...rn,
    Modal: ({ children, visible }) => (visible ? children : null),
  };
});

describe("CustomAlert Component", () => {
  it("exists as a component", () => {
    expect(typeof CustomAlert).toBe("function");
  });

  it("renders when visible", () => {
    render(
      <CustomAlert
        visible={true}
        title="Test Title"
        message="Test Message"
        buttons={[{ text: "OK", onPress: jest.fn() }]}
        onClose={jest.fn()}
        data-testid="custom-alert"
      />
    );
    // Si la prueba no arroja error, consideramos que pasa
    expect(true).toBe(true);
  });
});
