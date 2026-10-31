"use client";

import { useParams } from "next/navigation";

import dayjs from "@calcom/dayjs";
import { useDecoyBooking } from "@calcom/features/bookings/Booker/components/hooks/useDecoyBooking";
import { getCalendarLinks } from "@calcom/features/bookings/lib/getCalendarLinks";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { DecoyBookingSuccessCard } from "~/bookings/components/DecoyBookingSuccessCard";

export default function BookingSuccessful() {
  const params = useParams();
  const { t } = useLocale();

  const uid = params?.uid as string;
  const bookingData = useDecoyBooking(uid);

  if (!bookingData) {
    return null;
  }

  const { booking } = bookingData;

  // Format the data for the BookingSuccessCard
  const startTime = booking.startTime ? dayjs(booking.startTime) : null;
  const endTime = booking.endTime ? dayjs(booking.endTime) : null;
  const timeZone = booking.booker?.timeZone || booking.host?.timeZone || dayjs.tz.guess();

  const formattedDate = startTime ? startTime.tz(timeZone).format("dddd, MMMM D, YYYY") : "";
  const formattedTime = startTime ? startTime.tz(timeZone).format("h:mm A") : "";
  const formattedEndTime = endTime ? endTime.tz(timeZone).format("h:mm A") : "";
  const formattedTimeZone = timeZone;

  const hostName = booking.host?.name || null;
  const hostEmail = null; // Email not stored for spam decoy bookings
  const attendeeName = booking.booker?.name || null;
  const attendeeEmail = booking.booker?.email || null;
  const title = booking.title || "Booking";

  const calendarLinks =
    startTime && endTime
      ? getCalendarLinks({
          booking: {
            startTime: startTime.toDate(),
            endTime: endTime.toDate(),
            location: booking.location || null,
            title,
            responses: { name: attendeeName ?? "" },
            metadata: null,
          },
          eventType: {
            recurringEvent: null,
            eventName: title,
            isDynamic: false,
            length: endTime.diff(startTime, "minutes"),
            users: [{ name: hostName }],
            title,
          },
          t,
        })
      : undefined;

  return (
    <DecoyBookingSuccessCard
      title={title}
      formattedDate={formattedDate}
      formattedTime={formattedTime}
      endTime={formattedEndTime}
      formattedTimeZone={formattedTimeZone}
      hostName={hostName}
      hostEmail={hostEmail}
      attendeeName={attendeeName}
      attendeeEmail={attendeeEmail}
      location={booking.location || null}
      calendarLinks={calendarLinks}
    />
  );
}
