import React, { useState } from 'react';
import { X, Plus, X as XIcon } from 'lucide-react';
import { jobService } from '../services/jobService';

const CreateJobModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: [],
    niceToHaveSkills: [],
    status: 'active',
    location: '',
    workType: 'hybrid',
    employmentType: 'full-time'
  });

  const [newRequiredSkill, setNewRequiredSkill] = useState('');
  const [newNiceToHaveSkill, setNewNiceToHaveSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  if (!isOpen) return null;

  const handleSubmit = async (e, saveAsDraft = false) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dataToSubmit = {
        ...formData,
        status: saveAsDraft ? 'draft' : 'active'
      };

      await jobService.createJob(dataToSubmit);
      
      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        requiredSkills: [],
        niceToHaveSkills: [],
        status: 'active',
        location: '',
        workType: 'hybrid',
        employmentType: 'full-time'
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addRequiredSkill = () => {
    if (newRequiredSkill.trim()) {
      setFormData({
        ...formData,
        requiredSkills: [...formData.requiredSkills, newRequiredSkill.trim()]
      });
      setNewRequiredSkill('');
    }
  };

  const addNiceToHaveSkill = () => {
    if (newNiceToHaveSkill.trim()) {
      setFormData({
        ...formData,
        niceToHaveSkills: [...formData.niceToHaveSkills, newNiceToHaveSkill.trim()]
      });
      setNewNiceToHaveSkill('');
    }
  };

  const removeRequiredSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter(skill => skill !== skillToRemove)
    });
  };

  const removeNiceToHaveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      niceToHaveSkills: formData.niceToHaveSkills.filter(skill => skill !== skillToRemove)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Job</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
          {/* Basic Information Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Senior Backend Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter job description..."
              />
            </div>
          </section>

          {/* Job Details Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Job Details</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Type
                </label>
                <select
                  value={formData.workType}
                  onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Type
                </label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Tel Aviv, Israel"
              />
            </div>
          </section>

          {/* Skills Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Required Skills & Qualifications</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newRequiredSkill}
                  onChange={(e) => setNewRequiredSkill(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a required skill"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequiredSkill())}
                />
                <button
                  type="button"
                  onClick={addRequiredSkill}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-gray-50 rounded-lg">
                {formData.requiredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeRequiredSkill(skill)}
                      className="hover:text-blue-900"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nice-to-have Skills
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newNiceToHaveSkill}
                  onChange={(e) => setNewNiceToHaveSkill(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a nice-to-have skill"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNiceToHaveSkill())}
                />
                <button
                  type="button"
                  onClick={addNiceToHaveSkill}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-gray-50 rounded-lg">
                {formData.niceToHaveSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeNiceToHaveSkill(skill)}
                      className="hover:text-green-900"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </section>

          <div className="pt-4 mt-8 border-t flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Publish Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobModal;