import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import GroupItem from "../../components/GroupItem";

// Mock navigation
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe("GroupItem Component", () => {
  const mockGroup = {
    id: "123",
    nameGroup: "Test Group",
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders group information correctly", () => {
    const { getByText } = render(<GroupItem group={mockGroup} />);
    expect(getByText("Test Group")).toBeTruthy();
    expect(getByText("Ver Grupo")).toBeTruthy();
  });

  it("navigates to group detail screen when pressed", () => {
    const { getByText } = render(<GroupItem group={mockGroup} />);
    fireEvent.press(getByText("Ver Grupo"));

    expect(mockNavigate).toHaveBeenCalledWith("GroupDetailScreen", {
      groupId: mockGroup.id,
    });
  });
});
