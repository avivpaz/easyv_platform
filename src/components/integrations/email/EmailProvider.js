// src/components/integrations/email/providers/EmailProvider.js
import { Mail, Plus, Trash2 } from 'lucide-react';
import ConnectEmailModal from './ConnectEmailModal';

const GmailIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const EmailProvider = ({ connectedEmails, onConnect, onDisconnect, showConnectModal, setShowConnectModal }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEmailIcon = (provider) => {
    switch (provider) {
      case 'gmail':
        return <GmailIcon />;
      default:
        return <Mail className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Email Accounts</h2>
        <p className="text-sm text-gray-500">Connect email accounts to import CVs automatically</p>
      </div>
      <button
        onClick={() => setShowConnectModal(true)}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors w-full sm:w-auto"
      >
        <Plus className="h-4 w-4" />
        <span>Connect Email</span>
      </button>
    </div>


      <ConnectEmailModal 
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnect={onConnect}
      />

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {connectedEmails.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No emails connected</h3>
            <p className="text-gray-500 mb-4">Connect an email to start importing CVs automatically</p>
            <button
              onClick={() => setShowConnectModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Connect Email</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {connectedEmails.map((email) => (
              <div key={email.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/5 rounded-lg flex items-center justify-center">
                    {getEmailIcon(email.provider)}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{email.email}</h3>
                    <p className="text-sm text-gray-500">
                      Last synced: {formatDate(email.lastSyncTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${email.status === 'active' ? 'bg-green-50 text-green-700' : 
                      email.status === 'error' ? 'bg-red-50 text-red-700' : 
                      'bg-gray-100 text-gray-700'}
                  `}>
                    {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                  </span>
                  <button
                    onClick={() => onDisconnect(email.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailProvider;