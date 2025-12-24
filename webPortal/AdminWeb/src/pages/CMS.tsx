import React, { useState } from 'react';
import {
    Plus,
    Search,
    FileText,
    Eye,
    Edit3,
    Trash2,
    Archive,
    X,
    CheckCircle2
} from 'lucide-react';
import { cmsContent as initialCmsContent, contentTypes } from '../data/mockData';
import { Button } from '../components/UI/Button';

const CMS = () => {
    const [cmsData, setCmsData] = useState(initialCmsContent);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    // Modal States
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [viewingItem, setViewingItem] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        id: null,
        title: '',
        type: contentTypes[1],
        status: 'Draft',
        content: '',
        author: 'Admin User', // Default
        date: new Date().toISOString().split('T')[0]
    });

    const filteredContent = cmsData.filter(item => {
        const matchesType = filter === 'All' || item.type === filter;
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesSearch;
    });

    const getStatusColor = (status) => {
        const baseStyle = { padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-block' };
        switch (status) {
            case 'Published': return { ...baseStyle, backgroundColor: '#dcfce7', color: '#15803d' };
            case 'Draft': return { ...baseStyle, backgroundColor: '#f1f5f9', color: '#475569' };
            case 'Archived': return { ...baseStyle, backgroundColor: '#ffedd5', color: '#c2410c' };
            default: return { ...baseStyle, backgroundColor: '#f1f5f9', color: '#334155' };
        }
    };

    // --- Actions ---

    const handleOpenCreate = () => {
        setFormData({
            id: null,
            title: '',
            type: contentTypes[1],
            status: 'Draft',
            content: '',
            author: 'Admin User',
            date: new Date().toISOString().split('T')[0]
        });
        setIsEditing(false);
        setIsCreating(true);
    };

    const handleSave = (e) => {
        e.preventDefault();

        if (isEditing) {
            // Update existing
            setCmsData(prev => prev.map(item => item.id === formData.id ? { ...formData } : item));
            alert('Content updated successfully.');
        } else {
            // Create new
            const newItem = {
                ...formData,
                id: Math.max(...cmsData.map(i => i.id || 0), 0) + 1,
            };
            setCmsData(prev => [newItem, ...prev]);
            alert('Content created successfully.');
        }

        setIsCreating(false);
        setIsEditing(false);
    };

    const handleEdit = (item) => {
        setFormData({ ...item });
        setIsEditing(true);
        setIsCreating(true);
    };

    const handleView = (item) => {
        setViewingItem(item);
    };

    const handleArchive = (id) => {
        if (window.confirm('Are you sure you want to archive this content?')) {
            setCmsData(prev => prev.map(item =>
                item.id === id ? { ...item, status: 'Archived' } : item
            ));
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
            setCmsData(prev => prev.filter(item => item.id !== id));
        }
    };

    // --- Standard CSS Styles ---
    const styles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)', // slate-900/60
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
        },
        modal: {
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            width: '100%',
            maxWidth: '36rem',
            margin: '1rem',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            animation: 'fadeIn 0.2s ease-out'
        },
        modalHeader: {
            padding: '1.5rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
        },
        modalTitle: {
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1e293b',
            margin: 0,
        },
        closeButton: {
            backgroundColor: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '0.375rem',
            transition: 'all 0.2s',
        },
        modalBody: {
            padding: '1.5rem',
            maxHeight: '70vh',
            overflowY: 'auto',
        },
        formGroup: {
            marginBottom: '1.25rem',
        },
        label: {
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#334155',
            marginBottom: '0.375rem',
        },
        input: {
            width: '100%',
            padding: '0.625rem 0.875rem',
            borderRadius: '0.5rem',
            border: '1px solid #cbd5e1',
            fontSize: '0.875rem',
            color: '#1e293b',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
        },
        textarea: {
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid #cbd5e1',
            fontSize: '0.875rem',
            color: '#1e293b',
            outline: 'none',
            minHeight: '8rem',
            resize: 'vertical',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box',
            lineHeight: '1.5',
        },
        gridCols2: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.25rem',
        },
        modalFooter: {
            padding: '1.25rem 1.5rem',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
        },
        // Table Action Button Styles
        actionBtn: (color, bgHover) => ({
            padding: '0.5rem',
            color: '#64748b',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '0.375rem',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }),
        // View Modal Specifics
        viewLabel: {
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#64748b',
            fontWeight: '600',
            marginBottom: '0.25rem',
        },
        viewValue: {
            fontSize: '1rem',
            color: '#1e293b',
            lineHeight: '1.5',
        }
    };

    // Helper for input focus
    const handleInputFocus = (e) => {
        e.target.style.borderColor = 'var(--color-primary)';
        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
    };
    const handleInputBlur = (e) => {
        e.target.style.borderColor = '#cbd5e1';
        e.target.style.boxShadow = 'none';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>

            {/* Create/Edit Modal */}
            {isCreating && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>{isEditing ? 'Edit Content' : 'Create New Content'}</h2>
                            <button
                                onClick={() => setIsCreating(false)}
                                style={styles.closeButton}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#334155'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div style={styles.modalBody}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Title</label>
                                    <input
                                        type="text"
                                        required
                                        style={styles.input}
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>
                                <div style={styles.gridCols2}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Type</label>
                                        <select
                                            style={styles.input}
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            onFocus={handleInputFocus}
                                            onBlur={handleInputBlur}
                                        >
                                            {contentTypes.filter(t => t !== 'All').map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Status</label>
                                        <select
                                            style={styles.input}
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            onFocus={handleInputFocus}
                                            onBlur={handleInputBlur}
                                        >
                                            <option value="Draft">Draft</option>
                                            <option value="Published">Published</option>
                                            <option value="Archived">Archived</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ marginBottom: 0 }}>
                                    <label style={styles.label}>Content / Description</label>
                                    <textarea
                                        style={styles.textarea}
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    ></textarea>
                                </div>
                            </div>
                            <div style={styles.modalFooter}>
                                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                                <Button type="submit" variant="primary">{isEditing ? 'Save Changes' : 'Create Content'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {viewingItem && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>Content Details</h2>
                            <button
                                onClick={() => setViewingItem(null)}
                                style={styles.closeButton}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#334155'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={styles.viewLabel}>Title</div>
                                <div style={{ ...styles.viewValue, fontSize: '1.25rem', fontWeight: 'bold' }}>{viewingItem.title}</div>
                            </div>
                            <div style={styles.gridCols2}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={styles.viewLabel}>Type</div>
                                    <div style={styles.viewValue}>{viewingItem.type}</div>
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={styles.viewLabel}>Status</div>
                                    <span style={getStatusColor(viewingItem.status)}>{viewingItem.status}</span>
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={styles.viewLabel}>Author & Date</div>
                                <div style={styles.viewValue}>by {viewingItem.author} on {viewingItem.date}</div>
                            </div>
                            <div>
                                <div style={styles.viewLabel}>Description</div>
                                <div style={{ ...styles.viewValue, backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                                    {viewingItem.content || "No description provided."}
                                </div>
                            </div>
                        </div>
                        <div style={styles.modalFooter}>
                            <Button variant="outline" onClick={() => setViewingItem(null)}>Close</Button>
                            <Button variant="primary" onClick={() => { setViewingItem(null); handleEdit(viewingItem); }}>Edit Content</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Bar */}
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                    {contentTypes.slice(0, 4).map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                backgroundColor: filter === type ? '#1e293b' : 'white',
                                color: filter === type ? 'white' : '#64748b',
                                border: filter === type ? 'none' : '1px solid #e2e8f0',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                borderRadius: '0.375rem', // Changed to rounded for better look
                                boxShadow: filter !== type ? '0 1px 2px 0 rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <Button variant="primary" onClick={handleOpenCreate}>
                    <Plus size={16} style={{ marginRight: '0.5rem' }} />
                    Create New
                </Button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                    type="text"
                    placeholder="Search content by title..."
                    style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.5rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        outline: 'none',
                        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
                    }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                />
            </div>

            {/* Table */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, textAlign: 'left', letterSpacing: '0.05em' }}>
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
                                <tr key={item.id} style={{ borderTop: '1px solid #f1f5f9', transition: 'background-color 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ padding: '0.5rem', backgroundColor: '#f1f5f9', borderRadius: '0.5rem', color: '#444' }}>
                                                <FileText size={20} />
                                            </div>
                                            <span style={{ fontWeight: 600, color: '#1e293b' }}>{item.title}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#475569', fontSize: '0.875rem' }}>{item.type}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={getStatusColor(item.status)}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.875rem' }}>{item.author}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.875rem' }}>{item.date}</td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleView(item)}
                                                title="View Details"
                                                style={styles.actionBtn()}
                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#dbeafe'; e.currentTarget.style.color = '#2563eb'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(item)}
                                                title="Edit"
                                                style={styles.actionBtn()}
                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e0e7ff'; e.currentTarget.style.color = '#4f46e5'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleArchive(item.id)}
                                                title="Archive"
                                                style={styles.actionBtn()}
                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ffedd5'; e.currentTarget.style.color = '#ea580c'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                                            >
                                                <Archive size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                title="Delete"
                                                style={styles.actionBtn()}
                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} style={{ padding: '4rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                            <Search size={48} strokeWidth={1} style={{ opacity: 0.5 }} />
                                            <div>
                                                <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#475569' }}>No content found</p>
                                                <p style={{ fontSize: '0.875rem' }}>Try adjusting your search or filters.</p>
                                            </div>
                                        </div>
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
