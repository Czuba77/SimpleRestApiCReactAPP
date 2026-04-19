import {BrowserRouter,Routes,Route,Link} from 'react-router-dom';
import ContactList from './pages/ContactList';
import Login from './pages/Login';

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
        {!token ? (
          <Link to="/login">Log in</Link>
        ) : (
          <button onClick={handleLogout}>Log out</button>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<ContactList />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;