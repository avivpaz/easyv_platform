import { useState } from 'react';
import { X, Plus, CheckCircle2 } from 'lucide-react';

const JobForm = ({ onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    company: '',
    location: '',
    workType: 'full-time',
    employmentType: 'permanent',
    description: '',    
    requiredSkills: [],
    niceToHaveSkills: [],
    status: 'draft'
  });
  const [skillInput, setSkillInput] = useState('');
  const [niceToHaveInput, setNiceToHaveInput] = useState('');

  const handleSkillAdd = (type) => {
    const input = type === 'required' ? skillInput : niceToHaveInput;
    const field = type === 'required' ? 'requiredSkills' : 'niceToHaveSkills';
    
    if (input.trim()) {
      setFormData({
        ...formData,
        [field]: [...formData[field], input.trim()]
      });
      type === 'required' ? setSkillInput('') : setNiceToHaveInput('');
    }
  };

  const removeSkill = (index, type) => {
    const field = type === 'required' ? 'requiredSkills' : 'niceToHaveSkills';
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index)
    });
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(formData);
    }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">Job Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. Senior Software Engineer"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">Company</label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Company name"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. New York, NY or Remote"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">Work Type</label>
          <select
            value={formData.workType}
            onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">Job Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
          placeholder="Describe the role, responsibilities, and requirements..."
          required
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">Required Skills</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSkillAdd('required'))}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a required skill"
            />
            <button
              type="button"
              onClick={() => handleSkillAdd('required')}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.requiredSkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium flex items-center gap-1"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(index, 'required')}
                  className="hover:text-blue-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">Nice to Have Skills</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={niceToHaveInput}
              onChange={(e) => setNiceToHaveInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSkillAdd('nice'))}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a nice to have skill"
            />
            <button
              type="button"
              onClick={() => handleSkillAdd('nice')}
              className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.niceToHaveSkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm font-medium flex items-center gap-1"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(index, 'nice')}
                  className="hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 flex gap-4 justify-end border-t">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <CheckCircle2 className="h-5 w-5" />
          {initialData ? 'Update Job' : 'Create Job'}
        </button>
      </div>
    </form>
  );
}

export default JobForm;