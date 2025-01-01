interface ProductRequest {
  id: string;
  product_name: string;
  description: string;
  quantity_needed: number;
  min_price: number;
  max_price: number;
  deadline: string;
  status: string;
  admin_response?: string;
  created_at: string;
  updated_at: string;
}

const ProductRequestDetails: React.FC<{ request: ProductRequest }> = ({ request }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Admin Response Section */}
      {request.admin_response && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Admin Response
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">
              {request.admin_response}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductRequestDetails; 