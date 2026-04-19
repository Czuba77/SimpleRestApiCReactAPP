import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";

export default function ContactList() {
    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        axiosInstance.get('/contacts')
            .then(response => setContacts(response.data))
            .catch(error => console.error("Error while downloading contact list", error));
            
    }, []);

    return(
        <div>
            <h2>Contact list</h2>
            <ul>
                {contacts.map(contact => (
                    <li key={contact.id} style={{ background: '#fff', margin: '10px 0', padding: '10px', borderRadius: '5px' }}>
                        <strong>{contact.firstName} {contact.lastName}</strong> - {contact.email} ({contact.categoryName})
                    </li>
                ))}
            </ul>
        </div>
    )
}