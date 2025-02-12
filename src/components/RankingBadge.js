const RankingBadge = ({ category }) => {
    const variants = {
      'Highly Relevant': 'bg-green-50 text-green-700 border-green-200',
      'Relevant': 'bg-blue-50 text-blue-700 border-blue-200',
      'Not Relevant': 'bg-gray-50 text-gray-700 border-gray-200'
    };
  
    return (
      <span className={`${variants[category]} px-2 py-1 text-xs font-medium rounded-full border`}>
        {category}
      </span>
    );
};

export default RankingBadge;