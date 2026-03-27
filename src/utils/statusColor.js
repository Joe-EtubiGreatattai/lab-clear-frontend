export const statusColor = (status) => {
  const map = {
    normal:   { bg: 'bg-green-100',  text: 'text-green-700'  },
    abnormal: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    critical: { bg: 'bg-red-100',    text: 'text-red-700'    },
    pending:  { bg: 'bg-gray-100',   text: 'text-gray-500'   },
  };
  return map[status] || map.pending;
};

export const aiStatusColor = (aiStatus) => {
  const map = {
    done:       { bg: 'bg-green-50',  text: 'text-green-600'  },
    failed:     { bg: 'bg-red-50',    text: 'text-red-500'    },
    generating: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
    pending:    { bg: 'bg-gray-50',   text: 'text-gray-400'   },
  };
  return map[aiStatus] || map.pending;
};
