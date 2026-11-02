import React, { useEffect, useRef, useState } from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";
import { Dialog, DialogClose, DialogContent, DialogFooter } from "@calcom/ui/components/dialog";
import { Icon } from "@calcom/ui/components/icon";

export interface DecoyBookingSuccessCardProps {
  title: string;
  formattedDate: string;
  formattedTime: string;
  endTime: string;
  formattedTimeZone: string;
  hostName: string | null;
  hostEmail: string | null;
  attendeeName: string | null;
  attendeeEmail: string | null;
  location: string | null;
  /** ISO start time of the booking, used to build "Add to calendar" links. */
  startTimeISO?: string | null;
  /** ISO end time of the booking, used to build "Add to calendar" links. */
  endTimeISO?: string | null;
  /** Opens the calendar picker on mount (used for previews). */
  defaultCalendarPickerOpen?: boolean;
}

interface CalendarEventDetails {
  title: string;
  start: Date;
  end: Date;
  location: string | null;
}

const toCompactUtc = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const escapeIcsText = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

// Same URL formats as getCalendarLinks (bookings-single-view), built from the decoy booking's plain data.
function buildCalendarLinks({ title, start, end, location }: CalendarEventDetails) {
  const subject = encodeURIComponent(title);
  const encodedLocation = location ? encodeURIComponent(location) : "";
  const startIso = start.toISOString();
  const endIso = end.toISOString();
  const outlookQuery = `enddt=${endIso}&path=%2Fcalendar%2Faction%2Fcompose&rru=addevent&startdt=${startIso}&subject=${subject}${
    encodedLocation ? `&location=${encodedLocation}` : ""
  }`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cal.com//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${toCompactUtc(start)}-${subject.slice(0, 32)}@cal.com`,
    `DTSTAMP:${toCompactUtc(new Date())}`,
    `DTSTART:${toCompactUtc(start)}`,
    `DTEND:${toCompactUtc(end)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    ...(location ? [`LOCATION:${escapeIcsText(location)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return {
    google: `https://calendar.google.com/calendar/r/eventedit?dates=${toCompactUtc(start)}/${toCompactUtc(
      end
    )}&text=${subject}${encodedLocation ? `&location=${encodedLocation}` : ""}`,
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?${outlookQuery}`,
    office: `https://outlook.office.com/calendar/0/deeplink/compose?${outlookQuery}`,
    ics: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`,
  };
}

const GoogleLogo = () => (
  <svg className="h-4 w-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
  </svg>
);

const OutlookLogo = () => (
  <svg className="h-4 w-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <title>Microsoft Outlook</title>
    <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V10.85l1.24.72h.01q.1.07.18.18.07.12.07.25zm-6-8.25v3h3v-3zm0 4.5v3h3v-3zm0 4.5v1.83l3.05-1.83zm-5.25-9v3h3.75v-3zm0 4.5v3h3.75v-3zm0 4.5v2.03l2.41 1.5 1.34-.8v-2.73zM9 3.75V6h2l.13.01.12.04v-2.3zM5.98 15.98q.9 0 1.6-.3.7-.32 1.19-.86.48-.55.73-1.28.25-.74.25-1.61 0-.83-.25-1.55-.24-.71-.71-1.24t-1.15-.83q-.68-.3-1.55-.3-.92 0-1.64.3-.71.3-1.2.85-.5.54-.75 1.3-.25.74-.25 1.63 0 .85.26 1.56.26.72.74 1.23.48.52 1.17.81.69.3 1.56.3zM7.5 21h12.39L12 16.08V17q0 .41-.3.7-.29.3-.7.3H7.5zm15-.13v-7.24l-5.9 3.54Z" />
  </svg>
);

const OfficeLogo = () => (
  <svg className="h-4 w-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <title>Microsoft Office</title>
    <path d="M21.53 4.306v15.363q0 .807-.472 1.433-.472.627-1.253.85l-6.888 1.974q-.136.037-.29.055-.156.019-.293.019-.396 0-.72-.105-.321-.106-.656-.292l-4.505-2.544q-.248-.137-.391-.366-.143-.23-.143-.515 0-.434.304-.738.304-.305.739-.305h5.831V4.964l-4.38 1.563q-.533.187-.856.658-.322.472-.322 1.03v8.078q0 .496-.248.912-.25.416-.683.651l-2.072 1.13q-.286.148-.571.148-.497 0-.844-.347-.348-.347-.348-.844V6.563q0-.62.33-1.19.328-.571.874-.881L11.07.285q.248-.136.534-.21.285-.075.57-.075.211 0 .38.031.166.031.364.093l6.888 1.899q.384.11.7.329.317.217.547.52.23.305.353.67.125.367.125.764zm-1.588 15.363V4.306q0-.273-.16-.478-.163-.204-.423-.28l-3.388-.93q-.397-.111-.794-.23-.397-.117-.794-.216v19.68l4.976-1.427q.26-.074.422-.28.161-.204.161-.477z" />
  </svg>
);

interface CalendarPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEventDetails;
}

function CalendarPickerDialog({ open, onOpenChange, event }: CalendarPickerDialogProps) {
  const { t } = useLocale();
  const links = buildCalendarLinks(event);
  const fileName = `${event.title.replace(/[^\w\- ]+/g, "").trim() || "event"}.ics`;

  const options: {
    id: string;
    label: string;
    href: string;
    logo: React.ReactNode;
    download?: string;
  }[] = [
    { id: "google", label: "Google Calendar", href: links.google, logo: <GoogleLogo /> },
    { id: "outlook", label: "Outlook.com", href: links.outlook, logo: <OutlookLogo /> },
    { id: "office", label: "Microsoft 365", href: links.office, logo: <OfficeLogo /> },
    {
      id: "apple",
      label: t("apple_calendar_ics"),
      href: links.ics,
      logo: <Icon name="calendar" className="h-4 w-4" />,
      download: fileName,
    },
    {
      id: "ics",
      label: t("other_calendar_ics"),
      href: links.ics,
      logo: <Icon name="download" className="h-4 w-4" />,
      download: fileName,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={t("add_to_calendar")} description={t("add_to_calendar_picker_description")}>
        <ul className="border-subtle divide-subtle divide-y rounded-lg border">
          {options.map((option) => (
            <li key={option.id}>
              <a
                href={option.href}
                data-testid={`add-to-calendar-${option.id}`}
                {...(option.download
                  ? { download: option.download }
                  : { target: "_blank", rel: "noopener noreferrer" })}
                onClick={() => onOpenChange(false)}
                className="text-emphasis hover:bg-cal-muted flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors first:rounded-t-lg last:rounded-b-lg">
                <span className="border-subtle text-default flex h-8 w-8 shrink-0 items-center justify-center rounded-md border">
                  {option.logo}
                </span>
                <span className="grow">{option.label}</span>
                <Icon
                  name={option.download ? "download" : "external-link"}
                  className="text-subtle h-4 w-4"
                />
              </a>
            </li>
          ))}
        </ul>
        <DialogFooter noSticky>
          <DialogClose />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface FireworksProps {
  colors: string[];
  burstCount: number;
  particleCount: number;
  duration: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

/** Decorative canvas fireworks that burst once when mounted (or when its settings change). */
function BookingFireworks({ colors, burstCount, particleCount, duration }: FireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorKey = colors.join(",");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const palette = colorKey.split(",");
    const dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;
    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const particles: Particle[] = [];
    const timers: number[] = [];
    const lifeFrames = Math.max(20, (duration / 1000) * 60);

    const burst = (index: number) => {
      const x = width * (0.15 + Math.random() * 0.7);
      const y = height * (0.08 + Math.random() * 0.3);
      const color = palette[index % palette.length];
      const speed = 2 + Math.random() * 1.5;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.2;
        const v = speed * (0.5 + Math.random() * 0.5);
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v,
          life: 0,
          maxLife: lifeFrames * (0.7 + Math.random() * 0.3),
          color: Math.random() < 0.2 ? palette[(index + 1) % palette.length] : color,
          size: 1.5 + Math.random() * 1.5,
        });
      }
    };

    let frame = 0;
    let running = true;
    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }
        p.vx *= 0.97;
        p.vy = p.vy * 0.97 + 0.05;
        p.x += p.vx;
        p.y += p.vy;
        ctx.globalAlpha = 1 - p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (running) frame = requestAnimationFrame(tick);
    };

    for (let i = 0; i < burstCount; i++) {
      timers.push(window.setTimeout(() => burst(i), 150 + i * 350));
    }
    // Stop the loop once every burst has played out.
    timers.push(
      window.setTimeout(() => {
        running = false;
        ctx.clearRect(0, 0, width, height);
      }, 150 + burstCount * 350 + duration + 200)
    );
    frame = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      timers.forEach((t) => window.clearTimeout(t));
      observer.disconnect();
    };
  }, [colorKey, burstCount, particleCount, duration]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

export function DecoyBookingSuccessCard({
  title,
  formattedDate,
  formattedTime,
  endTime,
  formattedTimeZone,
  hostName,
  hostEmail,
  attendeeName,
  attendeeEmail,
  location,
  startTimeISO,
  endTimeISO,
  defaultCalendarPickerOpen = false,
}: DecoyBookingSuccessCardProps) {
  const { t } = useLocale();
  const [calendarPickerOpen, setCalendarPickerOpen] = useState(defaultCalendarPickerOpen);
  const eventStart = startTimeISO ? new Date(startTimeISO) : null;
  const eventEnd = endTimeISO ? new Date(endTimeISO) : null;
  const calendarEvent =
    eventStart && eventEnd && !Number.isNaN(eventStart.getTime()) && !Number.isNaN(eventEnd.getTime())
      ? { title, start: eventStart, end: eventEnd, location }
      : null;
  const [fireworksEnabled, setFireworksEnabled] = useState(true);
  const [fireworksColor1, setFireworksColor1] = useState("#16a34a");
  const [fireworksColor2, setFireworksColor2] = useState("#3b82f6");
  const [fireworksColor3, setFireworksColor3] = useState("#f59e0b");
  const [fireworksBursts, setFireworksBursts] = useState(5);
  const [fireworksParticles, setFireworksParticles] = useState(36);
  const [fireworksDuration, setFireworksDuration] = useState(1400);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="DecoyBookingSuccessCard-div-4"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.fireworksEnabled === "boolean") setFireworksEnabled(p.fireworksEnabled);
      if (typeof p.fireworksColor1 === "string") setFireworksColor1(p.fireworksColor1);
      if (typeof p.fireworksColor2 === "string") setFireworksColor2(p.fireworksColor2);
      if (typeof p.fireworksColor3 === "string") setFireworksColor3(p.fireworksColor3);
      if (typeof p.fireworksBursts === "number") setFireworksBursts(p.fireworksBursts);
      if (typeof p.fireworksParticles === "number") setFireworksParticles(p.fireworksParticles);
      if (typeof p.fireworksDuration === "number") setFireworksDuration(p.fireworksDuration);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  return (
    <div className="h-screen">
      <main className="mx-auto max-w-3xl">
        <div className="overflow-y-auto">
          <div className="flex items-end justify-center px-4 pb-20 pt-4 text-center sm:flex sm:p-0">
            <div className="main inset-0 my-4 flex flex-col transition-opacity sm:my-0" aria-hidden="true">
              <div
                data-config-id="DecoyBookingSuccessCard-div-4"
                className="bg-default dark:bg-cal-muted border-booker border-booker-width relative inline-block transform overflow-hidden rounded-lg px-8 pb-4 pt-5 text-left align-bottom transition-all sm:my-8 sm:w-full sm:max-w-xl sm:py-8 sm:align-middle"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline">
                {fireworksEnabled && (
                  <BookingFireworks
                    colors={[fireworksColor1, fireworksColor2, fireworksColor3]}
                    burstCount={fireworksBursts}
                    particleCount={fireworksParticles}
                    duration={fireworksDuration}
                  />
                )}
                <div className="relative">
                  <div className="bg-cal-success mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                    <Icon name="check" className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="relative mb-8 mt-6 text-center last:mb-0">
                  <h3 className="text-emphasis text-2xl font-semibold leading-6" id="modal-headline">
                    {t("meeting_is_scheduled")}
                  </h3>

                  <div className="mt-3">
                    <p className="text-default">{t("emailed_you_and_any_other_attendees")}</p>
                  </div>

                  <div className="border-subtle text-default mt-8 grid grid-cols-3 gap-x-4 border-t pt-8 text-left rtl:text-right sm:gap-x-0">
                    <div className="font-medium">{t("what")}</div>
                    <div className="col-span-2 mb-6 last:mb-0">{title}</div>

                    {formattedDate && (
                      <>
                        <div className="font-medium">{t("when")}</div>
                        <div className="col-span-2 mb-6 last:mb-0">
                          {formattedDate}
                          {formattedTime && (
                            <>
                              <br />
                              {formattedTime}
                              {endTime && ` - ${endTime}`}
                              {formattedTimeZone && (
                                <span className="text-bookinglight"> ({formattedTimeZone})</span>
                              )}
                            </>
                          )}
                        </div>
                      </>
                    )}

                    <div className="font-medium">{t("who")}</div>
                    <div className="col-span-2 last:mb-0">
                      {hostName && (
                        <div className="mb-3">
                          <div>
                            <span className="mr-2">{hostName}</span>
                            <Badge variant="blue">{t("Host")}</Badge>
                          </div>
                          {hostEmail && <p className="text-default">{hostEmail}</p>}
                        </div>
                      )}
                      {attendeeName && (
                        <div className="mb-3 last:mb-0">
                          <p>{attendeeName}</p>
                          {attendeeEmail && <p>{attendeeEmail}</p>}
                        </div>
                      )}
                    </div>

                    {location && (
                      <>
                        <div className="mt-3 font-medium">{t("where")}</div>
                        <div className="col-span-2 mt-3">{t("web_conferencing_details_to_follow")}</div>
                      </>
                    )}
                  </div>
                </div>
                {calendarEvent && (
                  <>
                    <hr className="border-subtle relative" />
                    <div className="relative flex justify-center pt-8">
                      <Button
                        color="secondary"
                        StartIcon="calendar"
                        data-testid="add-to-calendar-button"
                        onClick={() => setCalendarPickerOpen(true)}>
                        {t("add_to_calendar")}
                      </Button>
                    </div>
                    <CalendarPickerDialog
                      open={calendarPickerOpen}
                      onOpenChange={setCalendarPickerOpen}
                      event={calendarEvent}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
