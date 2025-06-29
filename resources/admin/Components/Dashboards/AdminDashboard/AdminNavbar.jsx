import { Link } from '@inertiajs/react';
import React, { useState } from 'react';

const AdminNavbar = ({ onLinkClick }) => {
  const [activeItem, setActiveItem] = useState('Dashboard');

  const menuItems = [
    'Dashboard',
    'Manage Farms',
    'Manage Users',
    'Financial Reports',
    'System Settings',
    'Roles',
    'Help & Support'
  ];

  return (
    <div
      style={{
        width: '280px',
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #dee2e6',
        padding: '1.5rem 1rem',
        height: '100vh',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.5rem',
          marginBottom: '2rem',
          borderBottom: '1px solid #dee2e6',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: '#0d6efd',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px',
          }}
        >
          AP
        </div>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#212529' }}>
          Admin Panel
        </h3>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {menuItems.map((item) => (
          <li key={item}>
            <button
              onClick={() => {
                setActiveItem(item);
                onLinkClick(item);
              }}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: activeItem === item ? '#e7f1ff' : 'transparent',
                color: activeItem === item ? '#0d6efd' : '#495057',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              {item}
            </button>
          </li>
        ))}
        <Link
          href={route('admin.logout')}
          method="post"
          as="button"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: 'transparent',
            color: '#495057',
            border: 'none',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Log Out
        </Link>
      </ul>
    </div>
  );
};

export default AdminNavbar;
