import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Save, Send, Image as ImageIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Dropdown from '../../components/ui/Dropdown';
import { useTemplates } from '../../context/TemplateContext';
import { useToast } from '../../context/ToastContext';
import { CATEGORIES } from '../../constants/categories';

export default function CreateTemplate() {
  const navigate = useNavigate();
  const { createCustomTemplate } = useTemplates();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Games');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80');
  const [tags, setTags] = useState('Custom, Interactive, Mobile');
  const [visibility, setVisibility] = useState('Organization');
  const [duration, setDuration] = useState('1-3 mins');
  const [difficulty, setDifficulty] = useState('Easy');

  const submitTemplate = async (status) => {
    if (!title) return;

    try {
      await createCustomTemplate({
        title,
        category,
        description,
        thumbnail,
        tags,
        duration,
        difficulty,
        status,
      });

      if (status === 'Published') {
        toast.success(`Template "${title}" published to the marketplace!`);
      } else {
        toast.success(`Template "${title}" saved as draft!`);
      }
      navigate('/library/my-templates');
    } catch (err) {
      toast.error(err.message || 'Unable to save template.');
    }
  };

  const handleSaveDraft = (e) => {
    e.preventDefault();
    submitTemplate('Draft');
  };

  const handlePublish = (e) => {
    e.preventDefault();
    submitTemplate('Published');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl mx-auto">
      {/* Back Link */}
      <Link
        to="/library"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Library
      </Link>

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Custom Template Builder Spec</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Custom Template</h1>
        <p className="text-sm text-slate-500 mt-1">
          Register metadata for a custom engagement experience. (Interactive Visual Drag-and-Drop Builder will be unlocked in Phase 3).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSaveDraft} className="space-y-5">
            <Input
              label="Template Name"
              placeholder="e.g. Stadium Penalty Shootout"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Dropdown
                label="Category"
                options={CATEGORIES.filter((c) => c !== 'All').map((c) => ({ value: c, label: c }))}
                value={category}
                onChange={(val) => setCategory(val)}
              />

              <Dropdown
                label="Difficulty Level"
                options={[
                  { value: 'Easy', label: 'Easy' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Hard', label: 'Hard' },
                ]}
                value={difficulty}
                onChange={(val) => setDifficulty(val)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the gameplay objectives, audience flow, and reward mechanics..."
                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:outline-none transition-all"
              />
            </div>

            <Input
              label="Thumbnail Image URL"
              icon={ImageIcon}
              placeholder="https://images.unsplash.com/photo-..."
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              helperText="Enter a image preview URL for marketplace listing."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Tags (Comma separated)"
                placeholder="Soccer, Penalty, Halftime"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />

              <Dropdown
                label="Visibility"
                options={[
                  { value: 'Organization', label: 'Organization Only' },
                  { value: 'Public', label: 'Public Marketplace' },
                  { value: 'Private', label: 'Private Only' },
                ]}
                value={visibility}
                onChange={(val) => setVisibility(val)}
              />
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900">
              <span className="font-bold">Phase 3 Preview:</span> Visual game canvas node-editor, sprite uploader, and reward logic triggers will be available when Phase 3 is enabled.
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => navigate('/library')}>
                Cancel
              </Button>
              <Button type="submit" variant="secondary" icon={Save}>
                Save as Draft
              </Button>
              <Button type="button" variant="primary" icon={Send} onClick={handlePublish}>
                Publish Template
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
