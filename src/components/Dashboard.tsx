'use client'

import React, { useEffect, useState } from 'react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

type EventStats = {
  id: string
  title: string
  date: string
  capacity: number
  confirmedCount: number
  waitlistedCount: number
  canceledCount: number
  percentageFilled: number
}

type SummaryAnalytics = {
  totalEvents: number
  totalConfirmedBookings: number
  totalWaitlistedBookings: number
  totalCanceledBookings: number
}

type ActivityItem = {
  id: string
  action: string
  note: string
  createdAt: string
  booking: {
    id: string
  }
  event: {
    id: string
    title: string
  }
  user: {
    id: string
    name: string
  }
}

type DashboardData = {
  upcomingEvents: EventStats[]
  summaryAnalytics: SummaryAnalytics
  recentActivity: ActivityItem[]
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch('/api/users/me')
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData.user)
        }
        
        // Fetch dashboard data
        const dashboardResponse = await fetch('/api/dashboard')
        if (!dashboardResponse.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        const data = await dashboardResponse.json()
        setDashboardData(data)
      } catch (err) {
        setError('Error loading dashboard data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div>Loading dashboard data...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!dashboardData) {
    return <div>No dashboard data available</div>
  }

  const { upcomingEvents, summaryAnalytics, recentActivity } = dashboardData

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create_request':
        return 'Booking Requested'
      case 'auto_waitlist':
        return 'Auto Waitlisted'
      case 'auto_confirm':
        return 'Auto Confirmed'
      case 'promote_from_waitlist':
        return 'Promoted from Waitlist'
      case 'cancel_confirmed':
        return 'Booking Canceled'
      default:
        return action
    }
  }

  return (
    <div className="dashboard">
      <h1>Organizer Dashboard</h1>

      <div className="summary-analytics">
        <h2>Summary Analytics</h2>
        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Total Events</h3>
            <div className="analytics-value">{summaryAnalytics.totalEvents}</div>
          </div>
          <div className="analytics-card">
            <h3>Confirmed Bookings</h3>
            <div className="analytics-value">{summaryAnalytics.totalConfirmedBookings}</div>
          </div>
          <div className="analytics-card">
            <h3>Waitlisted Bookings</h3>
            <div className="analytics-value">{summaryAnalytics.totalWaitlistedBookings}</div>
          </div>
          <div className="analytics-card">
            <h3>Canceled Bookings</h3>
            <div className="analytics-value">{summaryAnalytics.totalCanceledBookings}</div>
          </div>
        </div>
      </div>

      <div className="upcoming-events">
        <h2>Upcoming Events</h2>
        <div className="events-grid">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-details">
                <h3>{event.title}</h3>
                <p>Date: {formatDate(event.date)}</p>
                <p>Capacity: {event.capacity}</p>
                <div className="booking-counts">
                  <p>Confirmed: {event.confirmedCount}</p>
                  <p>Waitlisted: {event.waitlistedCount}</p>
                  <p>Canceled: {event.canceledCount}</p>
                </div>
              </div>
              <div className="progress-container">
                <CircularProgressbar
                  value={event.percentageFilled}
                  text={`${Math.round(event.percentageFilled)}%`}
                  styles={buildStyles({
                    textSize: '16px',
                    pathColor: event.percentageFilled >= 100 ? '#ff0000' : '#00a0fc',
                    textColor: '#333',
                    trailColor: '#d6d6d6',
                  })}
                />
                <p className="progress-label">Capacity Filled</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-header">
                <span className="activity-action">{getActionLabel(activity.action)}</span>
                <span className="activity-time">{formatDate(activity.createdAt)}</span>
              </div>
              <p className="activity-event">
                Event: <strong>{activity.event.title}</strong>
              </p>
              <p className="activity-user">
                User: <strong>{activity.user.name}</strong>
              </p>
              {activity.note && <p className="activity-note">{activity.note}</p>}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        h1 {
          margin-bottom: 30px;
          color: #333;
        }

        h2 {
          margin-bottom: 20px;
          color: #444;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .analytics-card {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .analytics-card h3 {
          margin-top: 0;
          color: #666;
          font-size: 14px;
        }

        .analytics-value {
          font-size: 28px;
          font-weight: bold;
          color: #333;
          margin-top: 10px;
        }

        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .event-card {
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
        }

        .event-details {
          flex: 1;
        }

        .event-details h3 {
          margin-top: 0;
          color: #333;
        }

        .booking-counts {
          margin-top: 10px;
          font-size: 14px;
        }

        .booking-counts p {
          margin: 5px 0;
        }

        .progress-container {
          width: 100px;
          margin-left: 20px;
          text-align: center;
        }

        .progress-label {
          margin-top: 10px;
          font-size: 12px;
          color: #666;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .activity-item {
          background-color: white;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .activity-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .activity-action {
          font-weight: bold;
          color: #00a0fc;
        }

        .activity-time {
          color: #888;
          font-size: 12px;
        }

        .activity-event,
        .activity-user {
          margin: 5px 0;
          font-size: 14px;
        }

        .activity-note {
          margin-top: 10px;
          font-style: italic;
          color: #666;
          font-size: 13px;
        }
      `}</style>
    </div>
  )
}

export default Dashboard