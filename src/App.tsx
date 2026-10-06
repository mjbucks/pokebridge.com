import { Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { DailyPage } from './pages/DailyPage';
import { SoloPage } from './pages/SoloPage';
import { ChallengePage } from './pages/ChallengePage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/daily" element={<DailyPage />} />
          <Route path="/solo" element={<SoloPage />} />
          <Route path="/play/:code" element={<ChallengePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
