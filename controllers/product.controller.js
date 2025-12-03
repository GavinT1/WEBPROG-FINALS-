const Product = require('../Models/product.model');

exports.createProduct = async (req, res) => {
    try {
        // This automatically includes the new fields (supplierId, etc.) 
        // because it uses the whole req.body
        const product = new Product(req.body);

        const savedProduct = await product.save();
        res.status(201).json(savedProduct);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    }catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if(product){
            res.json(product);
        }else{
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        // 1. Destructure ALL fields (Added 'price' here)
        const { 
            name, price, brand, description, category, specs, variants, 
            supplierId, unitPrice, costPrice, isActive 
        } = req.body;

        const product = await Product.findById(req.params.id);
        
        if(product){
            // Update Standard Fields
            if (name) product.name = name;
            
            // FIX: Explicitly update the price
            if (price !== undefined) product.price = price; 

            if (brand) product.brand = brand;
            if (description) product.description = description;
            if (category) product.category = category;
            if (specs) product.specs = specs;
            
            // Update Variants
            if (variants) product.variants = variants;

            // Update New Fields
            if (supplierId !== undefined) product.supplierId = supplierId;
            if (unitPrice !== undefined) product.unitPrice = unitPrice;
            if (costPrice !== undefined) product.costPrice = costPrice;
            if (isActive !== undefined) product.isActive = isActive;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProductVariants = async (req, res) => {
    try {
        const productID = req.params.id;
        const { _id, name, price, stock, color, storage, images } = req.body;

        if(!_id){
            return res.status(400).json({ message: 'Product ID is required' });
        }

        const product = await Product.findById(productID);
        if(!product){
            return res.status(404).json({ message: 'Product not found' });
        }

        const variant = product.variants.find(v => v._id.toString() === _id);
        if(!variant){
            return res.status(404).json({ message: 'Variant not found' });
        }
        
        variant.name = name || variant.name;
        variant.price = price || variant.price;
        variant.stock = stock || variant.stock;
        variant.color = color || variant.color;
        variant.storage = storage || variant.storage;
        variant.images = images || variant.images;

        await product.save();
        res.json({ message: 'Variant updated successfully', variant });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        // Find the product by ID and delete it in one step
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error("Delete Error:", error.message);
        res.status(500).json({ message: 'Server error' });
    }
};