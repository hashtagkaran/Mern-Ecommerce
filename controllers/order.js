const { Order, ProductCart } = require("../controllers/order");

exports.getOrderbyId = (req, res, next, id) => {
	Order.findById(id)
		.populate("products.product", "name price")
		.exec((err, order) => {
			if (err) {
				return res.status(400).json({
					error: "No order Found in DB",
				});
			}
			req.order = order;
			next();
		});
};

exports.createOrder = (req, res) => {
	//
	req.body.order.user = req.profile;
	const order = new Order(req.body.order);
	order.save((err, order) => {
		if (err) {
			return res.status(400).json({
				error: "Failed to save order in DB",
			});
		}
		res.json(order);
	});
};

exports.getAllOrders = (req, res) => {
	//
	Order.find()
		.populate("user", "_id name")
		.exec((err, order) => {
			if (err) {
				return res.status(400).json({
					error: "No Order Found in DB",
				});
			}
			res.json(order);
		});
};

exports.updateStatus = (req, res) => {
	//
	res.json(Order.schema.path("status").enumValues);
};

exports.getOrderStatus = (req, res) => {
	//
	Order.update(
		{ _id: req.body.orderId },
		{ $set: { status: req.body.status } },
		(err, order) => {
			if (err) {
				return res.status(400).json({
					error: "Cannot Update Order status",
				});
			}
		}
	);
};
