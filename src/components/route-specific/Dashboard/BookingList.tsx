import { useState, useEffect } from "react";

type ReturnedBookingsType = {
  _id: string;
  roomId: string;
  userId: string;
  roomType: "Workshop" | "Conference";
  username: string;
  startTime: Date;
  endTime: Date;
};

type BookingsListProps = {
  refreshKey: number;
  currentUser: string;
};

{/*Fixa Redis, IO Socket samt winston logs där det behövdes sedan 1 test med jest kanske sedan börjar göra README och presentation sedan lektionsuppgifter */}

const BookingsList = ({ refreshKey, currentUser }: BookingsListProps) => {
    console.log(currentUser)
  const [bookings, setBookings] = useState<ReturnedBookingsType[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchBookings = async (): Promise<void> => {
      try {
        const res = await fetch("http://localhost:3000/api/bookings", {
          method: "GET",
          signal,
          credentials: "include",
        });

        if (!res.ok) {
          setErrorMsg("Could not fetch bookings");
          setBookings([]);
          return;
        }

        const data = await res.json();

        if (data.success) {
          const bookingsWithDates: ReturnedBookingsType[] =
            Array.isArray(data.bookings) ? data.bookings: [];

          setBookings(bookingsWithDates);
          setErrorMsg("");
        } else {
          setBookings([]);
          setErrorMsg(data.error ?? "Could not fetch bookings");
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setErrorMsg("Server error fetching bookings");
        setBookings([]);
      }
    };

    fetchBookings();
    return () => controller.abort();
  }, [refreshKey]);

  const handleDeleteBooking = async (bookingId: string): Promise<void> => {
    if (!bookingId) return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/bookings/${bookingId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        setErrorMsg("Could not delete booking");
        return;
      }

      const data = await res.json();

      if (data.success) {
        setBookings(prev => prev.filter(b => b._id !== bookingId));
        setSuccessMsg(data.message);
        setErrorMsg("");
        setTimeout(() => setSuccessMsg(""), 1000);
      } else {
        setErrorMsg(data.error ?? "Delete failed");
      }
    } catch {
      setErrorMsg("Server Error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
  {!errorMsg && bookings.length > 0 && (
    <ul className="flex flex-col items-center justify-center w-full divide-y divide-gray-300 dark:divide-gray-700">
      {bookings.map((booking) => (
        <li
          key={booking._id}
          className="flex flex-col md:flex-row items-start md:items-center justify-between w-full p-4 gap-2 md:gap-4"
        >
          {/* Rad 1 på små skärmar: Type + By */}
          <div className="flex flex-row w-full md:w-1/2 gap-2">
            <p className="text-letter dark:text-letter-dark text-xs sm:text-sm md:text-base">
              Type: <span className="font-semibold">{booking.roomType}</span>
            </p>
            <p className="text-letter dark:text-letter-dark text-xs sm:text-sm md:text-base">
              By: <span className="font-semibold">{booking.username}</span>
            </p>
          </div>

          {/* Rad 2 på små skärmar: Start + End + Delete */}
          <div className="flex flex-row justify-between items-center w-full md:w-1/2 gap-2 mt-2 md:mt-0">
            <p className="text-letter dark:text-letter-dark text-xs sm:text-sm md:text-base">
              Start:{" "}
              <span className="font-semibold">
                {new Date(booking.startTime)
                  .toLocaleString("sv-SE", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                  .replace(",", "")}
              </span>
            </p>

            <p className="text-letter dark:text-letter-dark text-xs sm:text-sm md:text-base">
              End:{" "}
              <span className="font-semibold">
                {new Date(booking.endTime)
                  .toLocaleString("sv-SE", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                  .replace(",", "")}
              </span>
            </p>

            {currentUser === booking.username && (
              <button
                onClick={() => handleDeleteBooking(booking._id)}
                type="button"
                aria-label="Delete booking"
                className="text-error text-xs sm:text-sm md:text-base p-2 border border-black dark:border-white rounded-md cursor-pointer"
              >
                Delete
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )}

  {!errorMsg && bookings.length === 0 && (
    <p className="text-letter dark:text-letter-dark font-semibold text-xs md:text-sm">
      No Bookings Created
    </p>
  )}

  {errorMsg && bookings.length < 1 && (
    <p className="text-error text-xs md:text-sm">{errorMsg}</p>
  )}

  {successMsg && (
    <p className="text-success text-xs md:text-sm">{successMsg}</p>
  )}
</div>
  );
};

export default BookingsList;