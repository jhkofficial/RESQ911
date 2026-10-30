/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DisasterProvider, useDisaster } from './context/DisasterContext';
import { SimulatedBanner } from './components/common/SimulatedBanner';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { NationalDashboard } from './components/dashboard/NationalDashboard';
import { DisasterMap } from './components/map/DisasterMap';
import { IncidentManagement } from './components/incidents/IncidentManagement';
import { DisasterAnalytics } from './components/analytics/DisasterAnalytics';
import { AIIntelligenceOverview } from './components/ai/AIIntelligenceOverview';
import { ResponseCoordination } from './components/modules/ResponseCoordination';
import { ReportsModule } from './components/modules/ReportsModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { IncidentReportingForm } from './components/reporting/IncidentReportingForm';
import { ReportInbox } from './components/reporting/ReportInbox';
import { VerificationCenter } from './components/verification/VerificationCenter';
import { DuplicateDetectionModule } from './components/verification/DuplicateDetectionModule';
import { ActivityHistoryModule } from './components/verification/ActivityHistoryModule';
import { AIIntelligenceCenter } from './components/intelligence/AIIntelligenceCenter';
import { RiskIntelligenceModule } from './components/intelligence/RiskIntelligenceModule';
import { RapidDamageAssessmentModule } from './components/intelligence/RapidDamageAssessmentModule';
import { DataReconciliationModule } from './components/intelligence/DataReconciliationModule';
import { ResponsePriorityEngine } from './components/intelligence/ResponsePriorityEngine';
import { DecisionSupportCenter } from './components/intelligence/DecisionSupportCenter';
import { RecoveryIntelligencePreview } from './components/intelligence/RecoveryIntelligencePreview';
import { AIAnalysisHistory } from './components/intelligence/AIAnalysisHistory';
import { IncidentDetailModal } from './components/incidents/IncidentDetailModal';
import { NewIncidentModal } from './components/incidents/NewIncidentModal';
import { LoginPage } from './components/auth/LoginPage';

const MainShell: React.FC = () => {
  const { isLoggedIn, activeTab, activeIncident, setActiveIncident, setActiveTab } = useDisaster();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isNewIncidentModalOpen, setIsNewIncidentModalOpen] = useState(false);

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#071426] text-slate-100 flex flex-col antialiased">
      {/* Mandatory Top Simulation Disclaimer Banner */}
      <SimulatedBanner />

      {/* Command Center Top Navbar */}
      <Navbar onOpenNewIncidentModal={() => setIsNewIncidentModalOpen(true)} />

      {/* Main App Body with Sidebar & Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Operational Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Dynamic Main Workspace View */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 bg-gradient-to-b from-[#071426] via-[#091a30] to-[#071426]">
          <div className="max-w-7xl mx-auto space-y-4">
            {activeTab === 'dashboard' && <NationalDashboard />}
            {activeTab === 'map' && <DisasterMap />}
            {activeTab === 'incidents' && (
              <IncidentManagement onOpenNewModal={() => setIsNewIncidentModalOpen(true)} />
            )}

            {/* MVP 3 AI Intelligence & Decision Support Modules */}
            {activeTab === 'ai-center' && <AIIntelligenceCenter />}
            {activeTab === 'risk-intel' && <RiskIntelligenceModule />}
            {activeTab === 'damage-assessment' && <RapidDamageAssessmentModule />}
            {activeTab === 'data-reconciliation' && <DataReconciliationModule />}
            {activeTab === 'priority-engine' && <ResponsePriorityEngine />}
            {activeTab === 'decision-support' && <DecisionSupportCenter />}
            {activeTab === 'recovery-preview' && <RecoveryIntelligencePreview />}
            {activeTab === 'ai-history' && <AIAnalysisHistory />}

            {/* MVP 2 Workflow Modules */}
            {activeTab === 'new-report' && <IncidentReportingForm />}
            {activeTab === 'report-inbox' && <ReportInbox />}
            {activeTab === 'verification-center' && <VerificationCenter />}
            {activeTab === 'duplicate-detection' && <DuplicateDetectionModule />}
            {activeTab === 'activity-history' && <ActivityHistoryModule />}

            {/* Other Command Modules */}
            {activeTab === 'analytics' && <DisasterAnalytics />}
            {activeTab === 'ai' && <AIIntelligenceCenter />}
            {activeTab === 'coordination' && <ResponseCoordination />}
            {activeTab === 'reports' && <ReportsModule />}
            {activeTab === 'settings' && <SettingsModule />}
          </div>
        </main>
      </div>

      {/* Incident Detail Modal / Drawer */}
      {activeIncident && (
        <IncidentDetailModal
          incident={activeIncident}
          onClose={() => setActiveIncident(null)}
          onNavigateToMap={() => {
            setActiveTab('map');
          }}
        />
      )}

      {/* New Incident Submission Modal */}
      <NewIncidentModal
        isOpen={isNewIncidentModalOpen}
        onClose={() => setIsNewIncidentModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <DisasterProvider>
      <MainShell />
    </DisasterProvider>
  );
}
