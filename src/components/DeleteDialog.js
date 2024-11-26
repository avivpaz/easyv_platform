// components/DeleteDialog.js
export const DeleteDialog = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Delete Item",
    message = "Are you sure you want to delete this item? This action cannot be undone.",
    confirmButtonText = "Delete",
    cancelButtonText = "Cancel"
  }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">
            {message}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {cancelButtonText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default DeleteDialog;