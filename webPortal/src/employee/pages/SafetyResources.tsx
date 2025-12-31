import React, { useState, useMemo } from 'react';
import { Download, FileText, Search } from 'lucide-react';
import { useApp } from '../../supervisor/context/AppContext';
import { Card, CardHeader, CardBody } from '../../supervisor/components/UI/Card';
import { Button } from '../../supervisor/components/UI/Button';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../../supervisor/styles/markdown.css';

// Import markdown files as raw strings
// Note: adjusting paths to point to supervisor content
import generalWorkplaceSafety from '../../supervisor/content/safety/general-workplace-safety.md?raw';
import lotoProcedure from '../../supervisor/content/safety/loto-procedure.md?raw';

const MarkdownMap: Record<string, string> = {
    'general-workplace-safety.md': generalWorkplaceSafety,
    'loto-procedure.md': lotoProcedure,
};

type ResourceTab = 'All' | 'Safety Guideline' | 'SOP';

export const SafetyResources: React.FC = () => {
    const { state } = useApp();
    const [activeTab, setActiveTab] = useState<ResourceTab>('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredResources = useMemo(() => {
        return state.safetyResources.filter(resource => {
            const matchesTab = activeTab === 'All' || resource.type === activeTab;
            const markdownContent = MarkdownMap[resource.markdownFile] || '';
            const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                markdownContent.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesTab && matchesSearch;
        });
    }, [state.safetyResources, activeTab, searchQuery]);

    const handleDownload = (id: string) => {
        alert(`Downloading resource: ${id}`);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">Safety Resources</h1>
                    <p className="text-gray-500 mt-2 max-w-xl">
                        Access official safety guidelines and Standard Operating Procedures (SOPs) for workplace compliance.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search resources..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 bg-gray-100/50 p-1 rounded-xl w-fit border border-gray-200">
                {(['All', 'Safety Guideline', 'SOP'] as ResourceTab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab
                            ? 'bg-white text-primary-700 shadow-sm border border-gray-200'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        {tab === 'All' ? 'All Resources' : tab + 's'}
                    </button>
                ))}
            </div>

            {/* Content List */}
            <div className="space-y-8">
                {filteredResources.length > 0 ? (
                    filteredResources.map((resource) => (
                        <Card key={resource.id} className="overflow-hidden border-t-4 border-t-primary-500 group">
                            <CardHeader className="bg-gray-50/50 py-5">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm text-primary-600 group-hover:scale-105 transition-transform">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-xl font-bold text-gray-800">{resource.title}</h2>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${resource.type === 'SOP'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {resource.type}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                Last updated: {format(resource.lastUpdated, 'MMMM d, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDownload(resource.id)}
                                        className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold"
                                    >
                                        <Download size={16} className="mr-2" />
                                        Download PDF
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardBody className="py-8">
                                <div className="max-w-4xl markdown-body">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {MarkdownMap[resource.markdownFile] || ''}
                                    </ReactMarkdown>
                                </div>
                            </CardBody>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                            <Search size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">No resources found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your search or filters to find what you're looking for.</p>
                        <Button
                            variant="secondary"
                            className="mt-6"
                            onClick={() => { setActiveTab('All'); setSearchQuery(''); }}
                        >
                            Reset all filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
