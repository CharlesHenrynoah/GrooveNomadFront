import React, { useState, useEffect } from 'react';
import base, { TABLE_NAME } from '../airtableConfig';
import './AirtableData.css';

const AirtableData = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newRecord, setNewRecord] = useState({
        name: '',
        notes: '',
        status: 'Todo'
    });

    // Récupérer les données depuis Airtable
    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const recordsArray = [];
            
            await base(TABLE_NAME).select({
                maxRecords: 100,
                view: "Grid view"
            }).eachPage(function page(pageRecords, fetchNextPage) {
                pageRecords.forEach(function(record) {
                    recordsArray.push({
                        id: record.id,
                        name: record.get('Name'),
                        notes: record.get('Notes'),
                        status: record.get('Status'),
                        assignee: record.get('Assignee'),
                        attachments: record.get('Attachments')
                    });
                });
                fetchNextPage();
            }, function done(err) {
                if (err) {
                    console.error('Erreur lors de la récupération des données:', err);
                    setError(err.message);
                } else {
                    setRecords(recordsArray);
                }
                setLoading(false);
            });
        } catch (err) {
            console.error('Erreur:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    // Ajouter un nouveau record
    const handleAddRecord = async (e) => {
        e.preventDefault();
        try {
            await base(TABLE_NAME).create([
                {
                    "fields": {
                        "Name": newRecord.name,
                        "Notes": newRecord.notes,
                        "Status": newRecord.status
                    }
                }
            ]);
            
            // Réinitialiser le formulaire
            setNewRecord({
                name: '',
                notes: '',
                status: 'Todo'
            });
            
            // Rafraîchir la liste
            fetchRecords();
        } catch (err) {
            console.error('Erreur lors de l\'ajout:', err);
            setError(err.message);
        }
    };

    // Mettre à jour un record
    const handleUpdateStatus = async (recordId, newStatus) => {
        try {
            await base(TABLE_NAME).update([
                {
                    "id": recordId,
                    "fields": {
                        "Status": newStatus
                    }
                }
            ]);
            
            // Rafraîchir la liste
            fetchRecords();
        } catch (err) {
            console.error('Erreur lors de la mise à jour:', err);
            setError(err.message);
        }
    };

    // Supprimer un record
    const handleDeleteRecord = async (recordId) => {
        try {
            await base(TABLE_NAME).destroy([recordId]);
            
            // Rafraîchir la liste
            fetchRecords();
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
            setError(err.message);
        }
    };

    if (loading) {
        return <div className="loading">Chargement des données...</div>;
    }

    if (error) {
        return <div className="error">Erreur: {error}</div>;
    }

    return (
        <div className="airtable-data">
            <h2>Données BloomNomad</h2>
            
            {/* Formulaire pour ajouter un nouveau record */}
            <form onSubmit={handleAddRecord} className="add-record-form">
                <h3>Ajouter un nouvel élément</h3>
                <div>
                    <label>
                        Nom:
                        <input
                            type="text"
                            value={newRecord.name}
                            onChange={(e) => setNewRecord({...newRecord, name: e.target.value})}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Notes:
                        <textarea
                            value={newRecord.notes}
                            onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Statut:
                        <select
                            value={newRecord.status}
                            onChange={(e) => setNewRecord({...newRecord, status: e.target.value})}
                        >
                            <option value="Todo">Todo</option>
                            <option value="In progress">In progress</option>
                            <option value="Done">Done</option>
                        </select>
                    </label>
                </div>
                <button type="submit">Ajouter</button>
            </form>

            {/* Liste des records */}
            <div className="records-list">
                <h3>Liste des éléments ({records.length})</h3>
                {records.length === 0 ? (
                    <p>Aucun élément trouvé.</p>
                ) : (
                    <div className="records-grid">
                        {records.map(record => (
                            <div key={record.id} className="record-card">
                                <h4>{record.name || 'Sans nom'}</h4>
                                <p><strong>Notes:</strong> {record.notes || 'Aucune note'}</p>
                                <p><strong>Statut:</strong> 
                                    <select
                                        value={record.status || 'Todo'}
                                        onChange={(e) => handleUpdateStatus(record.id, e.target.value)}
                                    >
                                        <option value="Todo">Todo</option>
                                        <option value="In progress">In progress</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </p>
                                {record.assignee && (
                                    <p><strong>Assigné à:</strong> {record.assignee.name || record.assignee.email}</p>
                                )}
                                {record.attachments && record.attachments.length > 0 && (
                                    <div>
                                        <strong>Pièces jointes:</strong>
                                        <ul>
                                            {record.attachments.map(attachment => (
                                                <li key={attachment.id}>
                                                    <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                                                        {attachment.filename}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <button 
                                    onClick={() => handleDeleteRecord(record.id)}
                                    className="delete-btn"
                                >
                                    Supprimer
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AirtableData; 