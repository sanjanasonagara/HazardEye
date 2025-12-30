import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardHeader, CardBody } from './UI/Card';

// Define the shape based on format seen in web component
export interface AIRecommendation {
    whatToDo: string;
    whyItMatters: string;
    riskExplanation: string;
    preventiveSteps: string[];
}

interface AIRecommendationPanelProps {
    recommendation: AIRecommendation;
}

export const AIRecommendationPanel: React.FC<AIRecommendationPanelProps> = ({
    recommendation
}) => {
    return (
        <Card style={styles.card}>
            <CardHeader style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="shield-checkmark" size={24} color="#fff" />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>AI Safety Recommendation</Text>
                        <Text style={styles.headerSubtitle}>Powered by HazardEye AI Analysis</Text>
                    </View>
                </View>
            </CardHeader>

            <CardBody style={styles.body}>
                {/* What to Do */}
                <View style={[styles.sectionBox, styles.blueBox]}>
                    <View style={styles.boxHeader}>
                        <Ionicons name="checkmark-circle" size={20} color="#2563EB" style={styles.boxIcon} />
                        <Text style={[styles.boxTitle, styles.blueText]}>What to Do</Text>
                    </View>
                    <Text style={[styles.boxContent, styles.blueContent]}>{recommendation.whatToDo}</Text>
                </View>

                {/* Why It Matters */}
                <View style={[styles.sectionBox, styles.amberBox]}>
                    <View style={styles.boxHeader}>
                        <Ionicons name="warning-outline" size={20} color="#D69E2E" style={styles.boxIcon} />
                        <Text style={[styles.boxTitle, styles.amberText]}>Why It Matters</Text>
                    </View>
                    <Text style={[styles.boxContent, styles.amberContent]}>{recommendation.whyItMatters}</Text>
                </View>

                {/* Risk Explanation */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="warning-outline" size={20} color="#E53E3E" />
                        <Text style={styles.sectionTitle}>Risk Explanation</Text>
                    </View>
                    <View style={styles.riskBox}>
                        <Text style={styles.riskText}>{recommendation.riskExplanation}</Text>
                    </View>
                </View>

                {/* Preventive Steps */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="bulb-outline" size={20} color="#2563EB" />
                        <Text style={styles.sectionTitle}>Preventive Steps</Text>
                    </View>
                    <View style={styles.stepsContainer}>
                        {recommendation.preventiveSteps.map((step, index) => (
                            <View key={index} style={styles.stepItem}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                                </View>
                                <Text style={styles.stepText}>{step}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </CardBody>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        borderLeftWidth: 4,
        borderLeftColor: '#2563EB',
    },
    header: {
        backgroundColor: '#EFF6FF',
        borderBottomWidth: 0,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#2563EB',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A202C',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#718096',
    },
    body: {
        gap: 16,
    },
    sectionBox: {
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
    },
    boxHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    boxIcon: {
        marginTop: 2,
    },
    boxTitle: {
        fontWeight: '600',
        fontSize: 14,
    },
    boxContent: {
        fontSize: 13,
        lineHeight: 18,
    },

    // Blue Style
    blueBox: {
        backgroundColor: '#EFF6FF',
        borderColor: '#BFDBFE',
    },
    blueText: {
        color: '#1E3A8A',
    },
    blueContent: {
        color: '#1E40AF',
    },

    // Amber Style
    amberBox: {
        backgroundColor: '#FFFAF0',
        borderColor: '#FBD38D',
    },
    amberText: {
        color: '#744210',
    },
    amberContent: {
        color: '#975A16',
    },

    // Sections
    section: {
        marginTop: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A202C',
    },
    riskBox: {
        backgroundColor: '#F7FAFC',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    riskText: {
        fontSize: 13,
        color: '#4A5568',
        lineHeight: 18,
    },

    stepsContainer: {
        gap: 8,
    },
    stepItem: {
        flexDirection: 'row',
        gap: 12,
    },
    stepNumber: {
        width: 24,
        height: 24,
        backgroundColor: '#EBF8FF',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    stepNumberText: {
        color: '#2B6CB0',
        fontSize: 12,
        fontWeight: 'bold',
    },
    stepText: {
        flex: 1,
        fontSize: 13,
        color: '#4A5568',
        lineHeight: 18,
    },
});
