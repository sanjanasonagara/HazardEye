import React, { useState, useMemo } from 'react';
import { Download, FileText, ShieldCheck, CheckCircle2, Search, Settings, Power, Lock } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { format } from 'date-fns';
const mockSafetyResources: any[] = [];

const IconMap = {
    ShieldCheck: <ShieldCheck size={20} color="#2563eb" />, // blue-600
    Settings: <Settings size={20} color="#4b5563" />, // gray-600
    Power: <Power size={20} color="#ea580c" />, // orange-600
    Lock: <Lock size={20} color="#dc2626" />, // red-600
};

const SafetyGuidelines = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredResources = useMemo(() => {
        return mockSafetyResources.filter(resource => {
            const matchesTab = activeTab === 'All' || resource.type === activeTab;
            const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                resource.content.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesTab && matchesSearch;
        });
    }, [activeTab, searchQuery]);

    const handleDownload = (id) => {
        alert(`Downloading resource: ${id}`);
    };

    // --- Inline Styles for "Pixel Perfect" Matching ---
    const styles = {
        container: {
            maxWidth: '1152px', // max-w-6xl
            margin: '0 auto',
            paddingBottom: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
        },
        headerSection: {
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '1.5rem',
            borderBottom: '1px solid #e5e7eb', // gray-200
            paddingBottom: '2rem',
        },
        title: {
            fontSize: '1.875rem', // 3xl
            fontWeight: '700',
            color: '#111827', // gray-900
            lineHeight: '1.25',
            margin: 0,
        },
        subtitle: {
            color: '#6b7280', // gray-500
            marginTop: '0.5rem',
            maxWidth: '36rem',
            fontSize: '1rem',
        },
        searchWrapper: {
            position: 'relative',
            width: '100%',
            maxWidth: '16rem',
        },
        searchInput: {
            width: '100%',
            paddingLeft: '2.5rem',
            paddingRight: '1rem',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb', // gray-200
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            outline: 'none',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        },
        searchIcon: {
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af', // gray-400
            width: '1rem',
            height: '1rem',
        },
        tabContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#f3f4f6', // gray-100
            padding: '0.25rem',
            borderRadius: '0.75rem',
            width: 'fit-content',
            border: '1px solid #e5e7eb',
        },
        tabButton: (isActive) => ({
            padding: '0.5rem 1.5rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            transition: 'all 0.2s',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: isActive ? 'white' : 'transparent',
            color: isActive ? '#0369a1' : '#6b7280', // primary-700 : gray-500
            boxShadow: isActive ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
            border: isActive ? '1px solid #e5e7eb' : '1px solid transparent',
        }),
        contentList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
        },
        cardTopBorder: (color) => ({
            borderTop: `4px solid ${color}`,
        }),
        cardHeaderContent: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
        },
        iconBox: {
            padding: '0.75rem',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            color: '#2563eb', // primary-600
        },
        resourceTitle: {
            fontSize: '1.25rem', // xl
            fontWeight: '700',
            color: '#1f2937', // gray-800
            margin: 0,
        },
        badge: (type) => ({
            fontSize: '10px',
            fontWeight: '700',
            padding: '0.125rem 0.5rem',
            borderRadius: '9999px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            backgroundColor: type === 'SOP' ? '#ffedd5' : '#dbeafe', // orange-100 : blue-100
            color: type === 'SOP' ? '#c2410c' : '#1d4ed8', // orange-700 : blue-700
            marginLeft: '0.5rem',
        }),
        dateText: {
            fontSize: '0.75rem', // xs
            color: '#9ca3af', // gray-400
            margin: 0,
            marginTop: '0.25rem',
        },
        quoteBox: {
            color: '#4b5563', // gray-600
            lineHeight: '1.625',
            fontWeight: '500',
            backgroundColor: '#f9fafb', // gray-50
            padding: '1rem',
            borderRadius: '0.75rem',
            border: '1px solid #f3f4f6', // gray-100
            fontStyle: 'italic',
            marginBottom: '2rem',
        },
        sectionsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
        },
        sectionTitle: {
            fontWeight: '700',
            color: '#1f2937', // gray-800
            fontSize: '1.125rem', // lg
            textTransform: 'uppercase',
            letterSpacing: '-0.025em',
            margin: 0,
        },
        listItem: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            transition: 'background-color 0.2s',
        },
    };

    return (
        <div style={styles.container}>
            {/* Header Section */}
            <div style={styles.headerSection}>
                <div>
                    <h1 style={styles.title}>Safety Resources</h1>
                    <p style={styles.subtitle}>
                        Access official safety guidelines and Standard Operating Procedures (SOPs) for workplace compliance.
                    </p>
                </div>

                <div style={styles.searchWrapper}>
                    <Search style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        style={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={styles.tabContainer}>
                {['All', 'Safety Guideline', 'SOP'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={styles.tabButton(activeTab === tab)}
                    >
                        {tab === 'All' ? 'All Resources' : tab + 's'}
                    </button>
                ))}
            </div>

            {/* Content List */}
            <div style={styles.contentList}>
                {filteredResources.length > 0 ? (
                    filteredResources.map((resource) => (
                        <Card key={resource.id} style={styles.cardTopBorder('#3b82f6')}>
                            <CardHeader>
                                <div style={styles.cardHeaderContent}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={styles.iconBox}>
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <h2 style={styles.resourceTitle}>{resource.title}</h2>
                                                <span style={styles.badge(resource.type)}>
                                                    {resource.type}
                                                </span>
                                            </div>
                                            <p style={styles.dateText}>
                                                Last updated: {format(resource.lastUpdated, 'MMMM d, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDownload(resource.id)}
                                        style={{ fontWeight: '600', color: '#4b5563' }}
                                    >
                                        <Download size={16} style={{ marginRight: '0.5rem' }} />
                                        Download PDF
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <div style={{ maxWidth: '56rem' }}> {/* max-w-4xl */}
                                    <p style={styles.quoteBox}>
                                        "{resource.content}"
                                    </p>

                                    <div style={styles.sectionsGrid}>
                                        {resource.sections.map((section, idx) => (
                                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                                                    {section.icon && IconMap[section.icon] ? (
                                                        <div style={{ padding: '0.375rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
                                                            {IconMap[section.icon]}
                                                        </div>
                                                    ) : null}
                                                    <h3 style={styles.sectionTitle}>{section.title}</h3>
                                                </div>
                                                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0, margin: 0, listStyle: 'none' }}>
                                                    {section.items.map((item, itemIdx) => (
                                                        <li key={itemIdx} style={styles.listItem}>
                                                            <CheckCircle2 size={18} color="#22c55e" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                                                            <span style={{ color: '#374151', lineHeight: '1.375' }}>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '5rem 0', backgroundColor: '#f9fafb', borderRadius: '1.5rem', border: '2px dashed #e5e7eb' }}>
                        <div style={{ margin: '0 auto', width: '4rem', height: '4rem', backgroundColor: '#f3f4f6', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', marginBottom: '1rem' }}>
                            <Search size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1f2937' }}>No resources found</h3>
                        <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>Try adjusting your search or filters to find what you're looking for.</p>
                        <Button
                            variant="secondary"
                            style={{ mt: '1.5rem' }}
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

export default SafetyGuidelines;
