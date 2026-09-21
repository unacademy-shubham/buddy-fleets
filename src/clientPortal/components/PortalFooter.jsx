import React from 'react';

export default function PortalFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bf-portal-footer">
      <p>© {year}{' '}
        <a href="https://www.instagram.com/buddy_computers" target="_blank" rel="noopener noreferrer">
          <strong>BUDDY</strong> <span>COMPUTERS</span>
        </a>. All Rights Reserved.
      </p>
      <p>DESIGNED BY{' '}
        <a href="https://www.instagram.com/happiest_banda" target="_blank" rel="noopener noreferrer">SHUBHAM JANGIR</a>
      </p>
    </footer>
  );
}
