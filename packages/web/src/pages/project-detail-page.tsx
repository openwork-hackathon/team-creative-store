import { useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

type Platform = 'facebook' | 'instagram' | 'twitter' | 'linkedin';

interface Creative {
  id: string;
  imageUrl: string;
  platform: Platform;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  industry: string | null;
  createdAt: string;
  updatedAt: string;
  creatives: Creative[];
}

export function ProjectDetailPage() {
  const { projectId } = useParams({ from: '/_authenticated/projects/$projectId' });
  const [intent, setIntent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('facebook');
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await apiClient.get(`/projects/${projectId}`);
      return response.data;
    },
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // TODO: Implement generation API call
      console.log('Generating creative for:', { projectId, intent, platform: selectedPlatform });
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Project</h2>
          <p className="text-gray-600">Failed to load project details. Please try again.</p>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
          <p className="text-gray-600">The requested project could not be found.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
        {project.description && (
          <p className="text-gray-600 mt-2">{project.description}</p>
        )}
        <div className="flex gap-2 mt-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {project.status}
          </span>
          {project.industry && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              {project.industry}
            </span>
          )}
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Project Intent & Brand Assets */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-3">Project Intent</h2>
            <Textarea
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder="Describe what you want to generate..."
              className="min-h-[120px] mb-3"
            />
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Platform</label>
              <div className="grid grid-cols-2 gap-2">
                {(['facebook', 'instagram', 'twitter', 'linkedin'] as Platform[]).map((platform) => (
                  <button
                    key={platform}
                    onClick={() => setSelectedPlatform(platform)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedPlatform === platform
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-3">Brand Assets</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <div className="text-gray-500">
                <span className="material-symbols-outlined text-4xl mb-2">upload_file</span>
                <p className="text-sm">Drop files or click to upload</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Center Column - Generated Candidates */}
        <div className="lg:col-span-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Generated Candidates</h2>
              <span className="text-sm text-gray-500">
                {project.creatives.length} creative{project.creatives.length !== 1 ? 's' : ''}
              </span>
            </div>

            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4" />
                <p className="text-gray-600">Generating creative...</p>
              </div>
            ) : project.creatives.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">image</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No creatives yet</h3>
                <p className="text-gray-500 mb-4">
                  Enter your intent and click Generate to create your first creative
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {project.creatives.map((creative) => (
                  <div key={creative.id} className="group relative">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={creative.imageUrl}
                        alt="Generated creative"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary">
                          <span className="material-symbols-outlined text-sm">download</span>
                        </Button>
                        <Button size="sm" variant="secondary">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">{creative.platform}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(creative.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Style Parameters & Actions */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-3">Style Parameters</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Color Scheme</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Brand Colors</option>
                  <option>Vibrant</option>
                  <option>Pastel</option>
                  <option>Monochrome</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Style</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Modern</option>
                  <option>Minimal</option>
                  <option>Bold</option>
                  <option>Elegant</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mood</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Professional</option>
                  <option>Playful</option>
                  <option>Serious</option>
                  <option>Energetic</option>
                </select>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <Button
              onClick={handleGenerate}
              disabled={!intent.trim() || isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin material-symbols-outlined mr-2">refresh</span>
                  Generating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined mr-2">auto_awesome</span>
                  Generate Creative
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              size="lg"
            >
              <span className="material-symbols-outlined mr-2">batch_prediction</span>
              Batch Generate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
