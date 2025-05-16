'use client';

import React, { createContext, useState, useEffect } from 'react';

const UserTypeContext = createContext();

export const UserTypeProvider = ({ children }) => {
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const storedUserType = localStorage.getItem('userType');
    if (storedUserType) {
      setUserType(storedUserType);
    } else {
      setUserType('Guest');  
    }
  }, []);

  const updateUserType = (type) => {
    setUserType(type);
    localStorage.setItem('userType', type);
  };

  return (
    <UserTypeContext.Provider value={{ userType, updateUserType }}>
      {children}
    </UserTypeContext.Provider>
  );
};

export default UserTypeContext;