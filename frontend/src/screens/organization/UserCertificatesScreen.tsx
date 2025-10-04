
import React from 'react';

const UserCertificatesScreen: React.FC = () => {
    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">My Certificates</h1>
            <p className="text-gray-600 dark:text-gray-400">This page will list all the certificates you have earned on the platform.</p>
            {/* Certificate list component would go here */}
        </div>
    );
};

export default UserCertificatesScreen;