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
		// TODO: restriction on fields

		let product = new Product(fields);

		// handle file here
		if (file.photo) {
			if (file.photo.size >> 3000000) {
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
