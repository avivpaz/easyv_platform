import React, { useState, useRef, useEffect } from 'react';
import { MessageSquarePlus, Bug, Lightbulb, X, Camera, Send } from 'lucide-react';
import {helpService} from '../services/helpService'
const HelpWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState('feature');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitted, setSubmitted] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const MAX_FILES = 3;

  const getCurrentTotalSize = () => {
    return attachments.reduce((total, att) => total + att.file.size, 0);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = MAX_FILES - attachments.length;
    
    if (remainingSlots <= 0) {
      alert('Maximum 3 images allowed');
      return;
    }

    // Calculate total size including existing files
    const currentTotalSize = getCurrentTotalSize();
    const newFiles = files.slice(0, remainingSlots).filter(file => {
      const newTotalSize = currentTotalSize + file.size;
      if (newTotalSize > MAX_TOTAL_SIZE) {
        alert(`Adding this image would exceed the 5MB total limit`);
        return false;
      }
      return true;
    });

    const newAttachments = newFiles.map(file => ({
      id: Math.random().toString(36).slice(2, 9),
      file,
      preview: URL.createObjectURL(file)
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    setAttachments(prev => {
      const removed = prev.find(att => att.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter(att => att.id !== id);
    });
  };

// Update the handleSubmit function in your HelpWidget component
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await helpService.submitHelp({
      category,
      title,
      description,
      email,
      priority: category === 'bug' ? priority : undefined,
      attachments
    });
    
    setSubmitted(true);
    
    // Reset form after successful submission
    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
      setCategory('feature');
      setTitle('');
      setDescription('');
      setEmail('');
      setPriority('medium');
      setAttachments(prev => {
        prev.forEach(att => URL.revokeObjectURL(att.preview));
        return [];
      });
    }, 2000);

  } catch (error) {
    // Handle error - you might want to show an error message to the user
    console.error('Failed to submit help request:', error);
    alert('Failed to submit help request. Please try again.');
  }
};

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      attachments.forEach(att => URL.revokeObjectURL(att.preview));
    };
  }, []);

  const CategoryButton = ({ value, icon: Icon, label, color }) => (
    <button
      type="button"
      onClick={() => setCategory(value)}
      className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${
        category === value
          ? `${color} shadow-lg transform scale-105`
          : 'bg-gray-50 hover:bg-gray-100'
      }`}
    >
      <Icon className={`w-6 h-6 mb-2 ${category === value ? 'text-white' : 'text-gray-600'}`} />
      <span className={`text-sm font-medium ${category === value ? 'text-white' : 'text-gray-600'}`}>
        {label}
      </span>
    </button>
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg flex items-center space-x-2 transition-all duration-200 hover:scale-105"
        >
          <MessageSquarePlus className="w-6 h-6" />
          <span className="font-medium">Help</span>
        </button>
      ) : (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-6">
          <div className="fixed inset-0 bg-black/25" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full sm:w-96 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Help</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {submitted ? (
                <div className="text-center py-12 px-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Thank you!</h3>
                  <p className="text-gray-600">We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      What type of help do you need?
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <CategoryButton
                        value="feature"
                        icon={Lightbulb}
                        label="Feature"
                        color="bg-blue-600"
                      />
                      <CategoryButton
                        value="bug"
                        icon={Bug}
                        label="Bug"
                        color="bg-red-600"
                      />
                      <CategoryButton
                        value="help"
                        icon={MessageSquarePlus}
                        label="Help"
                        color="bg-green-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Brief summary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg h-32 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Please provide details..."
                      required
                    />
                  </div>

                  {category === 'bug' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Priority Level
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all duration-200"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="For follow-up questions"
                    />
                  </div>

                  <div className="space-y-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                      multiple
                    />
                    
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={attachments.length >= MAX_FILES || getCurrentTotalSize() >= MAX_TOTAL_SIZE}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                          attachments.length >= MAX_FILES || getCurrentTotalSize() >= MAX_TOTAL_SIZE
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                      >
                        <Camera className="w-5 h-5" />
                        <span className="text-sm font-medium">Add Screenshots</span>
                      </button>
                      <div className="text-sm text-gray-500 flex flex-col items-end">
                        <span>{attachments.length}/3 images</span>
                      </div>
                    </div>

                    {attachments.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {attachments.map((att) => (
                          <div key={att.id} className="relative group">
                            <img
                              src={att.preview}
                              alt="Screenshot preview"
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeAttachment(att.id)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Send className="w-5 h-5" />
                    <span>Submit</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpWidget;