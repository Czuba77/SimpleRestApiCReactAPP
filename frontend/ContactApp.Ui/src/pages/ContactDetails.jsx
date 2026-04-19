import { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

export default function ContactDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    const [contact, setContact] = useState(null);
    const [loading, setLoading] =useState(true);

    useEffect(() =>
    {
        axiosInstance.get(`/contacts/${id}`)
            .then(response => {
                setContact(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching details:', error);
                setLoading(false);
            });
    }, [id]);

    const handleDelete = async () => {
        const confirmDelete = window.confirm('Are you sure you want to delete this contact?');
        if (confirmDelete) {
            try{
                await axiosInstance.delete(`/contacts/${id}`);
                navigate('/');
            } catch (error){
                alert('Could not delete contact.');
            }
        }
    }

    const handleEdit = async () => {
        navigate(`/edit/${id}`);
    }

    if (loading) return <div>Loading details...</div>;

    if (!contact) return <div>Contact not found</div>;

    return(
                <div style={{ maxWidth: '500px', background: '#fff', padding: '20px', borderRadius: '5px' }}>
            <h2>{contact.firstName} {contact.lastName}</h2>
            
            <div style={{ lineHeight: '1.8' }}>
                <p><strong>Email:</strong> {contact.email}</p>
                <p><strong>Phone:</strong> {contact.phone}</p>
                <p><strong>Date of Birth:</strong> {contact.dateOfBirth}</p>
                
                <hr style={{ margin: '15px 0' }}/>
                
                <p><strong>Category:</strong> {contact.category ? contact.category.name : 'Unknown'}</p>
                
                {contact.subcategory && <p><strong>Subcategory:</strong> {contact.subcategory.name}</p>}
                {contact.customSubcategory && <p><strong>Subcategory (Custom):</strong> {contact.customSubcategory}</p>}
            </div>

            {token && (
                <div style={{ marginTop: '20px' }}>
                    <button onClick={handleEdit} style={{ background: '#90D5FF', color: 'white', padding: '10px', border: 'none', borderRadius: '4px' }}>
                        Edit Contact
                    </button>
                    <button onClick={handleDelete} style={{ background: '#d9534f', color: 'white', padding: '10px', border: 'none', borderRadius: '4px' }}>
                        Delete Contact
                    </button>
                </div>
            )}
        </div>
    );
}