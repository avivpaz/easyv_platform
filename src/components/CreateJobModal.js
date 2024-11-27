import React, { useState } from 'react';
import { X, Plus, Building2, MapPin, Briefcase, GraduationCap } from 'lucide-react';
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
  const [skillInputs, setSkillInputs] = useState({ required: '', niceToHave: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e, saveAsDraft = false) => {
    e.preventDefault();
    setLoading(true);
    try {
      await jobService.createJob({ ...formData, status: saveAsDraft ? 'draft' : 'active' });
      setFormData({
        title: '', description: '', requiredSkills: [], niceToHaveSkills: [],
        status: 'active', location: '', workType: 'hybrid', employmentType: 'full-time'
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create job.');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (type) => {
    const input = skillInputs[type].trim();
    if (input) {
      const field = type === 'required' ? 'requiredSkills' : 'niceToHaveSkills';
      setFormData({ ...formData, [field]: [...formData[field], input] });
      setSkillInputs({ ...skillInputs, [type]: '' });
    }
  };

  const removeSkill = (type, skillToRemove) => {
    const field = type === 'required' ? 'requiredSkills' : 'niceToHaveSkills';
    setFormData({
      ...formData,
      [field]: formData[field].filter(skill => skill !== skillToRemove)
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Create New Job</h2>
            <p className="text-sm text-gray-500 mt-1">Fill in the details to post a new job opening</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-8">
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
            <section>
              <h3 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                <Building2 className="h-5 w-5 mr-2 text-blue-500" />
                Basic Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    placeholder="e.g. Senior Frontend Developer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
                    placeholder="Describe the role, responsibilities, and ideal candidate..."
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                Job Details
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Work Type</label>
                  <select
                    value={formData.workType}
                    onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="h-4 w-4 inline mr-1 text-gray-400" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. San Francisco, CA or Remote"
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                <GraduationCap className="h-5 w-5 mr-2 text-blue-500" />
                Skills & Qualifications
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skillInputs.required}
                      onChange={(e) => setSkillInputs({ ...skillInputs, required: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('required'))}
                      className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add a required skill"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill('required')}
                      className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-gray-50 rounded-xl border border-gray-100">
                    {formData.requiredSkills.map((skill, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill('required', skill)}
                          className="hover:text-blue-900"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nice-to-have Skills</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skillInputs.niceToHave}
                      onChange={(e) => setSkillInputs({ ...skillInputs, niceToHave: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('niceToHave'))}
                      className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add a nice-to-have skill"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill('niceToHave')}
                      className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-gray-50 rounded-xl border border-gray-100">
                    {formData.niceToHaveSkills.map((skill, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill('niceToHave', skill)}
                          className="hover:text-emerald-900"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </form>
        </div>

        <div className="border-t bg-gray-50 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-white"
          >
            Cancel
          </button>

          <button
            onClick={(e) => handleSubmit(e, false)}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish Job'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateJobModal;