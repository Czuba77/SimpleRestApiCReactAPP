import {BrowserRouter,Routes,Route,Link} from 'react-router-dom';
import ContactList from './pages/ContactList';
import Login from './pages/Login';
import Register from './pages/Register';
import ContactForm from './pages/ContactForm';
import ContactDetails from './pages/ContactDetails';

function App(){
  const token = localStorage.getItem('token');
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return(
    <BrowserRouter>
      <nav style={{ background: '#fff', padding: '15px', marginBottom: '20px', borderRadius: '5px', display: 'flex', gap: '15px' }}>
        <Link to="/">Main page</Link>
        {token && <Link to="/add">Add Contact</Link>}
        {!token && <Link to="/register">Register</Link>}
        {!token ? (
          <Link to="/login">Log in</Link>
        ) : (
          <button onClick={handleLogout}>Log out</button>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<ContactList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Protecting routes - only accessible if token exists */}
        <Route path="/add" element={token ? <ContactForm /> : <h2>Access Denied - Please Login</h2>} />
        <Route path="/edit/:id" element={token ? <ContactForm /> : <h2>Access Denied</h2>} />
        <Route path="/contact/:id" element={<ContactDetails />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;