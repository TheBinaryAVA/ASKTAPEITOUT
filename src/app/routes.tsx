import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Homepage } from './pages/Homepage';
import { SearchResults } from './pages/SearchResults';
import { QuestionDetail } from './pages/QuestionDetail';
import { FailureExplanation } from './pages/FailureExplanation';
import { AtlasWorkspace } from './pages/AtlasWorkspace';
import { ErrorEncyclopedia } from './pages/ErrorEncyclopedia';
import { LearningHub } from './pages/LearningHub';
import { KnowledgeGraph } from './pages/KnowledgeGraph';
import { CommunityIntelligence } from './pages/CommunityIntelligence';
import { DocsHub } from './pages/DocsHub';
import { OpenROADCookbook } from './pages/OpenROADCookbook';
import { AtlasLanding } from './pages/AtlasLanding';
import { Pricing } from './pages/Pricing';
import { LoginSignup } from './pages/LoginSignup';
import { Profile } from './pages/Profile';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Homepage },
      { path: 'search', Component: SearchResults },
      { path: 'questions/:slug', Component: QuestionDetail },
      { path: 'atlas/error/:errorName', Component: FailureExplanation },
      { path: 'atlas', Component: AtlasWorkspace },
      { path: 'errors', Component: ErrorEncyclopedia },
      { path: 'learn', Component: LearningHub },
      { path: 'knowledge-graph', Component: KnowledgeGraph },
      { path: 'community', Component: CommunityIntelligence },
      { path: 'docs', Component: DocsHub },
      { path: 'docs/openroad-cookbook', Component: OpenROADCookbook },
      { path: 'atlas-platform', Component: AtlasLanding },
      { path: 'pricing', Component: Pricing },
      { path: 'login', Component: LoginSignup },
      { path: 'profile', Component: Profile },
    ],
  },
]);

