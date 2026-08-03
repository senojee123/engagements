import React, { useState } from 'react';
import {
  Vote,
  Plus,
  RotateCcw,
  Play,
  CheckCircle2,
  Tv,
  Users,
  BarChart3,
  Sparkles,
  Zap,
  Check,
  Trash2,
} from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import { useLivePoll } from '../../context/LivePollContext';
import { useToast } from '../../context/ToastContext';

export default function LivePollModerationPanel() {
  const {
    polls,
    activePoll,
    switchActivePoll,
    createPoll,
    resetPoll,
    deletePoll,
    submitVote,
    isPollActive,
    launchLivePoll,
    stopLivePoll,
  } = useLivePoll();

  const toast = useToast();

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newCategory, setNewCategory] = useState('Match Day Halftime Poll');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !option1.trim() || !option2.trim()) {
      toast.error('Please enter a question and at least 2 options.');
      return;
    }

    const opts = [
      { id: 'opt-1', text: option1.trim(), votes: 0, color: 'emerald' },
      { id: 'opt-2', text: option2.trim(), votes: 0, color: 'indigo' },
    ];
    if (option3.trim()) opts.push({ id: 'opt-3', text: option3.trim(), votes: 0, color: 'amber' });
    if (option4.trim()) opts.push({ id: 'opt-4', text: option4.trim(), votes: 0, color: 'rose' });

    await createPoll({
      question: newQuestion.trim(),
      category: newCategory,
      options: opts,
    });

    toast.success('New Live Poll created and set as active!');
    setIsCreatingNew(false);
    setNewQuestion('');
    setOption1('');
    setOption2('');
    setOption3('');
    setOption4('');
  };

  const totalVotes = activePoll?.totalVotes || 0;

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Vote className="w-5 h-5 text-indigo-600" /> Organizer Live Poll Control Desk
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Switch active stadium questions, track votes in real time, or create custom polls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => setIsCreatingNew(!isCreatingNew)}
          >
            {isCreatingNew ? 'Cancel' : 'Create Custom Poll'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={() => {
              if (activePoll) {
                resetPoll(activePoll.id);
                toast.info('Votes reset for current poll.');
              }
            }}
          >
            Reset Vote Counts
          </Button>

          {activePoll && (
            <Button
              variant="outline"
              size="sm"
              icon={Trash2}
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete poll: "${activePoll.question}"?`)) {
                  deletePoll(activePoll.id);
                  toast.success('Poll deleted.');
                }
              }}
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              Delete Poll
            </Button>
          )}

          {isPollActive ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                stopLivePoll();
                toast.info('Stopped Live Poll screen broadcast.');
              }}
              className="bg-amber-500/10 text-amber-600 border-amber-500/30 font-bold"
            >
              Stop Poll Screen
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={Tv}
              onClick={() => {
                launchLivePoll();
                toast.success('Live Poll launched to stadium screen!');
              }}
            >
              Launch Poll to Screen
            </Button>
          )}
        </div>
      </div>

      {/* Form for Creating Custom Poll */}
      {isCreatingNew && (
        <Card className="border-2 border-indigo-500/30 bg-indigo-50/30 shadow-md">
          <CardHeader>
            <CardTitle className="text-base text-indigo-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" /> Create Custom Live Poll Question
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Poll Question Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Which team scored the fastest goal this season?"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Option 1 *
                  </label>
                  <input
                    type="text"
                    placeholder="Option 1 text"
                    value={option1}
                    onChange={(e) => setOption1(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Option 2 *
                  </label>
                  <input
                    type="text"
                    placeholder="Option 2 text"
                    value={option2}
                    onChange={(e) => setOption2(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Option 3 (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Option 3 text"
                    value={option3}
                    onChange={(e) => setOption3(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Option 4 (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Option 4 text"
                    value={option4}
                    onChange={(e) => setOption4(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreatingNew(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" icon={Check}>
                  Save & Publish Poll
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Main Grid: Active Poll Analytics & Poll Question Switcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Live Results Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <Badge variant="indigo" size="sm">
                  Active Question on Jumbotron
                </Badge>
                <CardTitle className="text-lg text-slate-900 mt-1">
                  {activePoll?.question}
                </CardTitle>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 font-semibold block">Total Votes</span>
                <span className="text-2xl font-black text-indigo-600 font-mono">
                  {totalVotes.toLocaleString()}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {activePoll?.options?.map((opt) => {
                const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                return (
                  <div key={opt.id} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">{opt.text}</span>
                      <span className="text-indigo-600 font-mono">{pct}% ({opt.votes} votes)</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Simulate Vote Button */}
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          submitVote(activePoll.id, opt.id);
                          toast.success(`Simulated vote added for ${opt.text}`);
                        }}
                        className="text-[10px] font-semibold text-slate-500 hover:text-indigo-600 underline flex items-center gap-1"
                      >
                        + Simulate Fan Vote
                      </button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Poll Switcher Queue */}
        <div className="space-y-4">
          <Card className="border-slate-200/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" /> Match Day Poll Questions ({polls.length})
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {polls.map((poll) => {
                const isSelected = activePoll?.id === poll.id;
                return (
                  <div
                    key={poll.id}
                    onClick={() => {
                      switchActivePoll(poll.id);
                      toast.success(`Switched active poll to: "${poll.question}"`);
                    }}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {poll.category}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          ● ACTIVE ON SCREEN
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                      {poll.question}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-2 font-mono">
                      <span>{poll.options?.length || 0} Options • {poll.totalVotes || 0} Votes</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete poll: "${poll.question}"?`)) {
                            deletePoll(poll.id);
                            toast.success('Poll deleted.');
                          }
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Poll"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
