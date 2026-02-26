import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/Home";
import BlogPage from "./pages/Blog";
import PostPage from "./pages/Post";
import CategoryPage from "./pages/Category";
import StaticPage from "./pages/StaticPage";
import SearchPage from "./pages/Search";
import AdminPage from "./pages/Admin";
import NotFoundPage from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import { DefaultSEO } from "./seo/meta";

const App = () => {
  return (
    <Layout>
      <ScrollToTop />
      <DefaultSEO />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<PostPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/page/:slug" element={<StaticPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
