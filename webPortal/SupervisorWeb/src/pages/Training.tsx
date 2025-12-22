import React, { useState } from 'react';
import { Play, Download, Calendar, Search, BookOpen, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, CardBody } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { format } from 'date-fns';

export const Training: React.FC = () => {
    const { state } = useApp();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredMaterials = state.trainingMaterials.filter(material =>
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAction = (id: string, action: 'view' | 'download') => {
        alert(`${action === 'view' ? 'Opening' : 'Downloading'} training material: ${id}`);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">Training & Education</h1>
                    <p className="text-gray-500 mt-2 max-w-xl">
                        Enhance your safety knowledge and skills with our curated training modules and certifications.
                    </p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search materials..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredMaterials.length > 0 ? (
                    filteredMaterials.map((material) => (
                        <Card key={material.id} className="group hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full rounded-2xl overflow-hidden translate-y-0 hover:-translate-y-1">
                            <div className="relative aspect-video overflow-hidden bg-gray-100 italic">
                                {material.thumbnail ? (
                                    <img
                                        src={material.thumbnail}
                                        alt={material.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <BookOpen size={48} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                <div className="absolute bottom-4 left-4">
                                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                                        <Clock size={12} className="text-primary-600" />
                                        <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Video Course</span>
                                    </div>
                                </div>
                            </div>

                            <CardHeader className="py-5 px-6 border-none">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">{material.title}</h3>
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                    <Calendar size={14} />
                                    <span>Uploaded on {format(material.uploadedDate, 'MMM d, yyyy')}</span>
                                </div>
                            </CardHeader>

                            <CardBody className="px-6 py-0 flex-1">
                                <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                                    {material.description}
                                </p>
                            </CardBody>

                            <div className="p-6 pt-8 mt-auto flex items-center gap-3">
                                <Button
                                    className="flex-1 rounded-xl shadow-md hover:shadow-primary-500/20"
                                    onClick={() => handleAction(material.id, 'view')}
                                >
                                    <Play size={16} className="mr-2 fill-current" />
                                    Start Training
                                </Button>
                                <Button
                                    variant="outline"
                                    className="aspect-square p-0 w-11 h-11 border-gray-200 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl"
                                    onClick={() => handleAction(material.id, 'download')}
                                    title="Download Material"
                                >
                                    <Download size={18} />
                                </Button>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-800">No training materials found</h3>
                        <p className="text-gray-500">Try a different search term or check back later for new content.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
