import { useState } from "react";
import axiosInstance from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email,setEmail] = useState('');
    const [passwordHash,setPasswordHash] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        try {
            const response = await axiosInstance.post('/auth/login', {
                email: email,
                passwordHash: passwordHash
            });
            
            const token = response.data.token;
            localStorage.setItem('token', token);

            window.location.href = "/";
        } catch (error){
            setErrorMsg('Bad credentials.');
        }
    };

    return (
    <div style={{ maxWidth: '300px', padding: '20px', background: '#fff', borderRadius: '5px' }}>
        <h2>Login panel</h2>
        {errorMsg && <div style={{ color: 'red', marginBottom: '10px' }}>{errorMsg}</div>}
        
        <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '10px' }}>
                <label>E-mail: </label><br />
                <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label>Password: </label><br />
                <input 
                    type="password" 
                    value={passwordHash} 
                    onChange={(e) => setPasswordHash(e.target.value)} 
                    required 
                />
            </div>
            <button type="submit" style={{ padding: '8px 15px', marginTop: '10px' }}>Sign in</button>
        </form>
    </div>
    );
}