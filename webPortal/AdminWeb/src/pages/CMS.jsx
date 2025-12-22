import React, { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    FileText,
    Eye,
    Edit3,
    Trash2,
    Archive
} from 'lucide-react';
import { cmsContent, contentTypes } from '../data/mockData';

const CMS = () => {
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [newContent, setNewContent] = useState({
        title: '',
        type: contentTypes[1], // Default to first actual type
        status: 'Draft',
        content: ''
    });

    const filteredContent = cmsContent.filter(item => {
        const matchesType = filter === 'All' || item.type === filter;
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesSearch;
    });

    const getStatusColor = (status) => {
        const baseStyle = { padding: '0.25rem 0.5rem', borderRadius: '0', fontSize: '0.75rem', fontWeight: 600 };
        switch (status) {
            case 'Published': return { ...baseStyle, backgroundColor: '#dcfce7', color: '#15803d' };
            case 'Draft': return { ...baseStyle, backgroundColor: '#f1f5f9', color: '#334155' };
            case 'Archived': return { ...baseStyle, backgroundColor: '#ffedd5', color: '#c2410c' };
            default: return { ...baseStyle, backgroundColor: '#f1f5f9', color: '#334155' };
        }
    };

    const handleCreate = (e) => {
        e.preventDefault();
        alert('Content created successfully! (Mock Action)');
        setIsCreating(false);
        setNewContent({ title: '', type: contentTypes[1], status: 'Draft', content: '' });
    };

    return (
        <div className="space-y-6 relative">

            {/* Create Content Modal Overlay */}
            {isCreating && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50
                }}>
                    <div className="bg-white p-6 w-full max-w-lg shadow-xl" style={{ borderRadius: '0.5rem' }}>
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-xl font-bold text-slate-800">Create New Content</h2>
                            <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field w-full"
                                    placeholder="Enter content title"
                                    value={newContent.title}
                                    onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                    <select
                                        className="input-field w-full"
                                        value={newContent.type}
                                        onChange={(e) => setNewContent({ ...newContent, type: e.target.value })}
                                    >
                                        {contentTypes.filter(t => t !== 'All').map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select
                                        className="input-field w-full"
                                        value={newContent.status}
                                        onChange={(e) => setNewContent({ ...newContent, status: e.target.value })}
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Published">Published</option>
                                        <option value="Archived">Archived</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Content / Description</label>
                                <textarea
                                    className="input-field w-full h-32 resize-none"
                                    placeholder="Enter content details..."
                                    value={newContent.content}
                                    onChange={(e) => setNewContent({ ...newContent, content: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="btn btn-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Create Content
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* Filters */}
                <div className="flex space-x-2" style={{ overflowX: 'auto', paddingBottom: '0.25rem', width: '100%' }}>
                    {contentTypes.slice(0, 4).map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '0',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                whiteSpace: 'nowrap',
                                transition: 'background-color 0.2s',
                                backgroundColor: filter === type ? '#1e293b' : 'white', // slate-800
                                color: filter === type ? 'white' : '#475569', // slate-600
                                border: filter === type ? 'none' : '1px solid #e2e8f0',
                                cursor: 'pointer'
                            }}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <button
                    className="btn btn-primary"
                    onClick={() => setIsCreating(true)}
                >
                    <Plus size={16} />
                    <span>Create New</span>
                </button>
            </div>

            {/* Search Bar */}
            <div style={{ position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                    type="text"
                    placeholder="Search content by title..."
                    className="input-field"
                    style={{ paddingLeft: '2.5rem', borderRadius: '0.75rem' }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Content Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
                                <th style={{ padding: '1rem 1.5rem' }}>Title</th>
                                <th style={{ padding: '1rem 1.5rem' }}>Type</th>
                                <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem' }}>Author</th>
                                <th style={{ padding: '1rem 1.5rem' }}>Date</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredContent.length > 0 ? filteredContent.map(item => (
                                <tr key={item.id} style={{ borderTop: '1px solid #f1f5f9' }} className="hover-row">
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ padding: '0.5rem', backgroundColor: '#f1f5f9', borderRadius: '0.5rem', color: '#64748b' }}>
                                                <FileText size={20} />
                                            </div>
                                            <span className="font-medium text-slate-800">{item.title}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#475569' }}>{item.type}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={getStatusColor(item.status)}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#64748b' }}>{item.author}</td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#64748b' }}>{item.date}</td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button title="View" style={{ padding: '0.5rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                <Eye size={16} />
                                            </button>
                                            <button title="Edit" style={{ padding: '0.5rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                <Edit3 size={16} />
                                            </button>
                                            <button title="Archive" style={{ padding: '0.5rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                <Archive size={16} />
                                            </button>
                                            <button title="Delete" style={{ padding: '0.5rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}>
                                        No content found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CMS;
