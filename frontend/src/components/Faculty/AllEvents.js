import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./Faculty.css";

const AllEvents = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return "Today";
    if (isTomorrow) return "Tomorrow";

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      const id = currentUser._id;
      console.log("Fetching events for faculty ID:", id); // Debug log
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3030/api"
        }/events/faculty/${id}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      console.log("Events API response:", data); // Debug log
      if (response.ok) {
        setEvents(data.events || []);
      } else {
        setError(data.error || "Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser._id) {
      fetchAllEvents();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="all-events-page">
        <div className="page-header">
          <button className="back-btn" onClick={() => window.history.back()}>
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>
          <h1>All Events</h1>
        </div>
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Loading events...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="all-events-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => window.history.back()}>
          <i className="fas fa-arrow-left"></i>
          Back to Dashboard
        </button>
        <h1>All Events ({events.length})</h1>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      <div className="events-grid">
        {events.length > 0 ? (
          events.map((event, index) => (
            <div key={event._id} className="event-card-full">
              <div className="event-card-header">
                <div className="event-type-badge">{event.eventType}</div>
                <div className="event-status">
                  {new Date(event.eventDate) > new Date() ? "Upcoming" : "Past"}
                </div>
              </div>

              <div className="event-card-body">
                <h3 className="event-title">{event.title}</h3>

                {event.description && (
                  <p className="event-description">{event.description}</p>
                )}

                <div className="event-details">
                  <div className="event-detail-item">
                    <i className="fas fa-calendar"></i>
                    <span>{formatEventDate(event.eventDate)}</span>
                  </div>

                  {event.eventTime && (
                    <div className="event-detail-item">
                      <i className="fas fa-clock"></i>
                      <span>{event.eventTime}</span>
                    </div>
                  )}

                  {event.venue && (
                    <div className="event-detail-item">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{event.venue}</span>
                    </div>
                  )}

                  {event.maxParticipants && (
                    <div className="event-detail-item">
                      <i className="fas fa-users"></i>
                      <span>Max {event.maxParticipants} participants</span>
                    </div>
                  )}
                </div>

                {event.registeredParticipants &&
                  event.registeredParticipants.length > 0 && (
                    <div className="event-participants">
                      <h4>
                        Registered Participants (
                        {event.registeredParticipants.length})
                      </h4>
                      <div className="participants-list">
                        {event.registeredParticipants
                          .slice(0, 5)
                          .map((participant, idx) => (
                            <div key={idx} className="participant-item">
                              {participant.name || "Unknown"}
                            </div>
                          ))}
                        {event.registeredParticipants.length > 5 && (
                          <div className="participant-item more">
                            +{event.registeredParticipants.length - 5} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>

              <div className="event-card-footer">
                <div className="event-created">
                  Created {new Date(event.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-events-message">
            <div className="no-events-icon">
              <i className="fas fa-calendar-times"></i>
            </div>
            <h3>No Events Found</h3>
            <p>
              You haven't created any events yet. Go back to the dashboard to
              create your first event!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllEvents;
