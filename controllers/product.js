const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

exports.getProductById = (req, res, next, id) => {
	//
	Product.findById(id).exec((err, product) => {
		if (err) {
			return res.status(400).json({
				error: "Product NOt Found",
			});
		}
		req.product = product;
		next();
	});
};

exports.createProduct = (req, res) => {
	//
	let form = new formidable.IncomingForm();
	form.keepExtensions = true;

	form.parse(req, (err, fields, file) => {
		if (err) {
			return res.status(400).json({
				error: "problem with uploaded image",
			});
		}

		// destructure the fields
		const { name, description, price, category, stock } = fields;

		if (!name || !description || !price || !category || !stock) {
			return res.status(400).json({
				error: "Please include all fields",
			});
		}

		// TODO: restriction on fields

		let product = new Product(fields);

		// handle file here
		if (file.photo) {
			if (file.photo.size > 3000000) {
				return res.status(400).json({
					error: "File size too big!!",
				});
			}
			product.photo.data = fs.readFileSync(file.photo.path);
			product.photo.contentType = file.photo.type;
		}
		// SAVE TO THE DB
		product.save((err, product) => {
			if (err) {
				return res.status(400).json({
					error: "SAving TShirt in DB Failed!!",
				});
			}
			res.json(product);
		});
	});
};

exports.getProduct = (req, res) => {
	req.product.photo = undefined;
	return res.json(req.product);
};

// middleware
exports.photo = (req, res, next) => {
	if (req.product.photo.data) {
		res.set("Content-Type", req.product.photo.contentType);
		return res.send(req.product.photo.data);
	}
	next();
};

// delete product controller
exports.deleteProduct = (req, res) => {
	let product = req.product;
	product.remove((err, deletedProduct) => {
		if (err) {
			return res.status(400).json({
				error: "Failed to delete product",
			});
		}
		res.json({
			message: "Deletion was a success",
			deletedProduct,
		});
	});
};

// update product controller

exports.updateProduct = (req, res) => {
	//
	let form = new formidable.IncomingForm();
	form.keepExtensions = true;

	form.parse(req, (err, fields, file) => {
		if (err) {
			return res.status(400).json({
				error: "problem with uploaded image",
			});
		}

		// destructure the fields
		const { name, description, price, category, stock } = fields;

		// updation code

		let product = req.product;
		product = _.extend(product, fields);

		// handle file here
		if (file.photo) {
			if (file.photo.size > 3000000) {
				return res.status(400).json({
					error: "File size too big!!",
				});
			}
			product.photo.data = fs.readFileSync(file.photo.path);
			product.photo.contentType = file.photo.type;
		}

		// SAVE TO THE DB

		product.save((err, product) => {
			if (err) {
				return res.status(400).json({
					error: "Product Updation Failed",
				});
			}
			res.json(product);
		});
	});
};

// product listing
exports.getAllProducts = (req, res) => {
	// limiting number of products
	let limit = req.query.limit ? parseInt(req.query.limit) : 8;
	let sortBy = req.query.sortBy ? req.query.sortBy : "_id  ";

	Product.find()
		.select("-photo")
		.populate("category")
		.sort([[sortBy, "asc"]])
		.limit(limit)
		.exec((ewrr, products) => {
			if (err) {
				return res.status(400).json({
					error: "No product FOund",
				});
			}
			res.json(products);
		});
};

exports.getAllUniqueCategory = (req, res) => {
	Product.distinct("category", {}, (err, category) => {
		if (err) {
			return res.status(400).json({
				error: "No Category Found",
			});
		}
		res.json(category);
	});
};

// update stock and sold using bulkWrite
exports.updateStock = (req, res, next) => {
	//
	let myOperations = req.body.order.products.map((prod) => {
		//
		return {
			updateOne: {
				filter: { _id: prod },
				update: { $inc: { stock: -prod.count, sold: +prod.count } },
			},
		};
	});

	Product.bulkWrite(myOperations, {}, (err, products) => {
		if (err) {
			return res.status(400).json({
				error: "Bulk operation Failed",
			});
		}
	});

	next();
};
