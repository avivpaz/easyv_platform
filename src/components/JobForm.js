import { useState } from 'react';

const JobForm=({ onSubmit, initialData = null }) =>{
  const [formData, setFormData] = useState(initialData || {
    title: '',
    company: '',
    location: '',
    type: '',
    salary: '',
    description: '',    
    requirements: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>
      {/* Add other fields similarly */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      >
        {initialData ? 'Update Job' : 'Create Job'}
      </button>
    </form>
  );
}

export default JobForm;