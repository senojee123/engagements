import React from 'react';
import {
  Flame,
  Tv,
  RotateCcw,
  Sparkles,
  Zap,
  TrendingUp,
  Smile,
  Trash2,
} from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import { useReactionWall } from '../../context/ReactionWallContext';
import { useToast } from '../../context/ToastContext';

export default function ReactionWallModerationPanel() {
  const {
    activeReactions,
    totalCount,
    isReactionWallActive,
    emitReaction,
    launchReactionWall,
    stopReactionWall,
    clearReactions,
  } = useReactionWall();

  const toast = useToast();

  const sampleEmojis = ['🔥', '👏', '🚀', '❤️', '⚡', '🎉', '🏆', '⚽'];

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" /> Reaction Wall Organizer Desk
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Trigger test emoji bursts, monitor fan reaction velocity, or launch the display screen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={Trash2}
            onClick={() => {
              clearReactions();
              toast.info('Cleared floating reactions on display screen.');
            }}
          >
            Clear Screen Particles
          </Button>

          {isReactionWallActive ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                stopReactionWall();
                toast.info('Stopped Reaction Wall display screen.');
              }}
              className="bg-amber-500/10 text-amber-600 border-amber-500/30 font-bold"
            >
              Stop Reaction Screen
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={Tv}
              onClick={() => {
                launchReactionWall();
                toast.success('Live Reaction Wall launched to stadium screen!');
              }}
            >
              Launch Reaction Wall to Screen
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Trigger Controls & Live Reaction Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Fast Reaction Emitter Buttons */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200/80 shadow-xs">
            <CardHeader>
              <Badge variant="indigo" size="sm">
                Instant Emoji Emitter Test
              </Badge>
              <CardTitle className="text-lg text-slate-900 mt-1">
                Trigger Live Fan Reaction Burst
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <p className="text-xs text-slate-500">
                Tap any emoji button below to instantly burst particles across connected venue screens over WebSockets.
              </p>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {sampleEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      emitReaction(emoji, 'Organizer Control Desk');
                      toast.success(`Emitted ${emoji} reaction to screen!`);
                    }}
                    className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-3xl shadow-2xs hover:scale-105 active:scale-95 transition-all text-center"
                    title={`Emit ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs font-semibold text-amber-900">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" /> Active Screen Particles: <span className="font-mono font-black text-amber-700">{activeReactions.length}</span>
                </span>
                <span className="font-mono font-bold text-amber-800">Total Stream Count: {totalCount.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Live Stream History */}
        <div className="space-y-4">
          <Card className="border-slate-200/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" /> Recent Fan Reactions Feed
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {activeReactions.length > 0 ? (
                activeReactions.slice(-10).reverse().map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{item.emoji}</span>
                      <span className="font-extrabold text-slate-800">{item.fanName}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Just now</span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 font-mono">
                  No active emojis floating. Tap buttons to emit!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
