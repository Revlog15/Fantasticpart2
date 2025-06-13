// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import CharacterSelect from "./components/CharacterSelect";
import Game from "./components/Game";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Handle browser/tab close
    const handleBeforeUnload = () => {
      if (auth.currentUser) {
        signOut(auth);
      }
    };

    // Handle visibility change (tab switch or minimize)
    // Removed sign out on tab switch to prevent redirect to login
    // const handleVisibilityChange = () => {
    //   if (document.visibilityState === 'hidden' && auth.currentUser) {
    //     signOut(auth);
    //   }
    // };

    window.addEventListener('beforeunload', handleBeforeUnload);
    // document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (user) {
      // Key unik per user
      const progressKey = `progress_${user.uid}`;
      const inventoryKey = `inventory_${user.uid}`;
      const statsKey = `stats_${user.uid}`;

      // Jika user baru (belum ada progress), reset ke default
      if (!localStorage.getItem(progressKey)) {
        localStorage.setItem(progressKey, JSON.stringify({}));
      }
      if (!localStorage.getItem(inventoryKey)) {
        localStorage.setItem(inventoryKey, JSON.stringify([]));
      }
      if (!localStorage.getItem(statsKey)) {
        localStorage.setItem(statsKey, JSON.stringify({
          happiness: 100,
          hunger: 100,
          sleep: 100,
          hygiene: 100,
          gold: 0,
        }));
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/" />} 
        />
        <Route 
          path="/register" 
          element={!user ? <Register /> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={user ? <CharacterSelect /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/game" 
          element={user ? <Game /> : <Navigate to="/login" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
