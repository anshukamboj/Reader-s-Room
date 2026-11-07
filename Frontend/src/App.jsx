import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Page from "./components/Page";
import ExploreBooks from "./components/ExploreBooks";
import Login from "./components/Login";
import Signup from "./components/Signup";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Overview from "./pages/Overview";
import BrowseBooks from "./pages/BrowseBooks";
import MyLibrary from "./pages/MyLibrary";
import Reservations from "./pages/Reservations";
import ReadingHistory from "./pages/ReadingHistory";
import Wishlist from "./pages/Wishlist";
import Settings from "./pages/Settings";

import { LibraryProvider } from "./context/LibraryContext";

import LibrarianDashboard from "./pages/LibrarianDashboard";
import CatalogInventory from "./pages/CatalogInventory";
import CirculationDesk from "./pages/CirculationDesk";
import MembersFines from "./pages/MembersFines";
import LibrarianLayout from "./components/LibrarianLayout";
import SettingsPreferences from "./pages/SettingsPreferences";
import Features from "./components/Features";
import About from "./components/About";

function App() {
  return (
    <BrowserRouter>
      <LibraryProvider>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Page />} />
         <Route path="/Books" element={<ExploreBooks />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/about" element={<About/>} />
          <Route path="/features" element={<Features/>} />
          <Route path="/signup" element={<Signup />} />

          {/* Librarian routes */}
          <Route
            element={<ProtectedRoute role="librarian" />}
          >
            <Route path="/librarian" element={<LibrarianLayout />}>
              <Route index element={<LibrarianDashboard />} />
              <Route path="catalog" element={<CatalogInventory />} />
              <Route path="circulation" element={<CirculationDesk />} />
              <Route path="members" element={<MembersFines />} />
              <Route path="settings" element={<SettingsPreferences />} />
            </Route>
          </Route>

          {/* Member routes */}
          <Route element={<ProtectedRoute role="member" />}>
            <Route path="/dashboard" element={<AppLayout />}>
              <Route
                index
                element={<Navigate to="overview" replace />}
              />
              <Route path="overview" element={<Overview />} />
              <Route path="browse-books" element={<BrowseBooks />} />
              <Route path="my-library" element={<MyLibrary />} />
              <Route path="reservations" element={<Reservations />} />
              <Route path="reading-history" element={<ReadingHistory />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LibraryProvider>
    </BrowserRouter>
  );
}

export default App;