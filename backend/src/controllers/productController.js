import products from '../data/product.js';

const getProducts = (request, response) => {
  response.status(200).json({
    message: 'Products retrieved successfully',
    data: products,
  });
};

export { getProducts };