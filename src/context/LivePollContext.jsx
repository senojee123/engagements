import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchPolls, fetchActivePoll, submitVoteApi, createPollApi, activatePollApi, resetPollApi } from '../lib/api';
import { DEFAULT_BRAND_KITS } from '../data/brandEngineData';

const LivePollContext = createContext(null);

const INITIAL_FALLBACK_POLL = {
  id: 'poll-mvp',
  question: "Who will score the winning goal in tonight's final half?",
  category: 'Match Day Halftime Poll',
  options: [
    { id: 'opt-1', text: 'Alex Morgan (Apex)', votes: 1420, color: 'emerald' },
    { id: 'opt-2', text: 'Jordan Taylor (Strikers)', votes: 980, color: 'indigo' },
    { id: 'opt-3', text: 'Sarah Jenkins (United)', votes: 410, color: 'amber' },
  ],
  totalVotes: 2810,
  isActive: true,
  brandId: 'brand-cocacola',
  createdAt: Date.now() / 1000,
};

export const LivePollProvider = ({ children }) => {
  const [polls, setPolls] = useState([INITIAL_FALLBACK_POLL]);
  const [activePoll, setActivePoll] = useState(INITIAL_FALLBACK_POLL);
  const [isPollActive, setIsPollActiveState] = useState(() => {
    const saved = localStorage.getItem('fanforge_live_poll_active');
    return saved ? JSON.parse(saved) : false;
  });

  const [activeBrand, setActiveBrandState] = useState(() => {
    const saved = localStorage.getItem('fanforge_active_brand');
    return saved ? JSON.parse(saved) : DEFAULT_BRAND_KITS[0];
  });

  const setActiveBrand = (brand) => {
    setActiveBrandState(brand);
    localStorage.setItem('fanforge_active_brand', JSON.stringify(brand));
    try {
      const channel = new BroadcastChannel('fanforge_poll_sync');
      channel.postMessage({ type: 'BRAND_UPDATED', payload: brand });
      channel.close();
    } catch (e) {}
  };

  // Initial Fetch from backend
  useEffect(() => {
    let isCancelled = false;
    fetchActivePoll()
      .then((data) => {
        if (!isCancelled && data) {
          setActivePoll(data);
        }
      })
      .catch(() => {});

    fetchPolls()
      .then((data) => {
        if (!isCancelled && Array.isArray(data) && data.length > 0) {
          setPolls(data);
        }
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, []);

  // WebSocket & BroadcastChannel Real-Time Listener
  useEffect(() => {
    const wsUrl = (import.meta.env.VITE_API_URL || 'https://engagements-production.up.railway.app').replace(/^http/, 'ws') + '/ws';

    let socket = null;

    try {
      socket = new WebSocket(wsUrl);
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'POLL_VOTED' && message.poll) {
            setActivePoll(message.poll);
            setPolls((prev) => prev.map((p) => (p.id === message.poll.id ? message.poll : p)));
          } else if (message.type === 'POLL_STATUS_UPDATED') {
            if (message.poll) {
              setActivePoll(message.poll);
            }
            if (message.activeMode) {
              setIsPollActiveState(message.activeMode === 'live-poll');
            }
          }
        } catch (e) {}
      };
    } catch (e) {}

    // BroadcastChannel sync across local browser tabs
    let channel = null;
    try {
      channel = new BroadcastChannel('fanforge_poll_sync');
      channel.onmessage = (event) => {
        const { type, poll, isActive } = event.data;
        if (type === 'POLL_VOTED' && poll) {
          setActivePoll(poll);
          setPolls((prev) => prev.map((p) => (p.id === poll.id ? poll : p)));
        } else if (type === 'POLL_SWITCHED' && poll) {
          setActivePoll(poll);
        } else if (type === 'POLL_STATUS_TOGGLED') {
          setIsPollActiveState(isActive);
        }
      };
    } catch (e) {}

    return () => {
      if (socket) socket.close();
      if (channel) channel.close();
    };
  }, []);

  const broadcastLocally = (payload) => {
    try {
      const channel = new BroadcastChannel('fanforge_poll_sync');
      channel.postMessage(payload);
      channel.close();
    } catch (e) {}
  };

  const submitVote = async (pollId, optionId) => {
    // Optimistic local state update
    setActivePoll((prev) => {
      if (!prev || prev.id !== pollId) return prev;
      const updatedOptions = prev.options.map((opt) =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      );
      const updated = {
        ...prev,
        options: updatedOptions,
        totalVotes: prev.totalVotes + 1,
      };
      broadcastLocally({ type: 'POLL_VOTED', poll: updated });
      return updated;
    });

    setPolls((prev) =>
      prev.map((p) => {
        if (p.id !== pollId) return p;
        const updatedOptions = p.options.map((opt) =>
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        );
        return { ...p, options: updatedOptions, totalVotes: p.totalVotes + 1 };
      })
    );

    try {
      const res = await submitVoteApi(pollId, optionId);
      if (res) {
        setActivePoll(res);
      }
    } catch (err) {
      console.warn('Backend vote submit failed, using optimistic state:', err);
    }
  };

  const switchActivePoll = async (pollId) => {
    const target = polls.find((p) => p.id === pollId);
    if (target) {
      setActivePoll(target);
      broadcastLocally({ type: 'POLL_SWITCHED', poll: target });
    }
    try {
      const res = await activatePollApi(pollId);
      if (res) {
        setActivePoll(res);
      }
    } catch (e) {}
  };

  const createPoll = async (newPollData) => {
    try {
      const created = await createPollApi(newPollData);
      setPolls((prev) => [created, ...prev]);
      setActivePoll(created);
      return created;
    } catch (err) {
      // Local fallback creation
      const fallback = {
        id: `poll-${Date.now()}`,
        question: newPollData.question,
        category: newPollData.category || 'Custom Stadium Poll',
        options: newPollData.options.map((opt, idx) => ({
          id: opt.id || `opt-${idx + 1}`,
          text: opt.text || opt,
          votes: 0,
          color: opt.color || ['emerald', 'indigo', 'amber', 'rose', 'cyan'][idx % 5],
        })),
        totalVotes: 0,
        isActive: true,
        brandId: activeBrand.id,
        createdAt: Date.now() / 1000,
      };
      setPolls((prev) => [fallback, ...prev]);
      setActivePoll(fallback);
      return fallback;
    }
  };

  const resetPoll = async (pollId) => {
    setActivePoll((prev) => {
      if (!prev || prev.id !== pollId) return prev;
      const resetOpts = prev.options.map((opt) => ({ ...opt, votes: 0 }));
      const updated = { ...prev, options: resetOpts, totalVotes: 0 };
      broadcastLocally({ type: 'POLL_VOTED', poll: updated });
      return updated;
    });

    setPolls((prev) =>
      prev.map((p) => {
        if (p.id !== pollId) return p;
        const resetOpts = p.options.map((opt) => ({ ...opt, votes: 0 }));
        return { ...p, options: resetOpts, totalVotes: 0 };
      })
    );

    try {
      await resetPollApi(pollId);
    } catch (e) {}
  };

  const launchLivePoll = () => {
    setIsPollActiveState(true);
    localStorage.setItem('fanforge_live_poll_active', JSON.stringify(true));
    broadcastLocally({ type: 'POLL_STATUS_TOGGLED', isActive: true });
  };

  const stopLivePoll = () => {
    setIsPollActiveState(false);
    localStorage.setItem('fanforge_live_poll_active', JSON.stringify(false));
    broadcastLocally({ type: 'POLL_STATUS_TOGGLED', isActive: false });
  };

  return (
    <LivePollContext.Provider
      value={{
        polls,
        activePoll,
        isPollActive,
        activeBrand,
        setActiveBrand,
        submitVote,
        switchActivePoll,
        createPoll,
        resetPoll,
        launchLivePoll,
        stopLivePoll,
      }}
    >
      {children}
    </LivePollContext.Provider>
  );
};

export const useLivePoll = () => {
  const context = useContext(LivePollContext);
  if (!context) {
    return {
      polls: [INITIAL_FALLBACK_POLL],
      activePoll: INITIAL_FALLBACK_POLL,
      isPollActive: false,
      activeBrand: DEFAULT_BRAND_KITS[0],
      setActiveBrand: () => {},
      setIsPollActive: () => {},
      launchLivePoll: () => {},
      stopLivePoll: () => {},
      submitVote: async () => {},
      createPoll: async () => {},
      resetPoll: async () => {},
    };
  }
  return context;
};
