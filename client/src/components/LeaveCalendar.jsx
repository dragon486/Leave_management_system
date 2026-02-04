import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import "./LeaveCalendar.css";

function LeaveCalendar() {
  const leaveEvents = [
    {
      title: "Adel - Sick Leave",
      start: "2026-02-02",
      end: "2026-02-03",
    },
    {
      title: "Sick Leave",
      start: "2026-02-05",
      className: "leave-sick"
    },
  ];

  return (
    <div className="calendar-wrapper">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={leaveEvents}
        height="auto"
      />
    </div>
  );
}

export default LeaveCalendar;
