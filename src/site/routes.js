import SiteLayout from './SiteLayout.vue'
import Home from './pages/Home.vue'
import About from './pages/About.vue'
import Academics from './pages/Academics.vue'
import Admissions from './pages/Admissions.vue'
import Faculty from './pages/Faculty.vue'
import News from './pages/News.vue'
import Contact from './pages/Contact.vue'

// Public marketing site. Routes are intentionally not marked `meta.public`
// because that flag is used by the auth guard to bounce signed-in users away
// from /login and /forgot-password. The site should be reachable to everyone.
const siteRoutes = [
  {
    path: '/',
    component: SiteLayout,
    children: [
      { path: '', name: 'SiteHome', component: Home, meta: { title: 'Home' } },
      { path: 'about', name: 'SiteAbout', component: About, meta: { title: 'About' } },
      { path: 'academics', name: 'SiteAcademics', component: Academics, meta: { title: 'Academics' } },
      { path: 'admissions', name: 'SiteAdmissions', component: Admissions, meta: { title: 'Admissions' } },
      { path: 'faculty', name: 'SiteFaculty', component: Faculty, meta: { title: 'Faculty' } },
      { path: 'news', name: 'SiteNews', component: News, meta: { title: 'News' } },
      { path: 'contact', name: 'SiteContact', component: Contact, meta: { title: 'Contact' } },
    ],
  },
]

export default siteRoutes
