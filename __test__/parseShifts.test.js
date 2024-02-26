// parseShifts.test.js

const fs = require("fs");
const { parseShifts } = require("../calculateHours.js"); // Import your function

// Mock fs to prevent filesystem operations
jest.mock("fs", () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

describe("parseShifts", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("calculates regular hours correctly", () => {
    const mockData = JSON.stringify([
      {
        EmployeeID: "123",
        StartTime: "2024-03-10T08:00:00-06:00", // CST
        EndTime: "2024-03-10T17:00:00-05:00", // CDT, simulating DST change
      },
      // Add more shifts as needed for the test
    ]);

    fs.readFileSync.mockReturnValue(mockData);

    parseShifts("dataset_1.json");

    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    const resultData = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
    expect(resultData[0].RegularHours).toBeCloseTo(9); // Expect 9 hours considering DST change
    // Add more assertions as necessary
  });

  // Add more test cases for overtime, crossing weeks, etc.
});
