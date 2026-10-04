import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import './UserManagement.css';


export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // Notification system
  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    const notification = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/role/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users');
      addNotification('Failed to fetch users', 'error');
      console.error(err);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/role/roles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch roles');
      addNotification('Failed to fetch roles', 'error');
      console.error(err);
      setLoading(false);
    }
  };

  const handleManageRoles = (user) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/role/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Refresh users list
        await fetchUsers();
        addNotification(`User "${username}" deleted successfully!`, 'success');
      } catch (err) {
        addNotification(`Failed to delete user "${username}"`, 'error');
        console.error(err);
      }
    }
  };

  const assignRole = async (roleName) => {
    try {
      const token = localStorage.getItem('token');
      await api.put('/role/assign', 
        {
          userId: selectedUser.id,
          roleName: roleName
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Refresh users
      await fetchUsers();
      addNotification(`Role "${roleName}" assigned to ${selectedUser.username} successfully!`, 'success');
      
      // Update selected user for modal
      const updatedUser = users.find(u => u.id === selectedUser.id);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    } catch (err) {
      addNotification(`Failed to assign role "${roleName}" to ${selectedUser.username}`, 'error');
      console.error(err);
    }
  };

  const removeRole = async (roleName) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete('/role/remove', 
        {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            userId: selectedUser.id,
            roleName: roleName
          }
        }
      );
      
      // Refresh users
      await fetchUsers();
      addNotification(`Role "${roleName}" removed from ${selectedUser.username} successfully!`, 'success');
      
      // Update selected user for modal
      const updatedUser = users.find(u => u.id === selectedUser.id);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    } catch (err) {
      addNotification(`Failed to remove role "${roleName}" from ${selectedUser.username}`, 'error');
      console.error(err);
    }
  };

  if (loading) return (
    <div className="user-management">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading users and roles...</p>
      </div>
    </div>
  );

  if (error && users.length === 0) return (
    <div className="user-management">
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button onClick={() => {
          setError('');
          setLoading(true);
          fetchUsers();
          fetchRoles();
        }} className="retry-btn">
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="user-management">
      {/* Notifications Container */}
      <div className="notifications-container">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`notification ${notification.type}`}
          >
            <div className="notification-content">
              <span className="notification-icon">
                {notification.type === 'success' ? '✓' : 
                 notification.type === 'error' ? '✕' : 
                 notification.type === 'warning' ? '⚠' : 'ℹ'}
              </span>
              <span className="notification-message">{notification.message}</span>
            </div>
            <button 
              className="notification-close"
              onClick={() => removeNotification(notification.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="user-management-header">
        <h1>User Management</h1>
        <p>Manage users and their role assignments</p>
         <button className="back-to-records-btn" onClick={() => window.history.back()}>
          <span className="back-icon">←</span>
          Back to Records
        </button>
      </div>

      {users.length === 0 ? (
        <div className="no-users">
          <div className="no-users-icon">👥</div>
          <h3>No Users Found</h3>
          <p>There are currently no users in the system.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span>{user.username}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <div className="roles-container">
                      {user.roles.length > 0 ? (
                        user.roles.map(role => (
                          <span key={role} className="role-badge">{role}</span>
                        ))
                      ) : (
                        <span className="no-roles">No roles assigned</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-primary"
                        onClick={() => handleManageRoles(user)}
                      >
                        Manage Roles
                      </button>
                      <button 
                        className="btn-danger"
                        onClick={() => handleDeleteUser(user.id, user.username)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Role Management Modal */}
      {showRoleModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Manage Roles for {selectedUser.username}</h3>
              <button 
                className="modal-close-x"
                onClick={() => setShowRoleModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="role-section">
                <h4>Current Roles ({selectedUser.roles.length})</h4>
                <div className="current-roles">
                  {selectedUser.roles.length > 0 ? (
                    selectedUser.roles.map(role => (
                      <div key={role} className="role-item">
                        <span className="role-name">{role}</span>
                        <button 
                          className="remove-btn"
                          onClick={() => removeRole(role)}
                          title={`Remove ${role} role`}
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="no-current-roles">No roles currently assigned</p>
                  )}
                </div>
              </div>

              <div className="role-section">
                <h4>Available Roles</h4>
                <div className="available-roles">
                  {roles.filter(role => !selectedUser.roles.includes(role.name)).length > 0 ? (
                    roles.filter(role => !selectedUser.roles.includes(role.name)).map(role => (
                      <button 
                        key={role.id} 
                        className="assign-btn"
                        onClick={() => assignRole(role.name)}
                        title={`Assign ${role.name} role`}
                      >
                        <span className="assign-icon">+</span>
                        Assign {role.name}
                      </button>
                    ))
                  ) : (
                    <p className="no-available-roles">All available roles are already assigned</p>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="close-modal-btn"
                onClick={() => setShowRoleModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}