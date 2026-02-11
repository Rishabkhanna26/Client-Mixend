'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

export default function InboxPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => {
      fetchMessages({ reset: true, nextOffset: 0, searchTerm: search });
    }, 300);
    return () => clearTimeout(handle);
  }, [search]);

  async function fetchMessages({ reset = false, nextOffset = 0, searchTerm = '' } = {}) {
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
      const response = await fetch(`/api/messages?${params.toString()}`);
      const data = await response.json();
      const list = data.data || [];
      const meta = data.meta || {};
      setHasMore(Boolean(meta.hasMore));
      setOffset(meta.nextOffset ?? nextOffset + list.length);
      if (reset) {
        setMessages(list);
      } else {
        setMessages((prev) => [...prev, ...list]);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      if (reset) {
        setMessages([]);
        setHasMore(false);
        setOffset(0);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  const filteredMessages = messages;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aa-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faEnvelope} className="text-aa-orange" style={{ fontSize: 32 }} />
          Inbox
        </h1>
        
        <div className="relative">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-3 top-3 text-gray-400"
            style={{ fontSize: 20 }}
          />
          <input
            type="text"
            placeholder="Search by name, phone, or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aa-orange"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FontAwesomeIcon icon={faEnvelope} className="mx-auto text-gray-400 mb-2" style={{ fontSize: 48 }} />
            <p className="text-gray-500">No messages found</p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{msg.user_name} ({msg.phone})</h3>
                  <p className="text-sm text-gray-600 mt-1">{msg.message_text}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    msg.message_type === 'incoming'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {msg.message_type}
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {new Date(msg.created_at).toLocaleDateString()} {new Date(msg.created_at).toLocaleTimeString()}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  msg.status === 'read' ? 'bg-gray-100 text-gray-700' : 'bg-aa-orange/10 text-aa-orange'
                }`}>
                  {msg.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => fetchMessages({ reset: false, nextOffset: offset, searchTerm: search })}
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
