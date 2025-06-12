import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Components
import AuthForms from '../auth/AuthForms';
import ChallengePage from '../challenges/ChallengePage';
import DocumentsPage from '../Documents/DocumentsPage';
import ProfilePage from '../profile/ProfilePage';
import PageTransition from './PageTransition';
import HomePage from '../HomePage';

/**
 * Animated routes component with page transitions
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user object
 * @param {Function} props.handleAuthSuccess - Auth success handler
 */
const AnimatedRoutes = ({ user, handleAuthSuccess }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition>
            <HomePage user={user} />
          </PageTransition>
        } />
        
        <Route path="/login" element={
          user ? (
            <Navigate to="/" />
          ) : (
            <PageTransition>
              <AuthForms onAuthSuccess={handleAuthSuccess} />
            </PageTransition>
          )
        } />
        
        <Route path="/challenges" element={
          user ? (
            <PageTransition>
              <ChallengePage />
            </PageTransition>
          ) : (
            <Navigate to="/login" />
          )
        } />
        
        <Route path="/documents" element={
          user ? (
            <PageTransition>
              <DocumentsPage />
            </PageTransition>
          ) : (
            <Navigate to="/login" />
          )
        } />
        
        <Route path="/profile" element={
          user ? (
            <PageTransition>
              <ProfilePage />
            </PageTransition>
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
