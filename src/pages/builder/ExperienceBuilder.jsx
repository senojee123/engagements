import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Save, Code, Share2, Layers } from 'lucide-react';
import Button from '../../components/ui/Button';
import LeftPanelNav from '../../components/builder/LeftPanelNav';
import CenterPreviewCanvas from '../../components/builder/CenterPreviewCanvas';
import RightPropertiesPanel from '../../components/builder/RightPropertiesPanel';
import JsonExportModal from '../../components/builder/JsonExportModal';
import Spinner from '../../components/ui/Spinner';
import { BuilderProvider, useBuilder } from '../../context/BuilderContext';
import { useToast } from '../../context/ToastContext';

function BuilderStudioInner() {
  const [activeTab, setActiveTab] = useState('brand');
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const toast = useToast();
  const { isLoading } = useBuilder();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-slate-950">
        <Spinner size="lg" color="white" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-white overflow-hidden animate-in fade-in">
      {/* Studio Header Bar */}
      <div className="h-16 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            to="/library"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-extrabold text-white text-base shadow-md">
              FF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-white text-base tracking-tight">
                  Experience Builder Studio
                </h1>
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 uppercase tracking-wider">
                  No-Code Visual Editor
                </span>
              </div>
              <p className="text-xs text-slate-400">Product Rush • Live Brand Transformation</p>
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={Code}
            onClick={() => setIsJsonModalOpen(true)}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
          >
            Export JSON
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Save}
            onClick={() => toast.success('Template configuration saved to cloud!')}
          >
            Save Template
          </Button>
        </div>
      </div>

      {/* Main 3-Panel Studio Layout */}
      <div className="flex-1 flex overflow-hidden">
        <LeftPanelNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenJsonModal={() => setIsJsonModalOpen(true)}
        />
        <CenterPreviewCanvas />
        <RightPropertiesPanel activeTab={activeTab} />
      </div>

      {/* JSON Export Modal */}
      <JsonExportModal isOpen={isJsonModalOpen} onClose={() => setIsJsonModalOpen(false)} />
    </div>
  );
}

export default function ExperienceBuilder() {
  return (
    <BuilderProvider>
      <BuilderStudioInner />
    </BuilderProvider>
  );
}
