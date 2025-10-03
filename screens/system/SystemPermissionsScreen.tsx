
import React from 'react';

const SystemPermissionsScreen: React.FC = () => {
    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">System Permissions</h1>
            <p className="text-gray-600 dark:text-gray-400">This is the super-admin view for managing all users across all organizations in the system.</p>
            {/* A table of all system users would go here */}
        </div>
    );
};

export default SystemPermissionsScreen;
