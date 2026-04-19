import { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import { useNavigate, useParams } from 'react-router-dom';

export default function ContactForm() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [passwordHash, setPasswordHash] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');

    const [categoryId, setCategoryId] = useState('1'); 
    const [subcategoryId, setSubcategoryId] = useState('');
    const [customSubcategory, setCustomSubcategory] = useState('');
    
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() =>{
        if(id){
                axiosInstance.get(`/contacts/${id}`)
                .then(response => 
                {   
                    const data = response.data;
                    setFirstName(data.firstName);
                    setLastName(data.lastName);
                    setEmail(data.email);
                    setPhone(data.phone);
                    setPasswordHash(data.passwordHash);
                    setDateOfBirth(data.dateOfBirth.split('T')[0]);
                    setCategoryId(data.categoryId ? data.categoryId.toString() : '1');
                    setSubcategoryId(data.subcategoryId ? data.subcategoryId.toString() : '');
                    setCustomSubcategory(data.customSubcategory || '');
                })
                .catch(err => console.error("Error loading for edit:", err));
        }   
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        const contactData = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            passwordHash: passwordHash,
            dateOfBirth: dateOfBirth,
            categoryId: parseInt(categoryId),
            //if non empty and non "Business" cat send null
            subcategoryId: subcategoryId ? parseInt(subcategoryId) : null,
            customSubcategory: customSubcategory
        };
        
        try{
            if (id) {
                 await axiosInstance.put(`/contacts/${id}`, contactData);
            } else {
                 await axiosInstance.post('/contacts', contactData);
            }
            navigate('/');
        } catch (error){
            if(error.response && error.response.data)
                setErrorMsg(typeof error.response.data === 'string' ? error.response.data : "Invalid request data.");
            else
                setErrorMsg('Error creating contact.')
        }
    }

    return (
        <div style={{ maxWidth: '400px', background: '#fff', padding: '20px', borderRadius: '5px' }}>
            <h2>Add new contact</h2>
            {errorMsg && <div style={{ color: 'red', marginBottom: '15px' }}><strong>{errorMsg}</strong></div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                <input placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
                <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
                <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} required />
                
                <input type="password" placeholder="Password (min 9 chars)" value={passwordHash} onChange={e => setPasswordHash(e.target.value)} required minLength="9" />
                <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} required />

                <label style={{marginTop: '10px'}}><b>Category:</b></label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                    <option value="1">Business</option>
                    <option value="2">Private</option>
                    <option value="3">Other</option>
                </select>

                {categoryId === '1' && (
                    <select value={subcategoryId} onChange={e => setSubcategoryId(e.target.value)} required>
                        <option value="">- Select Business Role -</option>
                        <option value="1">Boss</option>
                        <option value="2">Client</option>
                        <option value="3">Colleague</option>
                    </select>
                )}

                {categoryId === '3' && (
                     <input placeholder="Type custom 'other' subcategory" value={customSubcategory} onChange={e => setCustomSubcategory(e.target.value)} required />
                )}

                <button type="submit" style={{ padding: '10px', marginTop: '15px' }}>Save Contact</button>
            </form>
        </div>
    );
}