'use client';

import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faMagnifyingGlass, faListUl, faTableColumns } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../components/auth/AuthProvider.jsx';
import Card from '../components/common/Card.jsx';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [viewMode, setViewMode] = useState('list');

  const label = useMemo(() => {
    const appointmentProfessions = new Set(['astrology', 'clinic', 'salon', 'gym', 'spa', 'doctor', 'consultant']);
    const bookingProfessions = new Set([
      'restaurant',
      'hotel',
      'resort',
      'hostel',
      'motel',
      'inn',
      'lodge',
      'guesthouse',
      'cafe',
      'café',
    ]);
    if (!user?.profession) return 'Bookings';
    if (appointmentProfessions.has(user.profession) && !bookingProfessions.has(user.profession)) {
      return 'Appointments';
    }
    return 'Bookings';
  }, [user?.profession]);
  const labelLower = label.toLowerCase();

  useEffect(() => {
    const handle = setTimeout(() => {
      fetchAppointments({ reset: true, nextOffset: 0, searchTerm: search, status: filterStatus });
    }, 300);
    return () => clearTimeout(handle);
  }, [search, filterStatus]);

  async function fetchAppointments({ reset = false, nextOffset = 0, searchTerm = '', status = 'all' } = {}) {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const params = new URLSearchParams();
      params.set('limit', '50');
      params.set('offset', String(nextOffset));
      if (searchTerm) params.set('q', searchTerm);
      if (status && status !== 'all') params.set('status', status);
      const response = await fetch(`/api/appointments?${params.toString()}`, { credentials: 'include' });
      const data = await response.json();
      const list = data.data || [];
      const meta = data.meta || {};
      setHasMore(Boolean(meta.hasMore));
      setOffset(meta.nextOffset ?? nextOffset + list.length);
      if (reset) {
        setAppointments(list);
      } else {
        setAppointments((prev) => [...prev, ...list]);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      if (reset) {
        setAppointments([]);
        setHasMore(false);
        setOffset(0);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  async function updateStatus(appointmentId, status) {
    const previous = appointments;
    setUpdatingId(appointmentId);
    setAppointments((prev) =>
      prev.map((appt) => (appt.id === appointmentId ? { ...appt, status } : appt))
    );

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }
      setAppointments((prev) =>
        prev.map((appt) => (appt.id === appointmentId ? data.data : appt))
      );
    } catch (error) {
      console.error('Failed to update appointment:', error);
      setAppointments(previous);
    } finally {
      setUpdatingId(null);
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'booked': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusColumns = useMemo(() => {
    const columns = [
      { key: 'booked', label: 'Booked' },
      { key: 'completed', label: 'Completed' },
      { key: 'cancelled', label: 'Cancelled' },
    ];
    if (filterStatus === 'all') {
      return columns;
    }
    return columns.filter((col) => col.key === filterStatus);
  }, [filterStatus]);

  const appointmentsByStatus = useMemo(() => {
    const grouped = {};
    statusColumns.forEach((col) => {
      grouped[col.key] = [];
    });
    appointments.forEach((appt) => {
      const key = appt.status || 'booked';
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(appt);
    });
    return grouped;
  }, [appointments, statusColumns]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aa-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {labelLower}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faCalendarCheck} className="text-aa-orange" style={{ fontSize: 32 }} />
          {label}
        </h1>

        <div className="flex flex-col lg:flex-row gap-3 mb-4 lg:items-end">
          <div className="flex-1 relative">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3 top-3 text-gray-400"
              style={{ fontSize: 20 }}
            />
            <input
              type="text"
              placeholder={`Search ${labelLower} by name, phone, type...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aa-orange"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto sm:min-w-[180px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aa-orange"
            >
              <option value="all">All Status</option>
              <option value="booked">Booked</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <div className="inline-flex rounded-full border border-gray-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition ${
                  viewMode === 'list'
                    ? 'bg-aa-dark-blue text-white'
                    : 'text-aa-gray hover:text-aa-dark-blue'
                }`}
              >
                <FontAwesomeIcon icon={faListUl} />
                List
              </button>
              <button
                type="button"
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition ${
                  viewMode === 'board'
                    ? 'bg-aa-dark-blue text-white'
                    : 'text-aa-gray hover:text-aa-dark-blue'
                }`}
              >
                <FontAwesomeIcon icon={faTableColumns} />
                Board
              </button>
            </div>
          </div>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FontAwesomeIcon icon={faCalendarCheck} className="mx-auto text-gray-400 mb-2" style={{ fontSize: 48 }} />
          <p className="text-gray-500">No {labelLower} found</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-2">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{appt.user_name || 'Unknown'}</h3>
                  <p className="text-sm text-gray-600">{appt.phone || '—'}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appt.status)}`}>
                    {String(appt.status || 'booked').replace('_', ' ').toUpperCase()}
                  </span>
                  <select
                    value={appt.status || 'booked'}
                    onChange={(e) => updateStatus(appt.id, e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-aa-orange"
                    disabled={updatingId === appt.id}
                    aria-label="Update appointment status"
                  >
                    <option value="booked">Booked</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <p className="text-gray-700 mb-3">{appt.appointment_type || label.slice(0, -1)}</p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="text-gray-500">
                  Date: {appt.start_time ? new Date(appt.start_time).toLocaleDateString() : '—'}
                </span>
                <span className="text-gray-500">
                  Time: {appt.start_time ? new Date(appt.start_time).toLocaleTimeString() : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {statusColumns.map((col) => (
            <Card key={col.key} className="p-4 bg-gray-50/60 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase text-aa-gray font-semibold">{col.label}</p>
                  <p className="text-sm text-aa-gray">{appointmentsByStatus[col.key]?.length || 0} items</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(col.key)}`}>
                  {col.label}
                </span>
              </div>

              <div className="space-y-3">
                {(appointmentsByStatus[col.key] || []).length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 bg-white p-4 text-sm text-aa-gray">
                    No {col.label.toLowerCase()} {labelLower}.
                  </div>
                ) : (
                  appointmentsByStatus[col.key].map((appt) => (
                    <div key={appt.id} className="rounded-xl border border-gray-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-aa-text-dark">{appt.user_name || 'Unknown'}</p>
                          <p className="text-xs text-aa-gray">{appt.phone || '—'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(appt.status)}`}>
                          {String(appt.status || 'booked').replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-3 text-sm text-aa-text-dark">
                        {appt.appointment_type || label.slice(0, -1)}
                      </div>
                      <div className="mt-2 text-xs text-aa-gray">
                        {appt.start_time ? new Date(appt.start_time).toLocaleDateString() : '—'} •{' '}
                        {appt.start_time ? new Date(appt.start_time).toLocaleTimeString() : '—'}
                      </div>
                      <div className="mt-3">
                        <label className="block text-xs font-semibold uppercase text-aa-gray mb-1">
                          Update Status
                        </label>
                        <select
                          value={appt.status || 'booked'}
                          onChange={(e) => updateStatus(appt.id, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-aa-orange"
                          disabled={updatingId === appt.id}
                          aria-label="Update appointment status"
                        >
                          <option value="booked">Booked</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() =>
              fetchAppointments({
                reset: false,
                nextOffset: offset,
                searchTerm: search,
                status: filterStatus,
              })
            }
            disabled={loadingMore}
            className="px-5 py-2 rounded-full border border-aa-orange text-aa-orange font-semibold hover:bg-aa-orange hover:text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingMore ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
