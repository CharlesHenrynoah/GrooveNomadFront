import React, { useState, useEffect } from 'react';
import base, { TABLE_NAME } from '../airtableConfig';

const ConnectionTest = () => {
    const [connectionStatus, setConnectionStatus] = useState('testing');
    const [error, setError] = useState(null);
    const [tableInfo, setTableInfo] = useState(null);

    useEffect(() => {
        testConnection();
    }, []);

    const testConnection = async () => {
        try {
            setConnectionStatus('testing');
            
            // Test simple : récupérer les 3 premiers records pour tester la connexion
            const records = await base(TABLE_NAME).select({
                maxRecords: 3,
                view: "Grid view"
            }).firstPage();
            
            setTableInfo({
                recordCount: records.length,
                tableName: TABLE_NAME,
                records: records.map(record => ({
                    id: record.id,
                    fields: record.fields
                }))
            });
            
            setConnectionStatus('success');
        } catch (err) {
            console.error('Erreur de connexion Airtable:', err);
            setError(err.message);
            setConnectionStatus('error');
        }
    };

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'success': return '#4CAF50';
            case 'error': return '#F44336';
            case 'testing': return '#FF9800';
            default: return '#9E9E9E';
        }
    };

    return (
        <div style={{ 
            padding: '20px', 
            border: '2px solid ' + getStatusColor(), 
            borderRadius: '8px',
            margin: '20px 0',
            backgroundColor: '#f5f5f5'
        }}>
            <h3>🔗 Test de connexion Airtable</h3>
            
            <div style={{ marginBottom: '10px' }}>
                <strong>Status:</strong> 
                <span style={{ 
                    color: getStatusColor(), 
                    fontWeight: 'bold',
                    marginLeft: '10px'
                }}>
                    {connectionStatus === 'testing' && '🔄 Test en cours...'}
                    {connectionStatus === 'success' && '✅ Connexion réussie !'}
                    {connectionStatus === 'error' && '❌ Échec de la connexion'}
                </span>
            </div>

            {error && (
                <div style={{ 
                    color: '#F44336', 
                    backgroundColor: '#FFEBEE', 
                    padding: '10px',
                    borderRadius: '4px',
                    margin: '10px 0'
                }}>
                    <strong>Erreur:</strong> {error}
                </div>
            )}

            {tableInfo && (
                <div style={{ 
                    backgroundColor: '#E8F5E8', 
                    padding: '15px',
                    borderRadius: '4px',
                    margin: '10px 0'
                }}>
                    <h4>📊 Informations de la table</h4>
                    <p><strong>Nom de la table:</strong> {tableInfo.tableName}</p>
                    <p><strong>Nombre d'enregistrements récupérés:</strong> {tableInfo.recordCount}</p>
                    
                    {tableInfo.records.length > 0 && (
                        <div>
                            <strong>Exemple d'enregistrement:</strong>
                            <pre style={{ 
                                backgroundColor: '#f0f0f0', 
                                padding: '10px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                overflow: 'auto'
                            }}>
                                {JSON.stringify(tableInfo.records[0], null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}

            <button 
                onClick={testConnection}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                🔄 Relancer le test
            </button>
        </div>
    );
};

export default ConnectionTest; 