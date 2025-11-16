import React from "react";
import { HashRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import ProcessingSummary from './pages/processing-summary';
import MetadataEntry from './pages/metadata-entry';
import CoverArtManagement from './pages/cover-art-management';
import FileProcessing from './pages/file-processing';
import FileSelection from './pages/file-selection';

const Routes = () => {
  return (
    <HashRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<FileSelection />} />
        <Route path="/processing-summary" element={<ProcessingSummary />} />
        <Route path="/metadata-entry" element={<MetadataEntry />} />
        <Route path="/cover-art-management" element={<CoverArtManagement />} />
        <Route path="/file-processing" element={<FileProcessing />} />
        <Route path="/file-selection" element={<FileSelection />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </HashRouter>
  );
};

export default Routes;