const fs = require("fs");

function parseShifts(dataset) {
  const data = JSON.parse(fs.readFileSync(dataset, "utf8"));

  const getStartOfWeek = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    return startOfWeek;
  };

  const employeeWorkHours = {};

  data.forEach((shift) => {
    const employeeId = shift.EmployeeID;
    if (!employeeWorkHours[employeeId]) {
      employeeWorkHours[employeeId] = [];
    }
    employeeWorkHours[employeeId].push(shift);
  });

  const result = [];

  Object.keys(employeeWorkHours).forEach((employeeId) => {
    const shifts = employeeWorkHours[employeeId].sort(
      (a, b) => new Date(a.StartTime) - new Date(b.StartTime)
    );

    const weeklyHours = {};

    // Helper function to process shifts
    const processShift = (shift, weekStart) => {
      if (!weeklyHours[weekStart]) {
        weeklyHours[weekStart] = {
          RegularHours: 0,
          OvertimeHours: 0,
          InvalidShifts: [],
          Shifts: [],
        };
      }
      weeklyHours[weekStart].Shifts.push(shift);
    };

    shifts.forEach((shift) => {
      let currentStartTime = new Date(shift.StartTime);
      let currentEndTime = new Date(shift.EndTime);

      // Split the shift if it spans across two weeks
      if (getStartOfWeek(currentEndTime) > getStartOfWeek(currentStartTime)) {
        // Shift crosses into a new week
        const endOfFirstWeek = new Date(currentStartTime);
        endOfFirstWeek.setDate(
          endOfFirstWeek.getDate() + (7 - endOfFirstWeek.getDay())
        );
        endOfFirstWeek.setHours(0, 0, 0, 0); // Start of the next week (Sunday midnight)

        // Split the shift at the end of the first week
        const firstShiftPart = {
          ...shift,
          EndTime: endOfFirstWeek.toISOString(),
        };
        const secondShiftPart = {
          ...shift,
          StartTime: endOfFirstWeek.toISOString(),
        };

        // Process the first part of the shift for the current week
        processShift(
          firstShiftPart,
          getStartOfWeek(currentStartTime).toISOString().split("T")[0]
        );

        // Process the second part of the shift for the next week
        processShift(
          secondShiftPart,
          getStartOfWeek(currentEndTime).toISOString().split("T")[0]
        );
      } else {
        // Entire shift is within the same week
        processShift(
          shift,
          getStartOfWeek(currentStartTime).toISOString().split("T")[0]
        );
      }
    });

    Object.keys(weeklyHours).forEach((weekStart) => {
      let totalRegularHours = 0;
      let totalOvertimeHours = 0;
      let invalidShifts = [];
      let isPreviousInvalid = false;

      weeklyHours[weekStart].Shifts.forEach((shift, index, array) => {
        const currentStartTime = new Date(shift.StartTime);
        const currentEndTime = new Date(shift.EndTime);
        const nextShift = array[index + 1];
        const nextStartTime = nextShift ? new Date(nextShift.StartTime) : null;

        const startOffset = currentStartTime.getTimezoneOffset();
        const endOffset = currentEndTime.getTimezoneOffset();

        if (nextStartTime && currentEndTime > nextStartTime) {
          invalidShifts.push(shift.ShiftID);
          isPreviousInvalid = true;
        } else if (isPreviousInvalid) {
          invalidShifts.push(shift.ShiftID);
          isPreviousInvalid = false;
        } else {
          let duration = (currentEndTime - currentStartTime) / (1000 * 60 * 60);

          // Adjust the duration if there's a timezone offset difference
          if (startOffset !== endOffset) {
            // The shift includes a DST transition
            const diff = (startOffset - endOffset) / 60;
            duration += diff;
          }

          if (totalRegularHours + duration <= 40) {
            totalRegularHours += duration;
          } else {
            if (totalRegularHours < 40) {
              const remainingRegularHours = 40 - totalRegularHours;
              totalRegularHours += remainingRegularHours;
              totalOvertimeHours += duration - remainingRegularHours;
            } else {
              totalOvertimeHours += duration;
            }
          }
        }
      });

      result.push({
        EmployeeID: parseInt(employeeId),
        StartOfWeek: weekStart,
        RegularHours: totalRegularHours,
        OvertimeHours: totalOvertimeHours,
        InvalidShifts: invalidShifts,
      });
    });
  });

  fs.writeFileSync("result.json", JSON.stringify(result, null, 2));
}

parseShifts("dataset_1.json");
