import React, { useState } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import { usePulse } from '../context/PulseContext';
import { UserAvatar } from './UserAvatar';

export const DirectMessagesDrawer: React.FC = () => {
  const {
    isDmDrawerOpen,
    setIsDmDrawerOpen,
    dmThreads,
    users,
    currentUser,
    sendDirectMessage,
  } = usePulse();

  const [selectedParticipantId, setSelectedParticipantId] = useState<string>(
    dmThreads[0]?.participant.id || users[1].id
  );
  const [messageText, setMessageText] = useState('');

  if (!isDmDrawerOpen) return null;

  const activeThread = dmThreads.find(
    (t) => t.participant.id === selectedParticipantId
  );
  const activeParticipant =
    activeThread?.participant ||
    users.find((u) => u.id === selectedParticipantId) ||
    users[1];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendDirectMessage(activeParticipant.id, messageText.trim());
    setMessageText('');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end"
      onClick={() => setIsDmDrawerOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-rose-500" />
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                Direct Studio Messages
              </h3>
              <p className="text-xs text-zinc-400">
                Collaborate & share 9:16 vertical proofs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsDmDrawerOpen(false)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
            aria-label="Close direct messages"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Photographer Thread Selector */}
        <div className="px-4 py-3 border-b border-zinc-900 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {users
            .filter((u) => u.id !== currentUser?.id)
            .map((u) => {
              const isSelected = u.id === activeParticipant.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedParticipantId(u.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-zinc-100 text-zinc-950 border-white font-semibold'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  <UserAvatar
                    initials={u.avatarInitials}
                    color={u.avatarColor}
                    displayName={u.displayName}
                    size="xs"
                  />
                  <span>@{u.handle}</span>
                </button>
              );
            })}
        </div>

        {/* Active Conversation Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex items-center gap-3 mb-4">
            <UserAvatar
              initials={activeParticipant.avatarInitials}
              color={activeParticipant.avatarColor}
              displayName={activeParticipant.displayName}
              size="md"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-100">
                {activeParticipant.displayName} (@{activeParticipant.handle})
              </p>
              <p className="text-[11px] text-zinc-400 truncate">
                {activeParticipant.location} · {activeParticipant.equipment}
              </p>
            </div>
          </div>

          {(!activeThread || activeThread.messages.length === 0) && (
            <div className="py-12 text-center">
              <p className="text-xs text-zinc-400">
                Send a message to @{activeParticipant.handle} about their 9:16 work.
              </p>
            </div>
          )}

          {activeThread?.messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    isMe
                      ? 'bg-rose-600 text-white rounded-br-sm'
                      : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 px-1">
                  {msg.timestampLabel}
                </span>
              </div>
            );
          })}
        </div>

        {/* Message Input Footer */}
        <form
          onSubmit={handleSend}
          className="p-3.5 border-t border-zinc-800 bg-zinc-950 flex items-center gap-2"
        >
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={`Message @${activeParticipant.handle}...`}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            disabled={!messageText.trim()}
            className="min-h-[42px] px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
