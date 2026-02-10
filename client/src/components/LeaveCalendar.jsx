import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import "./LeaveCalendar.css";

function LeaveCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const { data } = await axios.get("/leaves/my-leaves");
        const formattedEvents = data.leaves.map((leave) => ({
          title: `${leave.leaveType.toUpperCase()} - ${leave.status}`,
          start: leave.startDate,
          end: leave.endDate,
          className: `leave-${leave.status}`,
          extendedProps: { ...leave }
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error("Error fetching leaves for calendar:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="calendar-wrapper bg-[#0f0f0f] p-6 rounded-2xl border border-white/5">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">My Leave Calendar</h2>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span> Pending
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span> Approved
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span> Rejected
          </div>
        </div>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
        displayEventTime={false}
        displayEventEnd={false}
        eventContent={(arg) => {
          const formatTime = (date) => {
            if (!date) return '';
            return date.toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }).toLowerCase().replace(' ', '');
          };

          return (
            <div className="flex items-center gap-1.5 px-1 py-0.5 overflow-hidden w-full h-full">
              {arg.isStart && (
                <span className="text-[9px] font-bold opacity-75 shrink-0 bg-black/20 px-1 rounded">
                  {formatTime(arg.event.start)}
                </span>
              )}
              <span className="truncate font-semibold text-[10px] tracking-tight">
                {arg.event.title}
              </span>
              {arg.isEnd && (
                <span className="text-[9px] font-bold opacity-75 shrink-0 ml-auto bg-black/20 px-1 rounded">
                  {formatTime(arg.event.end)}
                </span>
              )}
            </div>
          );
        }}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        }}
      />
    </div>
  );
}

export default LeaveCalendar;
