const leaveType = 'sick';
const totalDays = 15;
const leaveBalance = { sick: 10, casual: 12, vacation: 15 };
const pendingLeaves = [];

const pendingSum = pendingLeaves.reduce((sum, leave) => sum + leave.totalDays, 0);
const validRemainingBalance = leaveBalance[leaveType] - pendingSum;

console.log("validRemainingBalance:", validRemainingBalance);
console.log("totalDays:", totalDays);
console.log("validRemainingBalance < totalDays:", validRemainingBalance < totalDays);

if (validRemainingBalance < totalDays) {
    console.log("BLOCKED: Insufficient sick leave balance.");
} else {
    console.log("ALLOWED: Leave application submitted successfully.");
}
